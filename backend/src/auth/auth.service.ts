import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from "@prisma/client";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({where : {email}});
        if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect!')

        const isValid = await bcrypt.compare(password, user?.password);
        if (!isValid) throw new UnauthorizedException('Compte désactivé');
    
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }

    async register(email: string, password: string, role: Role) {
        const existing = await this.prisma.user.findUnique({where: {email}});
        if (existing) throw new ConflictException('Email déjà utilisé');

        const hashed = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {email, password: hashed, role},
        });

        return {message: 'Utilisateur créé avec succès', userId: user.id};
    }

    async getProfile(userId: string) {
        return this.prisma.user.findUnique({
            where: {id: userId},
            select: {id: true, email: true, role: true, createdAt: true},
        });
    }

    async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    ) {
    const user = await this.prisma.user.findUnique({
    where: { id: userId },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Vérifier le mot de passe actuel
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
        throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    // Chiffrer le nouveau mot de passe
    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
    });

    return { message: 'Mot de passe modifié avec succès' };
    }
}