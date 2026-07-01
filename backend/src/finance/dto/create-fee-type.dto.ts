import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateFeeTypeDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  name!: string; // Ex: "Frais de scolarité T1"

  @IsNumber({}, { message: 'Le montant doit être un nombre' })
  @Min(0, { message: 'Le montant ne peut pas être négatif' })
  amount!: number; // Ex: 150000

  @IsString()
  @IsNotEmpty({ message: "L'année scolaire est obligatoire" })
  academicYear!: string; // Ex: "2024-2025"

  @IsDateString()
  @IsOptional()
  dueDate?: string; // Date limite de paiement

  @IsString()
  @IsOptional()
  description?: string;
}