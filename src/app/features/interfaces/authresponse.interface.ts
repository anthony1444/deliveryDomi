export interface AuthResponse {
    token: string;
    user: User;
  }
  
  export interface User {
    id: number;
    uid: string;
    firstName: string;
    typeUser:string;
    lastName: string;
    name:string;
    email: string;
    username: string;
    password: string | null;
    createdAt: string;
    lastAccessedAt: string | null;
  }
  