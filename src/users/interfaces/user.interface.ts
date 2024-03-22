export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  imageSrc: string | null;
  residency: string | null;
  lastSeenPermission: boolean;
  lastSeenTime: number | null;
  isOnline: boolean;
}

export type UserWithoutPassword = Omit<User, 'password'>;
