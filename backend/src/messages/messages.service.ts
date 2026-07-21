import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  // ────────────────────────────────────────────────────────
  // MESSAGERIE PRIVÉE
  // ────────────────────────────────────────────────────────

  // ── Envoyer un message ───────────────────────────────────
  async send(dto: CreateMessageDto, senderId: string) {
    // Vérifier que l'expéditeur existe
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });
    if (!sender) throw new NotFoundException('Expéditeur introuvable');

    // Vérifier que le destinataire existe
    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.receiverId },
    });
    if (!receiver) throw new NotFoundException('Destinataire introuvable');

    // On ne peut pas s'envoyer un message à soi-même
    if (senderId === dto.receiverId) {
      throw new BadRequestException(
        'Vous ne pouvez pas vous envoyer un message à vous-même',
      );
    }

    const message = await this.prisma.message.create({
      data: {
        subject: dto.subject,
        body: dto.body,
        senderId,
        receiverId: dto.receiverId,
      },
      include: {
        sender: { select: { email: true, role: true } },
        receiver: { select: { email: true, role: true } },
      },
    });

    return {
      message: 'Message envoyé avec succès',
      data: message,
    };
  }

  // ── Boîte de réception ───────────────────────────────────
  async getInbox(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { receiverId: userId },
      include: {
        sender: { select: { email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = messages.filter((m) => !m.isRead).length;

    return {
      total: messages.length,
      unreadCount,
      messages,
    };
  }

  // ── Messages envoyés ─────────────────────────────────────
  async getSent(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { senderId: userId },
      include: {
        receiver: { select: { email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: messages.length,
      messages,
    };
  }

  // ── Voir un message et le marquer comme lu ───────────────
  async findOne(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: { select: { email: true, role: true } },
        receiver: { select: { email: true, role: true } },
      },
    });

    if (!message) throw new NotFoundException('Message introuvable');

    // Vérifier que l'utilisateur est bien l'expéditeur ou le destinataire
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new BadRequestException('Accès refusé à ce message');
    }

    // Marquer comme lu si c'est le destinataire qui le consulte
    if (message.receiverId === userId && !message.isRead) {
      await this.prisma.message.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return message;
  }

  // ── Marquer tous les messages comme lus ─────────────────
  async markAllAsRead(userId: string) {
    const updated = await this.prisma.message.updateMany({
      where: {
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      message: `${updated.count} message(s) marqué(s) comme lu(s)`,
    };
  }

  // ── Supprimer un message ─────────────────────────────────
  async delete(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) throw new NotFoundException('Message introuvable');

    // Seul l'expéditeur peut supprimer un message
    if (message.senderId !== userId) {
      throw new BadRequestException(
        'Vous ne pouvez supprimer que vos propres messages',
      );
    }

    await this.prisma.message.delete({ where: { id } });

    return { message: 'Message supprimé avec succès' };
  }

  // ── Conversation entre deux utilisateurs ─────────────────
  async getConversation(userId: string, otherUserId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { email: true, role: true } },
        receiver: { select: { email: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      total: messages.length,
      messages,
    };
  }

  // ────────────────────────────────────────────────────────
  // ANNONCES
  // ────────────────────────────────────────────────────────

  // ── Créer une annonce ────────────────────────────────────
  async createAnnouncement(dto: CreateAnnouncementDto) {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        content: dto.content,
        targetRole: dto.targetRole ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    return {
      message: 'Annonce créée avec succès',
      announcement,
    };
  }

  // ── Lister les annonces ──────────────────────────────────
  async findAllAnnouncements(role?: string) {
    const now = new Date();

    const announcements = await this.prisma.announcement.findMany({
      where: {
        // Annonces non expirées
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
        // Annonces pour ce rôle ou pour tout le monde
        AND: [
          {
            OR: [
              { targetRole: null },
              ...(role ? [{ targetRole: role as any }] : []),
            ],
          },
        ],
      },
      orderBy: { publishedAt: 'desc' },
    });

    return {
      total: announcements.length,
      announcements,
    };
  }

  // ── Voir une annonce ─────────────────────────────────────
  async findOneAnnouncement(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Annonce introuvable');
    }

    return announcement;
  }

  // ── Supprimer une annonce ────────────────────────────────
  async deleteAnnouncement(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Annonce introuvable');
    }

    await this.prisma.announcement.delete({ where: { id } });

    return { message: 'Annonce supprimée avec succès' };
  }

  // ── Statistiques messages ────────────────────────────────
  async getStats(userId: string) {
    const [received, sent, unread] = await Promise.all([
      this.prisma.message.count({ where: { receiverId: userId } }),
      this.prisma.message.count({ where: { senderId: userId } }),
      this.prisma.message.count({
        where: { receiverId: userId, isRead: false },
      }),
    ]);

    return { received, sent, unread };
  }
}