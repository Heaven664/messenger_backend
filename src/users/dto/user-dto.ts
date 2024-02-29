export class UpdateUserInfoDto {
  id: string;
  name: string;
  email: string;
  residency: string;
}

export class UpdateLastSeenDto {
  id: string;
  lastSeenPermission: boolean;
}
