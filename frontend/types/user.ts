export type Role = 
| 'ADMIN'
| 'TEACHER'
| 'PARENT'
| 'ACCOUNTANT'
| 'STUDENT'
| 'SUPER_ADMIN';

export interface User {
    id: string;
    email: string;
    role: Role;
}

export interface AuthResponse {
    access_token: string,
    user: User;
}