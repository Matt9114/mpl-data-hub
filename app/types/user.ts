// app/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'guest' | 'user' | 'manager' | 'admin';
}