import { Gender } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateParentDto {
  // Compte utilisateur
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  password!: string;

  // Infos personnelles
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  lastName!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString({}, { message: 'Date de naissance invalide' })
  @IsNotEmpty({ message: 'La date de naissance est obligatoire' })
  dateOfBirth!: string;

  @IsNotEmpty({ message: 'Le genre est obligatoire' })
  gender!: Gender;
  // Enfants liés
  @IsArray()
  @IsOptional()
  children?: {
    studentId: string;
    relation: string; // "père", "mère", "tuteur"
  }[];
}