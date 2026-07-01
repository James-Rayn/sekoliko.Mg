import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // ── Marquer la présence d'un élève ───────────────────────
  async create(dto: CreateAttendanceDto, teacherId: string) {
    // Vérifier que l'élève existe
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) throw new NotFoundException('Élève introuvable');

    // Vérifier qu'il n'y a pas déjà une entrée pour ce jour
    const existing = await this.prisma.attendance.findFirst({
      where: {
        studentId: dto.studentId,
        date: new Date(dto.date),
      },
    });
    if (existing) {
      throw new BadRequestException(
        'Une présence a déjà été enregistrée pour cet élève ce jour',
      );
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        date: new Date(dto.date),
        status: dto.status,
        reason: dto.reason,
        studentId: dto.studentId,
        teacherId,
      },
      include: {
        student: {
          select: { firstName: true, lastName: true, matricule: true },
        },
      },
    });

    return {
      message: 'Présence enregistrée avec succès',
      attendance,
    };
  }

  // ── Faire l'appel d'une classe entière ───────────────────
  // C'est la fonctionnalité principale utilisée par les enseignants
  async createBulk(dto: BulkAttendanceDto, teacherId: string) {
    // Vérifier que la classe existe
    const classe = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });
    if (!classe) throw new NotFoundException('Classe introuvable');

    const date = new Date(dto.date);

    // Supprimer les anciennes entrées du jour pour cette classe
    // (au cas où l'appel est refait)
    await this.prisma.attendance.deleteMany({
      where: {
        date,
        student: { classId: dto.classId },
      },
    });

    // Créer toutes les présences en une transaction
    const created = await this.prisma.$transaction(
      dto.attendances.map((a) =>
        this.prisma.attendance.create({
          data: {
            date,
            status: a.status,
            reason: a.reason,
            studentId: a.studentId,
            teacherId,
          },
        }),
      ),
    );

    // Compter par statut
    const summary = {
      present: created.filter((a) => a.status === 'PRESENT').length,
      absent: created.filter((a) => a.status === 'ABSENT').length,
      late: created.filter((a) => a.status === 'LATE').length,
      excused: created.filter((a) => a.status === 'EXCUSED').length,
    };

    return {
      message: `Appel enregistré pour ${created.length} élèves`,
      date: dto.date,
      class: classe.name,
      summary,
    };
  }

  // ── Voir les présences d'un élève ────────────────────────
  async findByStudent(
    studentId: string,
    filters?: { startDate?: string; endDate?: string },
  ) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { firstName: true, lastName: true, matricule: true },
    });
    if (!student) throw new NotFoundException('Élève introuvable');

    const attendances = await this.prisma.attendance.findMany({
      where: {
        studentId,
        ...(filters?.startDate &&
          filters?.endDate && {
            date: {
              gte: new Date(filters.startDate),
              lte: new Date(filters.endDate),
            },
          }),
      },
      orderBy: { date: 'desc' },
    });

    // Calculer le taux d'assiduité
    const total = attendances.length;
    const present = attendances.filter(
      (a) => a.status === 'PRESENT',
    ).length;
    const absent = attendances.filter(
      (a) => a.status === 'ABSENT',
    ).length;
    const late = attendances.filter(
      (a) => a.status === 'LATE',
    ).length;
    const excused = attendances.filter(
      (a) => a.status === 'EXCUSED',
    ).length;

    const attendanceRate =
      total > 0
        ? parseFloat(((present / total) * 100).toFixed(1))
        : 0;

    return {
      student,
      total,
      summary: { present, absent, late, excused },
      attendanceRate: `${attendanceRate}%`,
      attendances,
    };
  }

  // ── Voir les présences d'une classe pour une date ────────
  async findByClassAndDate(classId: string, date: string) {
    const classe = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { name: true },
    });
    if (!classe) throw new NotFoundException('Classe introuvable');

    const attendances = await this.prisma.attendance.findMany({
      where: {
        date: new Date(date),
        student: { classId },
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            matricule: true,
            gender: true,
          },
        },
      },
      orderBy: { student: { lastName: 'asc' } },
    });

    const summary = {
      present: attendances.filter((a) => a.status === 'PRESENT').length,
      absent: attendances.filter((a) => a.status === 'ABSENT').length,
      late: attendances.filter((a) => a.status === 'LATE').length,
      excused: attendances.filter((a) => a.status === 'EXCUSED').length,
    };

    return {
      class: classe.name,
      date,
      total: attendances.length,
      summary,
      attendances,
    };
  }

  // ── Justifier une absence ────────────────────────────────
  async justify(id: string, reason: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });
    if (!attendance) throw new NotFoundException('Présence introuvable');

    if (attendance.status !== 'ABSENT') {
      throw new BadRequestException(
        'Seules les absences peuvent être justifiées',
      );
    }

    const updated = await this.prisma.attendance.update({
      where: { id },
      data: {
        status: 'EXCUSED',
        reason,
      },
    });

    return {
      message: 'Absence justifiée avec succès',
      attendance: updated,
    };
  }

  // ── Modifier une présence ────────────────────────────────
  async update(id: string, dto: UpdateAttendanceDto) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });
    if (!attendance) throw new NotFoundException('Présence introuvable');

    const updated = await this.prisma.attendance.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.reason && { reason: dto.reason }),
      },
    });

    return {
      message: 'Présence mise à jour avec succès',
      attendance: updated,
    };
  }

  // ── Statistiques d'assiduité d'une classe ────────────────
  async getClassStats(classId: string, startDate: string, endDate: string) {
    const classe = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { name: true },
    });
    if (!classe) throw new NotFoundException('Classe introuvable');

    const attendances = await this.prisma.attendance.findMany({
      where: {
        student: { classId },
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        student: {
          select: { firstName: true, lastName: true, matricule: true },
        },
      },
    });

    // Grouper par élève
    const byStudent: Record<string, any> = {};
    for (const a of attendances) {
      const key = a.studentId;
      if (!byStudent[key]) {
        byStudent[key] = {
          student: a.student,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
        };
      }
      byStudent[key].total++;
      byStudent[key][a.status.toLowerCase()]++;
    }

    // Calculer le taux par élève
    const studentStats = Object.values(byStudent).map((s: any) => ({
      ...s,
      attendanceRate: `${((s.present / s.total) * 100).toFixed(1)}%`,
    }));

    // Élèves avec trop d'absences (plus de 3)
    const alerts = studentStats.filter((s: any) => s.absent >= 3);

    return {
      class: classe.name,
      period: { startDate, endDate },
      studentStats,
      alerts: {
        count: alerts.length,
        students: alerts,
      },
    };
  }

  // ── Élèves absents aujourd'hui ───────────────────────────
  async getAbsentToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const absents = await this.prisma.attendance.findMany({
      where: {
        date: today,
        status: { in: ['ABSENT', 'LATE'] },
      },
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
      orderBy: { student: { lastName: 'asc' } },
    });

    return {
      date: today.toISOString().split('T')[0],
      total: absents.length,
      absents,
    };
  }
}