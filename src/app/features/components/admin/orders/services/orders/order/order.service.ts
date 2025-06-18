// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { Order } from '../../../interfaces/Order';
// // import { environment } from '../../../../../../../../environments/environment';

// @Injectable({ providedIn: 'root' })
// export class OrderService {

//   private apiUrl = `${environment.apiUrl}ordercreate`; 
//   private apiKey = environment.apiKey;  // Reemplaza 'TU_CLAVE_AQUI' por tu clave real

//   constructor(private http: HttpClient) { }

//   createOrder(order: Order): Observable<any> {
//     return this.http.post(this.apiUrl, order,{ headers: this.getHeaders() });
//   }
//    private getHeaders(): HttpHeaders {
//       return new HttpHeaders({
//         'x-functions-key': this.apiKey
//       });
//     }

// }
