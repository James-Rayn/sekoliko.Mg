import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import * as bcrypt from 'bcrypt';
import { UpdateStudentDto } from "./dto/update-student.dto";

@Injectable()
export class StudentService {
    constructor(private prisma: PrismaService) {}

    private async generateMatricule(): Promise<string> {
        const year = new Date().getFullYear();
        const count = await this.prisma.student.count();
        const number = String(count + 1).padStart(3, '0');
        return `LM-${year - 2000}-${number}`;
    }

    async create(dto: CreateStudentDto) {
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingEmail) throw new ConflictException('Cet email est déjà utilisé');

        const hashedPassword = await bcrypt.hash(dto.password, 10)
        
        const matricule = await this.generateMatricule();

        const student = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword,
                    role: 'STUDENT',
                },
            });

            return tx.student.create({
                data: {
                    matricule,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    dateOfBirth: new Date(dto.dateOfBirth),
                    gender: dto.gender,
                    address: dto.address,
                    phone: dto.phone,
                    bloodType: dto.bloodType,
                    medicalNotes: dto.medicalNotes,
                    classId: dto.classId,
                    userId: user.id,
                },
                include: {
                    user: {
                        select: {email: true, role: true},
                    },
                    class: true,
                },
            });
        });
        
        return {
            message: 'Elève créé avec succès',
            student,
        };
    }

    async findall(filters?: {classId?: string; isActive?: boolean}) {
        const students = await this.prisma.student.findMany({
            where: {
                ...(filters?.classId && {classId: filters.classId}),
                ...(filters?.isActive !== undefined && {isActive: filters.isActive})
            },
            include: {
                user: {select: {email: true}},
                class: {select: {name: true, level: true}},
            },
            orderBy: {lastName: 'asc'},
        });

        return {
            total: students.length,
            students,
        }
    }

    async findOne(id: string) {
        const student = await this.prisma.student.findUnique({
            where: {id},
            include: {
                user: {select: {email: true, role: true}},
                class: true,
                grades: {
                    include: {subject: true},
                    orderBy: {gradedAt: 'desc'},
                    take: 10,
                },
                attendances: {
                    orderBy: {date: 'desc'},
                    take: 10,
                },
                parents: {
                    include: {
                        parent: {
                            include: {
                                user: {select: {email: true}},
                            }
                        }
                    }
                }
            }
        });

        if (!student) throw new NotFoundException(`Elève avec l'ID ${id} introuvable`)
        return student;
    }

    async findByMatricule(matricule: string) {
        const student = await this.prisma.student.findUnique({
            where: {matricule},
            include: {
                user: {select: {email: true}},
                class: true,
            },
        });
        if (!student) throw new NotFoundException(`Matricule ${matricule} introuvable`);
        return student;
    }

    async update(id: string, dto: UpdateStudentDto) {
        await this.findOne(id);

        const updated = await this.prisma.student.update({
            where: { id },
            data: {
                ...(dto.firstName && { firstName: dto.firstName }),
                ...(dto.lastName && { lastName: dto.lastName }),
                ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
                ...(dto.gender && { gender: dto.gender }),
                ...(dto.address && { address: dto.address }),
                ...(dto.phone && { phone: dto.phone }),
                ...(dto.classId && { classId: dto.classId }),
                ...(dto.bloodType && { bloodType: dto.bloodType }),
                ...(dto.medicalNotes && { medicalNotes: dto.medicalNotes }),
            },
            include: {
                class: true,
                user: { select: { email: true } },
            },
        });

        return {
        message: 'Élève mis à jour avec succès',
        student: updated,
        };
    }

    async deactivate(id: string) {
        await this.findOne(id);

        await this.prisma.student.update({
            where: {id},
            data: {isActive: false}
        })

        return {message: 'Elève désactivé avec succès'};
    }

    async reactivate(id: string) {
        await this.findOne(id);

        await this.prisma.student.update({
            where: {id},
            data: {isActive: true},
        })

        return {message: 'Elève réactivé avec succès'};
    }

    async getStats() {
        const [total, active, byClass] = await Promise.all([
            this.prisma.student.count(),
            this.prisma.student.count({where: {isActive: true}}),
            this.prisma.student.groupBy({
                by: ['classId'],
                _count: {id: true},
            }),
        ]);

        return {
            total,
            active,
            inactive: total - active,
            byClass,
        };
    }
}