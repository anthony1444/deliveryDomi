export interface Barrio {
    Id: number;
    Name: string;
    Price: string | number;
    Idzone: number;
  }
  
  export interface Zona {
    Id: number;
    Name: string;
    Idtabulador: number;
    Neiborhood: Barrio[]; // Relación de uno a muchos con Barrio
  }
  
  export interface Tabulador {
    Id: number;
    Name: string;
    Zones: Zona[]; // Relación de uno a muchos con Zona
  }
  