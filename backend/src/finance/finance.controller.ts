import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFeeTypeDto } from './dto/create-fee-type.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  // ── Types de frais ───────────────────────────────────────

  // POST /finance/fee-types → Créer un type de frais
  @Post('fee-types')
  @Roles('ADMIN', 'ACCOUNTANT')
  createFeeType(@Body() dto: CreateFeeTypeDto) {
    return this.financeService.createFeeType(dto);
  }

  // GET /finance/fee-types → Lister les types de frais
  @Get('fee-types')
  @Roles('ADMIN', 'ACCOUNTANT')
  findAllFeeTypes(@Query('academicYear') academicYear?: string) {
    return this.financeService.findAllFeeTypes(academicYear);
  }

  // GET /finance/fee-types/:id → Voir un type de frais
  @Get('fee-types/:id')
  @Roles('ADMIN', 'ACCOUNTANT')
  findOneFeeType(@Param('id') id: string) {
    return this.financeService.findOneFeeType(id);
  }

  // ── Paiements ────────────────────────────────────────────

  // POST /finance/payments → Enregistrer un paiement
  @Post('payments')
  @Roles('ADMIN', 'ACCOUNTANT')
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.financeService.createPayment(dto);
  }

  // POST /finance/invoices/:studentId → Générer les factures
  @Post('invoices/:studentId')
  @Roles('ADMIN', 'ACCOUNTANT')
  generateInvoices(
    @Param('studentId') studentId: string,
    @Query('academicYear') academicYear: string,
  ) {
    return this.financeService.generateInvoices(studentId, academicYear);
  }

  // GET /finance/payments → Tous les paiements
  @Get('payments')
  @Roles('ADMIN', 'ACCOUNTANT')
  findAllPayments(
    @Query('status') status?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.financeService.findAllPayments({ status, academicYear });
  }

  // GET /finance/payments/student/:id → Paiements d'un élève
  @Get('payments/student/:id')
  @Roles('ADMIN', 'ACCOUNTANT', 'PARENT', 'STUDENT')
  findByStudent(
    @Param('id') id: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.financeService.findByStudent(id, academicYear);
  }

  // GET /finance/unpaid → Élèves avec impayés
  @Get('unpaid')
  @Roles('ADMIN', 'ACCOUNTANT')
  getUnpaidStudents(@Query('academicYear') academicYear: string) {
    return this.financeService.getUnpaidStudents(academicYear);
  }

  // GET /finance/dashboard → Tableau de bord financier
  @Get('dashboard')
  @Roles('ADMIN', 'ACCOUNTANT')
  getDashboard(@Query('academicYear') academicYear: string) {
    return this.financeService.getDashboard(academicYear);
  }

  // PATCH /finance/payments/:id → Modifier un paiement
  @Patch('payments/:id')
  @Roles('ADMIN', 'ACCOUNTANT')
  updatePayment(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.financeService.updatePayment(id, dto);
  }
}