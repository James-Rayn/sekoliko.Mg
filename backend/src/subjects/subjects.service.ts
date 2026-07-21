import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  // ── Créer une matière ────────────────────────────────────
  async create(dto: CreateSubjectDto) {
    // Vérifier que le code est unique
    const existing = await this.prisma.subject.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    if (existing) {
      throw new ConflictException(
        `Une matière avec le code "${dto.code}" existe déjà`,
      );
    }

    const subject = await this.prisma.subject.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        coefficient: dto.coefficient ?? 1,
        description: dto.description,
      },
    });

    return {
      message: 'Matière créée avec succès',
      subject,
    };
  }

  // ── Lister toutes les matières ───────────────────────────
  async findAll() {
    const subjects = await this.prisma.subject.findMany({
      include: {
        // Enseignants qui enseignent cette matière
        teachers: {
          include: {
            teacher: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        _count: {
          select: {
            grades: true,    // Nombre de notes
            schedules: true, // Nombre de créneaux
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      total: subjects.length,
      subjects,
    };
  }

  // ── Voir une matière par son ID ──────────────────────────
  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                speciality: true,
              },
            },
          },
        },
        schedules: {
          include: {
            class: { select: { name: true, level: true } },
            teacher: { select: { firstName: true, lastName: true } },
          },
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: { grades: true, schedules: true },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Matière avec l'ID ${id} introuvable`);
    }

    return subject;
  }

  // ── Voir une matière par son code ────────────────────────
  async findByCode(code: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        teachers: {
          include: {
            teacher: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Matière avec le code "${code}" introuvable`);
    }

    return subject;
  }

  // ── Modifier une matière ─────────────────────────────────
  async update(id: string, dto: UpdateSubjectDto) {
    await this.findOne(id);

    // Si le code change, vérifier qu'il est unique
    if (dto.code) {
      const existing = await this.prisma.subject.findUnique({
        where: { code: dto.code.toUpperCase() },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Une matière avec le code "${dto.code}" existe déjà`,
        );
      }
    }

    const updated = await this.prisma.subject.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.code && { code: dto.code.toUpperCase() }),
        ...(dto.coefficient && { coefficient: dto.coefficient }),
        ...(dto.description && { description: dto.description }),
      },
    });

    return {
      message: 'Matière mise à jour avec succès',
      subject: updated,
    };
  }

  // ── Supprimer une matière ────────────────────────────────
  async remove(id: string) {
    await this.findOne(id);

    // Vérifier qu'il n'y a pas de notes liées
    const gradesCount = await this.prisma.grade.count({
      where: { subjectId: id },
    });
    if (gradesCount > 0) {
      throw new ConflictException(
        `Impossible de supprimer : ${gradesCount} note(s) liée(s) à cette matière`,
      );
    }

    await this.prisma.subject.delete({ where: { id } });

    return { message: 'Matière supprimée avec succès' };
  }

  // ── Statistiques d'une matière ───────────────────────────
  async getStats(id: string) {
    await this.findOne(id);

    const [avgGrade, highestGrade, lowestGrade, totalGrades] =
      await Promise.all([
        // Moyenne générale
        this.prisma.grade.aggregate({
          where: { subjectId: id },
          _avg: { value: true },
        }),
        // Note la plus haute
        this.prisma.grade.aggregate({
          where: { subjectId: id },
          _max: { value: true },
        }),
        // Note la plus basse
        this.prisma.grade.aggregate({
          where: { subjectId: id },
          _min: { value: true },
        }),
        // Total des notes
        this.prisma.grade.count({ where: { subjectId: id } }),
      ]);

    return {
      subjectId: id,
      totalGrades,
      average: avgGrade._avg.value?.toFixed(2) ?? 'N/A',
      highest: highestGrade._max.value ?? 'N/A',
      lowest: lowestGrade._min.value ?? 'N/A',
    };
  }
}