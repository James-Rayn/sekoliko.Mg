import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsDateString,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateStudentDto {
    @IsEmail({}, { message: 'Email invalide' })
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'Le mot de passe est obligatoire'})
    password!: string;

    @IsString()
    @IsNotEmpty({ message: 'Le prénom est obligatoire' })
    firstName!: string;

    @IsString()
    @IsNotEmpty({ message: 'Le nom est obligatoire' })
    lastName!: string;

    @IsDateString({}, { message: 'Date de naissance invalide' })
    dateOfBirth!: string;

    @IsEnum(Gender, { message: 'Genre invalide' })
    gender!: Gender;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    classId?: string;

    @IsString()
    @IsOptional()
    bloodType?: string;

    @IsString()
    @IsOptional()
    medicalNotes?: string;
}

