import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateTeacherDto {
  // Compte utilisateur
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  password!: string;

  // Informations personnelles
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  lastName!: string;

  @IsString()
  @IsNotEmpty({message: 'Date de naissance obligatoire'})
  dateOfBirth!: string;

  @IsEnum(Gender, { message: 'Genre invalide' })
  gender!: Gender;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  speciality?: string; // Ex: "Mathématiques", "Sciences"

  // Liste des IDs des matières assignées
  @IsArray()
  @IsOptional()
  subjectIds?: string[];
}