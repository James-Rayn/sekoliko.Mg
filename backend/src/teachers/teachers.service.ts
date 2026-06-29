import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTeacherDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const teacher = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: 'TEACHER',
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
          phone: dto.phone,
          address: dto.address,
          dateOfBirth: dto.dateOfBirth,
          speciality: dto.speciality,
          userId: user.id,
        },
      });

      if (dto.subjectIds && dto.subjectIds.length > 0) {
        await tx.subjectTeacher.createMany({
          data: dto.subjectIds.map((subjectId) => ({
            teacherId: teacher.id,
            subjectId,
          })),
        });
      }

      return teacher;
    });

    return {
      message: 'Enseignant créé avec succès',
      teacher,
    };
  }

  async findAll(filters?: { isActive?: boolean; speciality?: string }) {
    const teachers = await this.prisma.teacher.findMany({
      where: {
        ...(filters?.isActive !== undefined && {
          isActive: filters.isActive,
        }),
        ...(filters?.speciality && {
          speciality: { contains: filters.speciality, mode: 'insensitive' },
        }),
      },
      include: {
        user: { select: { email: true } },
        subjects: {
          include: {
            subject: {
              select: { name: true, code: true },
            },
          },
        },
        schedules: {
          select: { classId: true },
          distinct: ['classId'],
        },
      },
      orderBy: { lastName: 'asc' },
    });

    return {
      total: teachers.length,
      teachers,
    };
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true } },
        subjects: {
          include: { subject: true },
        },
        schedules: {
          include: {
            class: { select: { name: true, level: true } },
            subject: { select: { name: true } },
          },
          orderBy: { dayOfWeek: 'asc' },
        },
        grades: {
          orderBy: { gradedAt: 'desc' },
          take: 10,
          include: {
            student: { select: { firstName: true, lastName: true } },
            subject: { select: { name: true } },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Enseignant avec l'ID ${id} introuvable`);
    }

    return teacher;
  }

  async update(id: string, dto: UpdateTeacherDto) {
    await this.findOne(id);

    const updated = await this.prisma.teacher.update({
      where: { id },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.address && { address: dto.address }),
        ...(dto.speciality && { speciality: dto.speciality }),
      },
      include: {
        user: { select: { email: true } },
        subjects: { include: { subject: true } },
      },
    });

    return {
      message: 'Enseignant mis à jour avec succès',
      teacher: updated,
    };
  }

  async assignSubjects(teacherId: string, subjectIds: string[]) {
    await this.findOne(teacherId);

    await this.prisma.$transaction(async (tx) => {

      await tx.subjectTeacher.deleteMany({
        where: { teacherId },
      });

      await tx.subjectTeacher.createMany({
        data: subjectIds.map((subjectId) => ({
          teacherId,
          subjectId,
        })),
      });
    });

    return {
      message: 'Matières assignées avec succès',
    };
  }

  async deactivate(id: string) {
    await this.findOne(id);

    await this.prisma.teacher.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Enseignant désactivé avec succès' };
  }

  async reactivate(id: string) {
    await this.findOne(id);

    await this.prisma.teacher.update({
      where: { id },
      data: { isActive: true },
    });

    return { message: 'Enseignant réactivé avec succès' };
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.prisma.teacher.count(),
      this.prisma.teacher.count({ where: { isActive: true } }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
    };
  }
}