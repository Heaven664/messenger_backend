import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserInfoDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  residency: string | null;
}

export class UpdateLastSeenDto {
  @IsString()
  id: string;

  @IsBoolean()
  lastSeenPermission: boolean;
}
