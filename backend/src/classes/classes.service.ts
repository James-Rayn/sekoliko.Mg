import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClassDto) {
    const existing = await this.prisma.class.findFirst({
      where: {
        name: dto.name,
        academicYear: dto.academicYear,
      },
    });

    if (existing) {
      throw new ConflictException(
        `La classe "${dto.name}" existe déjà pour l'année ${dto.academicYear}`,
      );
    }

    const newClass = await this.prisma.class.create({
      data: {
        name: dto.name,
        level: dto.level,
        academicYear: dto.academicYear,
        capacity: dto.capacity ?? 25, // 40 par défaut
      },
    });

    return {
      message: 'Classe créée avec succès',
      class: newClass,
    };
  }

  async findAll(filters?: { academicYear?: string; level?: string }) {
    const classes = await this.prisma.class.findMany({
      where: {
        ...(filters?.academicYear && {
          academicYear: filters.academicYear,
        }),
        ...(filters?.level && {
          level: { contains: filters.level, mode: 'insensitive' },
        }),
      },
      include: {
        // Nombre d'élèves dans la classe
        _count: {
          select: { students: true },
        },
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' },
      ],
    });

    return {
      total: classes.length,
      classes,
    };
  }

  async findOne(id: string) {
    const classe = await this.prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          where: { isActive: true },
          select: {
            id: true,
            matricule: true,
            firstName: true,
            lastName: true,
            gender: true,
            photoUrl: true,
          },
          orderBy: { lastName: 'asc' },
        },
        schedules: {
          include: {
            subject: { select: { name: true, code: true } },
            teacher: { select: { firstName: true, lastName: true } },
          },
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' },
          ],
        },
        _count: {
          select: { students: true },
        },
      },
    });

    if (!classe) {
      throw new NotFoundException(`Classe avec l'ID ${id} introuvable`);
    }

    return classe;
  }

  async getStudents(classId: string) {
    await this.findOne(classId);

    const students = await this.prisma.student.findMany({
      where: {
        classId,
        isActive: true,
      },
      select: {
        id: true,
        matricule: true,
        firstName: true,
        lastName: true,
        gender: true,
        photoUrl: true,
        user: { select: { email: true } },
      },
      orderBy: { lastName: 'asc' },
    });

    return {
      total: students.length,
      students,
    };
  }

  async getSchedule(classId: string) {
    await this.findOne(classId);

    const schedule = await this.prisma.schedule.findMany({
      where: { classId },
      include: {
        subject: { select: { name: true, code: true, coefficient: true } },
        teacher: { select: { firstName: true, lastName: true } },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    const days = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const organized = days.map((day, index) => ({
      day,
      slots: schedule.filter((s) => s.dayOfWeek === index),
    })).filter((d) => d.day !== '');

    return organized;
  }

  async update(id: string, dto: UpdateClassDto) {
    await this.findOne(id);

    const updated = await this.prisma.class.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.level && { level: dto.level }),
        ...(dto.academicYear && { academicYear: dto.academicYear }),
        ...(dto.capacity && { capacity: dto.capacity }),
      },
    });

    return {
      message: 'Classe mise à jour avec succès',
      class: updated,
    };
  }

  async deactivate(id: string) {
    const classe = await this.findOne(id);

    const activeStudents = await this.prisma.student.count({
      where: { classId: id, isActive: true },
    });

    if (activeStudents > 0) {
      throw new BadRequestException(
        `Impossible de désactiver : ${activeStudents} élève(s) actif(s) dans cette classe`,
      );
    }

    await this.prisma.class.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Classe désactivée avec succès' };
  }

  async getStats(classId: string) {
    await this.findOne(classId);

    const [totalStudents, boys, girls, avgGrades] = await Promise.all([
      this.prisma.student.count({
        where: { classId, isActive: true },
      }),
      this.prisma.student.count({
        where: { classId, isActive: true, gender: 'MALE' },
      }),
      this.prisma.student.count({
        where: { classId, isActive: true, gender: 'FEMALE' },
      }),
      this.prisma.grade.aggregate({
        where: { classId },
        _avg: { value: true },
      }),
    ]);

    return {
      totalStudents,
      boys,
      girls,
      averageGrade: avgGrades._avg.value?.toFixed(2) ?? 'N/A',
    };
  }

  async getGlobalStats() {
    const [total, active, byLevel] = await Promise.all([
      this.prisma.class.count(),
      this.prisma.class.count({ where: { isActive: true } }),
      this.prisma.class.groupBy({
        by: ['level'],
        _count: { id: true },
        orderBy: { level: 'asc' },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byLevel,
    };
  }
}