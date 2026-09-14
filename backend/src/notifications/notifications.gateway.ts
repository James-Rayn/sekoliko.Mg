import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map userId → socketId pour cibler les utilisateurs
  private userSockets = new Map<string, string>();

  constructor(private notificationsService: NotificationsService) {}

  // ── Connexion d'un client ────────────────────────────────
  handleConnection(client: Socket) {
    console.log(`🔌 Client connecté : ${client.id}`);
  }

  // ── Déconnexion d'un client ──────────────────────────────
  handleDisconnect(client: Socket) {
    console.log(`🔌 Client déconnecté : ${client.id}`);
    // Supprimer de la map
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  // ── Enregistrer l'utilisateur connecté ──────────────────
  // Le frontend envoie son userId dès la connexion
  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    this.userSockets.set(data.userId, client.id);
    console.log(`✅ User ${data.userId} enregistré sur socket ${client.id}`);

    // Rejoindre une room par userId
    client.join(`user:${data.userId}`);

    return { status: 'registered' };
  }

  // ── Envoyer une notification à un utilisateur ────────────
  sendToUser(
    userId: string,
    notification: {
      type: string;
      title: string;
      message: string;
      data?: any;
    },
  ) {
    this.server.to(`user:${userId}`).emit('notification', {
      ...notification,
      createdAt: new Date(),
      read: false,
    });
  }

  // ── Envoyer une notification à tous les admins ───────────
  sendToAll(notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    this.server.emit('notification', {
      ...notification,
      createdAt: new Date(),
      read: false,
    });
  }

  // ── Envoyer une notification à un rôle ──────────────────
  sendToRole(
    role: string,
    notification: {
      type: string;
      title: string;
      message: string;
      data?: any;
    },
  ) {
    this.server.to(`role:${role}`).emit('notification', {
      ...notification,
      createdAt: new Date(),
      read: false,
    });
  }

  // ── Rejoindre une room par rôle ──────────────────────────
  @SubscribeMessage('join-role')
  handleJoinRole(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { role: string },
  ) {
    client.join(`role:${data.role}`);
    return { status: 'joined', role: data.role };
  }
}