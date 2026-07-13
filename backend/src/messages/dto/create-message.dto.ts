import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Le sujet est obligatoire' })
  subject!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le contenu est obligatoire' })
  body!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le destinataire est obligatoire' })
  receiverId!: string; // ID de l'utilisateur destinataire
}