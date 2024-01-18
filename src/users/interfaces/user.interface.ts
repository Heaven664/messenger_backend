export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  imageSrc: string | null;
  residency: string | null;
  lastSeenPermission: boolean;
  lastSeenTime: number | null;
}

export type UserWithoutPassword = Omit<User, 'password'>;

export interface InitialUserData {
  name: string;
  email: string;
  password: string;
}
