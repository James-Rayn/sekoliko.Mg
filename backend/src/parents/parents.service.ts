import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParentDto } from './dto/create-parent.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ParentsService {
  constructor(private prisma: PrismaService) {}

  // ── Créer un parent ──────────────────────────────────────
  async create(dto: CreateParentDto) {
    // Vérifier email unique
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const parent = await this.prisma.$transaction(async (tx) => {
      // 1. Créer le compte utilisateur
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: 'PARENT',
        },
      });

      // 2. Créer le profil parent
      const parent = await tx.parent.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          dateOfBirth: new Date(dto.dateOfBirth),
          gender: dto.gender,
          phone: dto.phone,
          address: dto.address,
          userId: user.id,
        },
      });

      // 3. Lier les enfants si fournis
      if (dto.children && dto.children.length > 0) {
        await tx.parentStudent.createMany({
          data: dto.children.map((child) => ({
            parentId: parent.id,
            studentId: child.studentId,
            relation: child.relation,
          })),
        });
      }

      return parent;
    });

    return {
      message: 'Parent créé avec succès',
      parent,
    };
  }

  // ── Lister tous les parents ──────────────────────────────
  async findAll(search?: string) {
    const parents = await this.prisma.parent.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : undefined,
      include: {
        user: { select: { email: true } },
        children: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                matricule: true,
                class: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    return {
      total: parents.length,
      parents,
    };
  }

  // ── Voir un parent ───────────────────────────────────────
  async findOne(id: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true } },
        children: {
          include: {
            student: {
              include: {
                class: { select: { name: true, level: true } },
              },
            },
          },
        },
        payments: {
          include: {
            feeType: { select: { name: true, amount: true } },
            student: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!parent) throw new NotFoundException('Parent introuvable');
    return parent;
  }

  // ── Lier un enfant à un parent ───────────────────────────
  async linkChild(
    parentId: string,
    studentId: string,
    relation: string,
  ) {
    await this.findOne(parentId);

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Élève introuvable');

    // Vérifier si déjà lié
    const existing = await this.prisma.parentStudent.findUnique({
      where: { parentId_studentId: { parentId, studentId } },
    });
    if (existing) {
      throw new ConflictException('Cet élève est déjà lié à ce parent');
    }

    await this.prisma.parentStudent.create({
      data: { parentId, studentId, relation },
    });

    return { message: 'Enfant lié avec succès' };
  }

  // ── Délier un enfant ─────────────────────────────────────
  async unlinkChild(parentId: string, studentId: string) {
    await this.prisma.parentStudent.delete({
      where: { parentId_studentId: { parentId, studentId } },
    });
    return { message: 'Enfant délié avec succès' };
  }

  // ── Modifier un parent ───────────────────────────────────
  async update(id: string, data: Partial<CreateParentDto>) {
    await this.findOne(id);

    const updated = await this.prisma.parent.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone && { phone: data.phone }),
        ...(data.address && { address: data.address }),
      },
    });

    return { message: 'Parent mis à jour avec succès', parent: updated };
  }

  // ── Statistiques ─────────────────────────────────────────
  async getStats() {
    const [total, withChildren] = await Promise.all([
      this.prisma.parent.count(),
      this.prisma.parent.count({
        where: { children: { some: {} } },
      }),
    ]);

    return { total, withChildren, withoutChildren: total - withChildren };
  }
}