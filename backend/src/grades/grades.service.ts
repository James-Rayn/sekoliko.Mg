import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGradeDto, teacherId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException('Élève introuvable');
    }

    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
    });
    if (!subject) {
      throw new NotFoundException('Matière introuvable');
    }

    const grade = await this.prisma.grade.create({
      data: {
        value: dto.value,
        maxValue: dto.maxValue ?? 20,
        type: dto.type,
        period: dto.period,
        academicYear: dto.academicYear,
        comment: dto.comment,
        studentId: dto.studentId,
        subjectId: dto.subjectId,
        classId: dto.classId,
        teacherId,
      },
      include: {
        student: { select: { firstName: true, lastName: true, matricule: true } },
        subject: { select: { name: true, coefficient: true } },
        teacher: { select: { firstName: true, lastName: true } },
      },
    });

    return {
      message: 'Note saisie avec succès',
      grade,
    };
  }

  // ── Saisir plusieurs notes en une fois ───────────────────
  // Utile pour saisir toutes les notes d'un devoir en même temps
  async createBulk(
    grades: CreateGradeDto[],
    teacherId: string,
  ) {
    const created = await this.prisma.$transaction(
      grades.map((dto) =>
        this.prisma.grade.create({
          data: {
            value: dto.value,
            maxValue: dto.maxValue ?? 20,
            type: dto.type,
            period: dto.period,
            academicYear: dto.academicYear,
            comment: dto.comment,
            studentId: dto.studentId,
            subjectId: dto.subjectId,
            classId: dto.classId,
            teacherId,
          },
        }),
      ),
    );

    return {
      message: `${created.length} notes saisies avec succès`,
      count: created.length,
    };
  }

  // ── Voir toutes les notes d'un élève ─────────────────────
  async findByStudent(
    studentId: string,
    filters?: { semester?: number; academicYear?: string },
  ) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { firstName: true, lastName: true, matricule: true },
    });
    if (!student) throw new NotFoundException('Élève introuvable');

    const grades = await this.prisma.grade.findMany({
      where: {
        studentId,
        ...(filters?.semester && { semester: filters.semester }),
        ...(filters?.academicYear && { academicYear: filters.academicYear }),
      },
      include: {
        subject: { select: { name: true, code: true, coefficient: true } },
        teacher: { select: { firstName: true, lastName: true } },
      },
      orderBy: { gradedAt: 'desc' },
    });

    return {
      student,
      total: grades.length,
      grades,
    };
  }

  // ── Voir les notes d'une classe pour une matière ─────────
  async findByClass(
    classId: string,
    subjectId: string,
    academicYear: string,
  ) {
    const grades = await this.prisma.grade.findMany({
      where: { classId, subjectId, academicYear },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            matricule: true,
          },
        },
      },
      orderBy: { value: 'desc' },
    });

    return {
      total: grades.length,
      grades,
    };
  }

  // ── Calculer la moyenne d'un élève ───────────────────────
  async calculateAverage(
    studentId: string,
    period: number,
    academicYear: string,
  ) {
    const grades = await this.prisma.grade.findMany({
      where: { studentId, period, academicYear },
      include: {
        subject: { select: { name: true, coefficient: true } },
      },
    });

    if (grades.length === 0) {
      return { average: null, message: 'Aucune note disponible' };
    }

    // Regrouper les notes par matière
    const bySubject: Record<string, { grades: number[]; coefficient: number; name: string }> = {};

    for (const grade of grades) {
      const key = grade.subjectId;
      if (!bySubject[key]) {
        bySubject[key] = {
          grades: [],
          coefficient: grade.subject.coefficient,
          name: grade.subject.name,
        };
      }
      bySubject[key].grades.push(grade.value);
    }

    // Calculer la moyenne par matière avec coefficient
    let totalWeighted = 0;
    let totalCoeff = 0;
    const details: any[] = [];

    for (const [, data] of Object.entries(bySubject)) {
      // Moyenne simple des notes de la matière
      const subjectAvg =
        data.grades.reduce((a, b) => a + b, 0) / data.grades.length;

      totalWeighted += subjectAvg * data.coefficient;
      totalCoeff += data.coefficient;

      details.push({
        subject: data.name,
        coefficient: data.coefficient,
        average: parseFloat(subjectAvg.toFixed(2)),
        grades: data.grades,
      });
    }

    // Moyenne générale pondérée
    const generalAverage =
      totalCoeff > 0
        ? parseFloat((totalWeighted / totalCoeff).toFixed(2))
        : 0;

    return {
      studentId,
      period,
      academicYear,
      generalAverage,
      details,
    };
  }

  // ── Générer le bulletin d'un élève ───────────────────────
  async getBulletin(
    studentId: string,
    semester: number,
    academicYear: string,
  ) {
    // Infos de l'élève
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: { select: { name: true, level: true } },
        user: { select: { email: true } },
      },
    });
    if (!student) throw new NotFoundException('Élève introuvable');

    // Toutes les notes du semestre
    const grades = await this.prisma.grade.findMany({
      where: { studentId, semester, academicYear },
      include: {
        subject: { select: { name: true, code: true, coefficient: true } },
        teacher: { select: { firstName: true, lastName: true } },
      },
      orderBy: { subject: { name: 'asc' } },
    });

    // Calcul des moyennes par matière
    const bySubject: Record<string, any> = {};

    for (const grade of grades) {
      const key = grade.subjectId;
      if (!bySubject[key]) {
        bySubject[key] = {
          subjectName: grade.subject.name,
          subjectCode: grade.subject.code,
          coefficient: grade.subject.coefficient,
          teacher: `${grade.teacher.firstName} ${grade.teacher.lastName}`,
          grades: [],
          comments: [],
        };
      }
      bySubject[key].grades.push(grade.value);
      if (grade.comment) bySubject[key].comments.push(grade.comment);
    }

    // Calcul moyennes + appréciation
    let totalWeighted = 0;
    let totalCoeff = 0;
    const subjects: any[] = [];

    for (const data of Object.values(bySubject)) {
      const avg =
        data.grades.reduce((a: number, b: number) => a + b, 0) /
        data.grades.length;

      totalWeighted += avg * data.coefficient;
      totalCoeff += data.coefficient;

      subjects.push({
        ...data,
        average: parseFloat(avg.toFixed(2)),
        appreciation: this.getAppreciation(avg),
      });
    }

    const generalAverage =
      totalCoeff > 0
        ? parseFloat((totalWeighted / totalCoeff).toFixed(2))
        : 0;

    return {
      school: 'Sekoliko MG',
      academicYear,
      semester,
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        matricule: student.matricule,
        class: student.class?.name ?? 'Non assigné',
        level: student.class?.level ?? '',
      },
      subjects,
      generalAverage,
      mention: this.getMention(generalAverage),
      generatedAt: new Date(),
    };
  }

  // ── Appréciation selon la note ───────────────────────────
  private getAppreciation(avg: number): string {
    if (avg >= 18) return 'Excellent';
    if (avg >= 16) return 'Très bien';
    if (avg >= 14) return 'Bien';
    if (avg >= 12) return 'Assez bien';
    if (avg >= 10) return 'Passable';
    return 'Insuffisant';
  }

  // ── Mention selon la moyenne générale ────────────────────
  private getMention(avg: number): string {
    if (avg >= 16) return 'Félicitations du jury';
    if (avg >= 14) return 'Tableau d\'honneur';
    if (avg >= 12) return 'Encouragements';
    if (avg >= 10) return 'Admis';
    return 'Avertissement';
  }

  // ── Modifier une note ────────────────────────────────────
  async update(id: string, dto: UpdateGradeDto, teacherId: string) {
    const grade = await this.prisma.grade.findUnique({ where: { id } });
    if (!grade) throw new NotFoundException('Note introuvable');

    // Seul l'enseignant qui a saisi la note peut la modifier
    if (grade.teacherId !== teacherId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres notes',
      );
    }

    const updated = await this.prisma.grade.update({
      where: { id },
      data: {
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.comment && { comment: dto.comment }),
        ...(dto.type && { type: dto.type }),
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
        subject: { select: { name: true } },
      },
    });

    return {
      message: 'Note mise à jour avec succès',
      grade: updated,
    };
  }

  // ── Statistiques des notes d'une classe ──────────────────
  async getClassStats(classId: string, academicYear: string) {
    const stats = await this.prisma.grade.aggregate({
      where: { classId, academicYear },
      _avg: { value: true },
      _max: { value: true },
      _min: { value: true },
      _count: { id: true },
    });

    return {
      average: stats._avg.value?.toFixed(2) ?? 'N/A',
      highest: stats._max.value ?? 'N/A',
      lowest: stats._min.value ?? 'N/A',
      totalGrades: stats._count.id,
    };
  }
}