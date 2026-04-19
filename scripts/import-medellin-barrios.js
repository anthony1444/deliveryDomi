/**
 * Script de importación de barrios de Medellín a Firebase
 * Fuente: OpenStreetMap via Overpass API
 * Destino: Firebase Firestore (colección 'zones') via REST API
 * 
 * Uso: node scripts/import-medellin-barrios.js
 * No requiere dependencias extra - solo Node.js nativo
 */

const https = require('https');

const PROJECT_ID = 'delivery-fffde';

const COLORS = [
  '#f44336','#e91e63','#9c27b0','#673ab7','#3f51b5','#2196f3',
  '#03a9f4','#00bcd4','#009688','#4caf50','#8bc34a','#cddc39',
  '#ffc107','#ff9800','#ff5722','#795548','#607d8b','#e64a19',
  '#0288d1','#00897b','#43a047','#f57c00','#6d4c41','#546e7a'
];

let colorIndex = 0;
function nextColor() {
  return COLORS[colorIndex++ % COLORS.length];
}

// ---- HTTP HELPER ----
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: { 'User-Agent': 'deliveryDomi-importer/1.0' }
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

// ---- OVERPASS QUERY ----
// Busca ways y relations etiquetados como barrios dentro del bbox de Medellín
async function fetchFromOverpass() {
  // Bbox de Medellín: sur,oeste,norte,este
  const bbox = '6.10,-75.75,6.45,-75.40';

  // Dos consultas separadas: una para ways, otra para relations
  // Sin regex para evitar problemas de codificación
  const query = `[out:json][timeout:120];
(
  way["place"="neighbourhood"]["name"](${bbox});
  relation["place"="neighbourhood"]["name"](${bbox});
  way["landuse"="residential"]["name"](${bbox});
);
out body geom;`;

  const encoded = encodeURIComponent(query);
  const url = `https://overpass-api.de/api/interpreter?data=${encoded}`;

  console.log('📡 Consultando Overpass API...');
  const { status, body } = await httpGet(url);

  if (status !== 200) {
    throw new Error(`Overpass retornó HTTP ${status}: ${body.substring(0, 300)}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch(e) {
    // Mostrar primeros 500 chars para debug
    throw new Error(`Respuesta no es JSON. Inicio: ${body.substring(0, 500)}`);
  }

  return parsed.elements || [];
}

// ---- CONVERTIR ELEMENTO OSM A GEOJSON ----
function elementToGeoJSON(el) {
  try {
    if (el.type === 'way' && el.geometry && el.geometry.length >= 4) {
      // Way: geometry es array de {lat, lon}
      const coords = el.geometry.map(p => [p.lon, p.lat]);
      // Cerrar el polígono si no está cerrado
      if (coords[0][0] !== coords[coords.length-1][0] || coords[0][1] !== coords[coords.length-1][1]) {
        coords.push(coords[0]);
      }
      return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} };
    }

    if (el.type === 'relation' && el.members) {
      // Relation: buscar el miembro outer con geometría
      const outers = el.members.filter(m => m.role === 'outer' && m.geometry && m.geometry.length >= 4);
      if (outers.length === 0) return null;

      const rings = outers.map(m => {
        const coords = m.geometry.map(p => [p.lon, p.lat]);
        if (coords[0][0] !== coords[coords.length-1][0] || coords[0][1] !== coords[coords.length-1][1]) {
          coords.push(coords[0]);
        }
        return coords;
      });

      const geometryType = rings.length === 1 ? 'Polygon' : 'MultiPolygon';
      const coordinates = rings.length === 1 ? rings : rings.map(r => [r]);

      return { type: 'Feature', geometry: { type: geometryType, coordinates }, properties: {} };
    }
  } catch(e) {
    return null;
  }
  return null;
}

// ---- GUARDAR EN FIREBASE via REST ----
function postToFirestore(area) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      fields: {
        name:       { stringValue: area.name },
        color:      { stringValue: area.color },
        price:      { integerValue: '0' },
        geoJson:    { stringValue: JSON.stringify(area.geoJson) },
        source:     { stringValue: 'OpenStreetMap' },
        importedAt: { stringValue: new Date().toISOString() }
      }
    });

    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/zones`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve();
        else reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0,200)}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ---- MAIN ----
async function main() {
  console.log('==============================================');
  console.log('  🗺️  Importador de Barrios de Medellín');
  console.log('  Fuente: OpenStreetMap | Destino: Firebase');
  console.log('==============================================\n');

  // 1. Obtener elementos de Overpass
  let elements;
  try {
    elements = await fetchFromOverpass();
  } catch(e) {
    console.error('❌ Error en Overpass:', e.message);
    process.exit(1);
  }

  console.log(`📊 Elementos recibidos de OSM: ${elements.length}`);

  if (elements.length === 0) {
    console.error('❌ No se encontraron elementos. Revisa la consulta.');
    process.exit(1);
  }

  // 2. Convertir a áreas
  const areas = [];
  let skipped = 0;
  const seen = new Set();

  for (const el of elements) {
    const name = el.tags?.name || el.tags?.['name:es'] || null;
    if (!name) { skipped++; continue; }
    if (seen.has(name)) { skipped++; continue; } // evitar duplicados

    const geoJson = elementToGeoJSON(el);
    if (!geoJson) { skipped++; continue; }

    seen.add(name);
    areas.push({ name, color: nextColor(), geoJson });
  }

  console.log(`✅ Barrios con geometría válida: ${areas.length}`);
  console.log(`⚠️  Saltados (sin geo o duplicados): ${skipped}\n`);

  // 3. Importar a Firebase
  let ok = 0, err = 0;
  console.log('🔥 Importando a Firebase Firestore...');
  console.log('   NOTA: Si ves errores 403, ajusta temporalmente las reglas de Firestore a allow write: if true;\n');

  for (const area of areas) {
    try {
      await postToFirestore(area);
      ok++;
    } catch(e) {
      err++;
      if (err <= 3) console.error(`   ❌ Error guardando "${area.name}": ${e.message}`);
    }
    process.stdout.write(`\r   ✅ ${ok}/${areas.length}  ❌ ${err}`);
  }

  console.log(`\n\n🎉 Importación completada: ${ok} guardados, ${err} errores.`);
  if (ok > 0) {
    console.log('   Ve a "Áreas de Mapa" en tu app para ver todos los barrios.\n');
  }
  if (err > 0) {
    console.log('⚠️  Si hubo errores 403, asegúrate que las reglas de Firestore permitan escritura.\n');
  }
}

main().catch(console.error);
