import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le contenu est obligatoire' })
  content!: string;

  @IsEnum(Role)
  @IsOptional()
  targetRole?: Role; // null = tout le monde

  @IsDateString()
  @IsOptional()
  expiresAt?: string; // Date d'expiration optionnelle
}