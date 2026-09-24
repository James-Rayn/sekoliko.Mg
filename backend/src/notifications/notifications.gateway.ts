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
  server!: Server;

  // ── Connexion ────────────────────────────────────────────
  handleConnection(client: Socket) {
    console.log(`🔌 Client connecté : ${client.id}`);
  }

  // ── Déconnexion ──────────────────────────────────────────
  handleDisconnect(client: Socket) {
    console.log(`🔌 Client déconnecté : ${client.id}`);
  }

  // ── Enregistrer l'utilisateur ────────────────────────────
  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    client.join(`user:${data.userId}`);
    console.log(`✅ User ${data.userId} enregistré`);
    return { status: 'registered' };
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

  // ── Envoyer à un utilisateur ─────────────────────────────
  sendToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', {
      ...notification,
      createdAt: new Date(),
      read: false,
    });
  }

  // ── Envoyer à un rôle ────────────────────────────────────
  sendToRole(role: string, notification: any) {
    this.server.to(`role:${role}`).emit('notification', {
      ...notification,
      createdAt: new Date(),
      read: false,
    });
  }

  // ── Envoyer à tout le monde ──────────────────────────────
  sendToAll(notification: any) {
    this.server.emit('notification', {
      ...notification,
      createdAt: new Date(),
      read: false,
    });
  }
}