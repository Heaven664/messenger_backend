export interface User {
  id: string;
  name: string;
  email: string;
  imageSrc: string | null;
  residency: string | null;
  lastSeenPermission: boolean;
  lastSeenTime: number | null;
}

export interface InitialUserData {
  name: string;
  email: string;
}
