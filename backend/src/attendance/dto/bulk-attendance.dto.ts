import { AttendanceStatus } from "@prisma/client";
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';

class SutendAttendance {
    @IsString()
    @IsNotEmpty()
    studentId!: string;

    @IsEnum(AttendanceStatus)
    status!: AttendanceStatus;

    @IsString()
    @IsOptional()
    reason?: string;
}

export class BulkAttendanceDto {
    @IsDateString({}, {message: 'Date invalide'})
    @IsNotEmpty({message: 'La date est obligatoire'})
    date!: string;

    @IsString()
    @IsNotEmpty({message: 'La classe est obligatoire'})
    classId!: string;

    @IsArray()
    @ValidateNested({each: true})
    @Type(()=> SutendAttendance)
    attendances!: SutendAttendance[];
}