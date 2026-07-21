import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // ── Dashboard ADMIN ──────────────────────────────────────
  // Vue globale de tout l'établissement
  async getAdminDashboard(academicYear: string) {
    const [
      // Effectifs
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalClasses,
      totalSubjects,

      // Présences du jour
      presentToday,
      absentToday,
      lateToday,

      // Finance
      totalCollected,
      totalPending,
      totalLate,

      // Messages
      totalAnnouncements,

      // Notes
      avgGrade,

    ] = await Promise.all([

      // ── Élèves ──
      this.prisma.student.count(),
      this.prisma.student.count({ where: { isActive: true } }),

      // ── Enseignants ──
      this.prisma.teacher.count(),
      this.prisma.teacher.count({ where: { isActive: true } }),

      // ── Classes ──
      this.prisma.class.count({
        where: { academicYear, isActive: true },
      }),

      // ── Matières ──
      this.prisma.subject.count(),

      // ── Présences aujourd'hui ──
      this.prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          status: 'PRESENT',
        },
      }),
      this.prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          status: 'ABSENT',
        },
      }),
      this.prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          status: 'LATE',
        },
      }),

      // ── Finance ──
      this.prisma.payment.aggregate({
        where: {
          status: 'PAID',
          feeType: { academicYear },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: 'PENDING',
          feeType: { academicYear },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: 'LATE',
          feeType: { academicYear },
        },
        _sum: { amount: true },
      }),

      // ── Annonces actives ──
      this.prisma.announcement.count({
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
      }),

      // ── Moyenne générale de l'école ──
      this.prisma.grade.aggregate({
        where: { academicYear },
        _avg: { value: true },
      }),
    ]);

    // ── 5 derniers élèves inscrits ──
    const recentStudents = await this.prisma.student.findMany({
      take: 5,
      orderBy: { enrolledAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        matricule: true,
        enrolledAt: true,
        class: { select: { name: true } },
      },
    });

    // ── 5 derniers paiements ──
    const recentPayments = await this.prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { feeType: { academicYear } },
      include: {
        student: { select: { firstName: true, lastName: true } },
        feeType: { select: { name: true } },
      },
    });

    // ── Élèves avec le plus d'absences ──
    const absentStudents = await this.prisma.attendance.groupBy({
      by: ['studentId'],
      where: { status: 'ABSENT' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // Récupérer les infos de ces élèves
    const absentStudentsDetails = await Promise.all(
      absentStudents.map(async (a) => {
        const student = await this.prisma.student.findUnique({
          where: { id: a.studentId },
          select: {
            firstName: true,
            lastName: true,
            matricule: true,
            class: { select: { name: true } },
          },
        });
        return { ...student, absenceCount: a._count.id };
      }),
    );

    return {
      academicYear,
      generatedAt: new Date(),

      // KPIs principaux
      kpis: {
        students: {
          total: totalStudents,
          active: activeStudents,
          inactive: totalStudents - activeStudents,
        },
        teachers: {
          total: totalTeachers,
          active: activeTeachers,
          inactive: totalTeachers - activeTeachers,
        },
        classes: totalClasses,
        subjects: totalSubjects,
      },

      // Présences du jour
      attendance: {
        present: presentToday,
        absent: absentToday,
        late: lateToday,
        total: presentToday + absentToday + lateToday,
        attendanceRate:
          presentToday + absentToday + lateToday > 0
            ? `${((presentToday / (presentToday + absentToday + lateToday)) * 100).toFixed(1)}%`
            : 'N/A',
      },

      // Finance
      finance: {
        collected: totalCollected._sum.amount ?? 0,
        pending: totalPending._sum.amount ?? 0,
        late: totalLate._sum.amount ?? 0,
        total:
          (totalCollected._sum.amount ?? 0) +
          (totalPending._sum.amount ?? 0) +
          (totalLate._sum.amount ?? 0),
      },

      // Pédagogie
      pedagogy: {
        schoolAverage: avgGrade._avg.value?.toFixed(2) ?? 'N/A',
        activeAnnouncements: totalAnnouncements,
      },

      // Données récentes
      recent: {
        students: recentStudents,
        payments: recentPayments,
        absentStudents: absentStudentsDetails,
      },
    };
  }

  // ── Dashboard TEACHER ────────────────────────────────────
  // Vue personnalisée pour un enseignant
  async getTeacherDashboard(userId: string) {
    // Récupérer le profil enseignant
    const teacher = await this.prisma.teacher.findFirst({
      where: { userId },
      include: {
        subjects: {
          include: { subject: true },
        },
      },
    });

    if (!teacher) {
      return { message: 'Profil enseignant introuvable' };
    }

    // Classes de cet enseignant
    const classes = await this.prisma.schedule.findMany({
      where: { teacherId: teacher.id },
      select: { classId: true },
      distinct: ['classId'],
    });

    const classIds = classes.map((c) => c.classId);

    // Nombre d'élèves dans ses classes
    const totalStudents = await this.prisma.student.count({
      where: { classId: { in: classIds }, isActive: true },
    });

    // Présences aujourd'hui dans ses classes
    const todayAttendance = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: {
        teacherId: teacher.id,
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      _count: { id: true },
    });

    // Notes récentes saisies par cet enseignant
    const recentGrades = await this.prisma.grade.findMany({
      where: { teacherId: teacher.id },
      take: 5,
      orderBy: { gradedAt: 'desc' },
      include: {
        student: { select: { firstName: true, lastName: true } },
        subject: { select: { name: true } },
        class: { select: { name: true } },
      },
    });

    // Emploi du temps de la semaine
    const schedule = await this.prisma.schedule.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    // Messages non lus
    const unreadMessages = await this.prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });

    const days = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const organizedSchedule = days
      .map((day, index) => ({
        day,
        slots: schedule.filter((s) => s.dayOfWeek === index),
      }))
      .filter((d) => d.day !== '');

    return {
      teacher: {
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        speciality: teacher.speciality,
        subjects: teacher.subjects.map((s) => s.subject.name),
      },
      kpis: {
        totalClasses: classIds.length,
        totalStudents,
        totalSubjects: teacher.subjects.length,
        unreadMessages,
      },
      attendance: {
        today: todayAttendance.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.status.toLowerCase()]: curr._count.id,
          }),
          {},
        ),
      },
      recentGrades,
      schedule: organizedSchedule,
    };
  }

  // ── Dashboard STUDENT ────────────────────────────────────
  async getStudentDashboard(userId: string, academicYear: string) {
    // Récupérer le profil élève
    const student = await this.prisma.student.findFirst({
      where: { userId },
      include: {
        class: true,
      },
    });

    if (!student) {
      return { message: 'Profil élève introuvable' };
    }

    // Notes récentes
    const recentGrades = await this.prisma.grade.findMany({
      where: { studentId: student.id, academicYear },
      take: 5,
      orderBy: { gradedAt: 'desc' },
      include: {
        subject: { select: { name: true, coefficient: true } },
      },
    });

    // Moyenne générale
    const avgGrade = await this.prisma.grade.aggregate({
      where: { studentId: student.id, academicYear },
      _avg: { value: true },
    });

    // Absences
    const attendanceStats = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: { studentId: student.id },
      _count: { id: true },
    });

    // Paiements en attente
    const pendingPayments = await this.prisma.payment.findMany({
      where: {
        studentId: student.id,
        status: { in: ['PENDING', 'LATE'] },
      },
      include: {
        feeType: { select: { name: true, amount: true, dueDate: true } },
      },
    });

    // Messages non lus
    const unreadMessages = await this.prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });

    // Emploi du temps de sa classe
    const schedule = student.classId
      ? await this.prisma.schedule.findMany({
          where: { classId: student.classId },
          include: {
            subject: { select: { name: true } },
            teacher: { select: { firstName: true, lastName: true } },
          },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        })
      : [];

    return {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        matricule: student.matricule,
        class: student.class?.name ?? 'Non assigné',
      },
      kpis: {
        generalAverage: avgGrade._avg.value?.toFixed(2) ?? 'N/A',
        unreadMessages,
        pendingPaymentsCount: pendingPayments.length,
        totalPendingAmount: pendingPayments.reduce(
          (sum, p) => sum + p.amount, 0,
        ),
      },
      attendance: attendanceStats.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.status.toLowerCase()]: curr._count.id,
        }),
        {},
      ),
      recentGrades,
      pendingPayments,
      schedule,
    };
  }

  // ── Dashboard PARENT ─────────────────────────────────────
  async getParentDashboard(userId: string, academicYear: string) {
    // Récupérer le profil parent
    const parent = await this.prisma.parent.findFirst({
      where: { userId },
      include: {
        children: {
          include: {
            student: {
              include: {
                class: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return { message: 'Profil parent introuvable' };
    }

    const children = parent.children.map((c) => c.student);

    // Pour chaque enfant, récupérer ses infos
    const childrenDetails = await Promise.all(
      children.map(async (child) => {
        const [avgGrade, absences, pendingPayments] = await Promise.all([
          this.prisma.grade.aggregate({
            where: { studentId: child.id, academicYear },
            _avg: { value: true },
          }),
          this.prisma.attendance.count({
            where: { studentId: child.id, status: 'ABSENT' },
          }),
          this.prisma.payment.findMany({
            where: {
              studentId: child.id,
              status: { in: ['PENDING', 'LATE'] },
            },
            include: {
              feeType: { select: { name: true, amount: true } },
            },
          }),
        ]);

        return {
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          matricule: child.matricule,
          class: child.class?.name ?? 'Non assigné',
          generalAverage: avgGrade._avg.value?.toFixed(2) ?? 'N/A',
          absenceCount: absences,
          pendingPayments,
          totalPendingAmount: pendingPayments.reduce(
            (sum, p) => sum + p.amount, 0,
          ),
        };
      }),
    );

    // Messages non lus
    const unreadMessages = await this.prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });

    return {
      parent: {
        id: parent.id,
        firstName: parent.firstName,
        lastName: parent.lastName,
      },
      kpis: {
        totalChildren: children.length,
        unreadMessages,
        totalPendingAmount: childrenDetails.reduce(
          (sum, c) => sum + c.totalPendingAmount, 0,
        ),
      },
      children: childrenDetails,
    };
  }
}