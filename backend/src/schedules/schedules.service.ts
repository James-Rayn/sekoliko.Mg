import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

const DAYS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  // ── Créer un créneau ─────────────────────────────────────
  async create(dto: CreateScheduleDto) {
    // Vérifier conflit enseignant
    const teacherConflict = await this.prisma.schedule.findFirst({
      where: {
        teacherId: dto.teacherId,
        dayOfWeek: dto.dayOfWeek,
        OR: [
          {
            startTime: { lte: dto.startTime },
            endTime: { gt: dto.startTime },
          },
          {
            startTime: { lt: dto.endTime },
            endTime: { gte: dto.endTime },
          },
        ],
      },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
      },
    });

    if (teacherConflict) {
      throw new BadRequestException(
        `Conflit : l'enseignant a déjà "${teacherConflict.subject.name}" en ${teacherConflict.class.name} à ce créneau`,
      );
    }

    // Vérifier conflit classe
    const classConflict = await this.prisma.schedule.findFirst({
      where: {
        classId: dto.classId,
        dayOfWeek: dto.dayOfWeek,
        OR: [
          {
            startTime: { lte: dto.startTime },
            endTime: { gt: dto.startTime },
          },
          {
            startTime: { lt: dto.endTime },
            endTime: { gte: dto.endTime },
          },
        ],
      },
      include: {
        subject: { select: { name: true } },
      },
    });

    if (classConflict) {
      throw new BadRequestException(
        `Conflit : la classe a déjà "${classConflict.subject.name}" à ce créneau`,
      );
    }

    const schedule = await this.prisma.schedule.create({
      data: {
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        room: dto.room,
        classId: dto.classId,
        subjectId: dto.subjectId,
        teacherId: dto.teacherId,
      },
      include: {
        class: { select: { name: true, level: true } },
        subject: { select: { name: true, code: true } },
        teacher: { select: { firstName: true, lastName: true } },
      },
    });

    return {
      message: 'Créneau créé avec succès',
      schedule,
    };
  }

  // ── Lister tous les créneaux ─────────────────────────────
  async findAll(classId?: string) {
    const schedules = await this.prisma.schedule.findMany({
      where: { ...(classId && { classId }) },
      include: {
        class: { select: { id: true, name: true, level: true } },
        subject: { select: { name: true, code: true } },
        teacher: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return {
      total: schedules.length,
      schedules,
    };
  }

  // ── Emploi du temps par classe (organisé par jour) ───────
  async findByClass(classId: string) {
    const classe = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { name: true, level: true },
    });

    if (!classe) throw new NotFoundException('Classe introuvable');

    const schedules = await this.prisma.schedule.findMany({
      where: { classId },
      include: {
        subject: { select: { name: true, code: true, coefficient: true } },
        teacher: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    // Organiser par jour
    const organized = DAYS.slice(1).map((day, index) => ({
      day,
      dayOfWeek: index + 1,
      slots: schedules.filter((s) => s.dayOfWeek === index + 1),
    }));

    return {
      class: classe,
      schedule: organized,
      totalSlots: schedules.length,
    };
  }

  // ── Emploi du temps par enseignant ───────────────────────
  async findByTeacher(teacherId: string) {
    const schedules = await this.prisma.schedule.findMany({
      where: { teacherId },
      include: {
        class: { select: { name: true, level: true } },
        subject: { select: { name: true, code: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    const organized = DAYS.slice(1).map((day, index) => ({
      day,
      dayOfWeek: index + 1,
      slots: schedules.filter((s) => s.dayOfWeek === index + 1),
    }));

    return { schedule: organized, totalSlots: schedules.length };
  }

  // ── Supprimer un créneau ─────────────────────────────────
  async remove(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });
    if (!schedule) throw new NotFoundException('Créneau introuvable');

    await this.prisma.schedule.delete({ where: { id } });
    return { message: 'Créneau supprimé avec succès' };
  }

  // ── Vue globale de tous les emplois du temps ─────────────
  async getGlobalView() {
    const [totalSlots, byDay, byClass] = await Promise.all([
      this.prisma.schedule.count(),
      // Nombre de créneaux par jour
      this.prisma.schedule.groupBy({
        by: ['dayOfWeek'],
        _count: { id: true },
        orderBy: { dayOfWeek: 'asc' },
      }),
      // Nombre de créneaux par classe
      this.prisma.schedule.groupBy({
        by: ['classId'],
        _count: { id: true },
      }),
    ]);

    return {
      totalSlots,
      byDay: byDay.map((d) => ({
        day: DAYS[d.dayOfWeek],
        count: d._count.id,
      })),
      totalClasses: byClass.length,
    };
  }
}