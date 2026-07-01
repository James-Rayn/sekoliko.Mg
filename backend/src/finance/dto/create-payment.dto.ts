import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNumber({}, { message: 'Le montant doit être un nombre' })
  @Min(0)
  amount!: number;

  @IsString()
  @IsOptional()
  method?: string; // "espèces", "mobile money"

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty({ message: "L'élève est obligatoire" })
  studentId!: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Le type de frais est obligatoire' })
  feeTypeId!: string;
}