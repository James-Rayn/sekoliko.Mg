import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  // ── Messagerie privée ────────────────────────────────────

  // POST /messages → Envoyer un message
  @Post()
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  send(
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.send(dto, user.id);
  }

  // GET /messages/inbox → Boîte de réception
  @Get('inbox')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  getInbox(@CurrentUser() user: any) {
    return this.messagesService.getInbox(user.id);
  }

  // GET /messages/sent → Messages envoyés
  @Get('sent')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  getSent(@CurrentUser() user: any) {
    return this.messagesService.getSent(user.id);
  }

  // GET /messages/stats → Statistiques
  @Get('stats')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  getStats(@CurrentUser() user: any) {
    return this.messagesService.getStats(user.id);
  }

  // GET /messages/conversation/:userId → Conversation
  @Get('conversation/:otherUserId')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  getConversation(
    @Param('otherUserId') otherUserId: string,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.getConversation(user.id, otherUserId);
  }

  // PATCH /messages/read-all → Tout marquer comme lu
  @Patch('read-all')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  markAllAsRead(@CurrentUser() user: any) {
    return this.messagesService.markAllAsRead(user.id);
  }

  // ── Annonces ─────────────────────────────────────────────

  // POST /messages/announcements → Créer une annonce
  @Post('announcements')
  @Roles('ADMIN')
  createAnnouncement(@Body() dto: CreateAnnouncementDto) {
    return this.messagesService.createAnnouncement(dto);
  }

  // GET /messages/announcements → Lister les annonces
  @Get('announcements')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  findAllAnnouncements(@CurrentUser() user: any) {
    return this.messagesService.findAllAnnouncements(user.role);
  }

  // GET /messages/announcements/:id → Voir une annonce
  @Get('announcements/:id')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  findOneAnnouncement(@Param('id') id: string) {
    return this.messagesService.findOneAnnouncement(id);
  }

  // DELETE /messages/announcements/:id → Supprimer une annonce
  @Delete('announcements/:id')
  @Roles('ADMIN')
  deleteAnnouncement(@Param('id') id: string) {
    return this.messagesService.deleteAnnouncement(id);
  }

  // GET /messages/:id → Voir un message
  @Get(':id')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.findOne(id, user.id);
  }

  // DELETE /messages/:id → Supprimer un message
  @Delete(':id')
  @Roles('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.messagesService.delete(id, user.id);
  }
}

