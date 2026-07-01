import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateFeeTypeDto } from "./dto/create-fee-type.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { AppModule } from "src/app.module";
import { UpdateAttendanceDto } from "src/attendance/dto/update-attendance.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService) {}

    async createFeeType(dto: CreateFeeTypeDto) {
        const feeType = await this.prisma.feeType.create({
            data: {
                name: dto.name,
                amount: dto.amount,
                academicYear: dto.academicYear,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                description: dto.description,
            },
        });

        return {
            message: 'Type de frais créé avec succès',
            feeType,
        };
    }

    async findAllFeeTypes(academicYear?: string) {
        const feeTypes = await this.prisma.feeType.findMany({
            where: {
                ...(academicYear && {academicYear})
            },
            include: {
                _count: {select: {payments: true}},
            },
            orderBy: {name: 'asc'},
        });

        return {
            total: feeTypes.length,
            feeTypes,
        };
    }

    async findOneFeeType(id: string) {
        const feeType = await this.prisma.feeType.findUnique({
            where: {id},
            include: {
                payments: {
                    include: {
                        student: {
                            select: {firstName: true, lastName: true, matricule: true},
                        },
                    },
                },
            },
        });

        if (!feeType) throw new NotFoundException('Type de frais introuvable');
        return feeType;
    }

    async createPayment(dto: CreatePaymentDto) {
        const student = await this.prisma.student.findUnique({
            where: {id: dto.studentId},
        });
        if (!student) throw new NotFoundException('Elève introuvable');

        const feeType = await this.prisma.feeType.findUnique({
            where: {id: dto.feeTypeId},
        });
        if (!feeType) throw new NotFoundException('Type de frais introuvable');

        const existing = await this.prisma.payment.findFirst({
            where: {
                studentId: dto.studentId,
                feeTypeId: dto.feeTypeId,
                status: 'PAID'
            }
        })
        if (existing) throw new NotFoundException('Frais déjà payé par cette élève');

        const payment = await this.prisma.payment.create({
            data: {
                amount: dto.amount,
                method: dto.method,
                notes: dto.notes,
                status: 'PAID',
                paidAt: new Date(),
                studentId: dto.studentId,
                parentId: dto.parentId,
                feeTypeId: dto.feeTypeId
            },
            include: {
                student: {
                    select: {firstName: true, lastName: true, matricule: true},
                },
                feeType: {
                    select: {name: true, amount: true}
                },
            },
        });

        return {
            message: 'Paiement enregistré avec succès',
            payment,
        };
    }

    async generateInvoices(studentId: string, academicYear: string) {
        const student = await this.prisma.student.findUnique({
            where: {id: studentId}
        });
        if (!student) throw new NotFoundException('Élève introuvable');

        const feeTypes = await this.prisma.feeType.findMany({
            where: { academicYear },
        });
        if (feeTypes.length === 0) throw new BadRequestException(`Aucun type de frais pour l'année ${academicYear}`,);

        const created: any[] = [];
        for (const feeType of feeTypes) {
            const existing = await this.prisma.payment.findFirst({
                where: {studentId, feeTypeId: feeType.id}
            });

            if (!existing) {
                const payment =  await this.prisma.payment.create({
                    data: {
                        amount: feeType.amount,
                        status: 'PENDING',
                        studentId,
                        feeTypeId: feeType.id,
                    },
                });
                created.push(payment);
            }
        }

        return  {
            message: `${created.length} facture(s) générée(s) pour ${student.firstName} ${student.lastName}`,
            invoices: created
        }
    }

    async findByStudent(studentId: string, academicYear?: string) {
        const student = await this.prisma.student.findUnique({
            where: {id: studentId},
            select: { firstName: true, lastName: true, matricule: true}
        });
        if (!student) throw new NotFoundException('Élève introuvable');

        const payments =  await this.prisma.payment.findMany({
            where: {
                studentId,
                ...(academicYear && {feeType: {academicYear}}),
            },
            include: {
                feeType: {select: {name: true, amount: true, dueDate: true}},
            },
            orderBy: {createdAt: 'desc'}
        });

        const totalDue = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalPaid = payments
            .filter((p) => p.status === 'PAID')
            .reduce((sum, p) => sum + p.amount, 0);
        const totalPending = payments
            .filter((p) => p.status === 'PENDING')
            .reduce((sum, p) => sum + p.amount, 0)
        const totalLate = payments
            .filter((p) => p.status === 'LATE')
            .reduce((sum, p) => sum + p.amount, 0)
        
        return {
            student,
            summary: {
                totalDue,
                totalPaid,
                totalPending,
                totalLate,
                balance: totalDue - totalPaid
            },
            payments,
        };
    }

    async findAllPayments(filters?: {
        status?: string,
        academicYear?: string;
    }) {
        const payments = await this.prisma.payment.findMany({
            where: {
                ...(filters?.status && {status: filters.status as any}),
                ...(filters?.academicYear && {feeType: {academicYear: filters.academicYear}})
            },
            include: {
                student: {
                    select: {firstName: true, lastName: true, matricule: true},
                },
                feeType: {
                    select: {name: true, amount: true},
                }
            },
            orderBy: {createdAt: 'desc'}
        });

        return {
            total: payments.length,
            payments,
        };
    }

    async updatePayment(id: string, dto: UpdatePaymentDto) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment) throw new NotFoundException('Paiement introuvable');

        const updated = await this.prisma.payment.update({
            where: { id },
            data: {
                ...(dto.status && { status: dto.status }),
                ...(dto.method && { method: dto.method }),
                ...(dto.notes && { notes: dto.notes }),
                ...(dto.status === 'PAID' && { paidAt: new Date() }),
            },
            include: {
                student: {
                    select: { firstName: true, lastName: true },
                },
                feeType: { select: { name: true } },
            },
        });

        return {
        message: 'Paiement mis à jour avec succès',
        payment: updated,
        };
    }

    async getUnpaidStudents(academicYear: string) {
    const unpaid = await this.prisma.payment.findMany({
        where: {
            status: { in: ['PENDING', 'LATE'] },
            feeType: { academicYear },
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
            feeType: { select: { name: true, amount: true, dueDate: true } },
        },
        orderBy: { createdAt: 'asc' },
    });

    const byStudent: Record<string, any> = {};
    for (const payment of unpaid) {
        const key = payment.studentId;
        if (!byStudent[key]) {
            byStudent[key] = {
                student: payment.student,
                unpaidFees: [],
                totalUnpaid: 0,
            };
        }
        byStudent[key].unpaidFees.push(payment.feeType);
        byStudent[key].totalUnpaid += payment.amount;
    }

    return {
      totalUnpaidStudents: Object.keys(byStudent).length,
      students: Object.values(byStudent),
    };
  }

  async getDashboard(academicYear: string) {
    const [totalPaid, totalPending, totalLate, feeTypes] = 
        await Promise.all([
            this.prisma.payment.aggregate({
                where: {
                    status: 'PAID',
                    feeType: {academicYear},
                },
                _sum: {amount: true},
                _count: {id: true},
            }),
            this.prisma.payment.aggregate({
                where: {
                    status: 'PENDING',
                    feeType: { academicYear },
                },
                _sum: { amount: true },
                _count: { id: true },
            }),
            this.prisma.payment.aggregate({
                where: {
                    status: 'LATE',
                    feeType: {academicYear}
                },
                _sum: {amount: true},
                _count: {id: true},
            }),
            this.prisma.feeType.count({where: {academicYear}}),
        ]);

        return {
            academicYear,
            summary: {
                totalCollected: totalPaid._sum.amount ?? 0,
                totalPending: totalPending._sum.amount ?? 0,
                totalLate: totalLate._sum.amount ?? 0,
                paidCount: totalPaid._count.id,
                pendingCount: totalPending._count.id,
                ateCount: totalLate._count.id,
                feeTypesCount: feeTypes,
            },
        };
    }
}