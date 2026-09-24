import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

export interface Notification {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    private gateway: NotificationsGateway, // ← Gateway injecté ici
  ) {}

  notifyUser(userId: string, notification: Notification) {
    this.gateway.sendToUser(userId, notification);
  }

  notifyAdmins(notification: Notification) {
    this.gateway.sendToRole('ADMIN', notification);
  }

  notifyTeachers(notification: Notification) {
    this.gateway.sendToRole('TEACHER', notification);
  }

  notifyAll(notification: Notification) {
    this.gateway.sendToAll(notification);
  }

  onStudentCreated(studentName: string) {
    this.notifyAdmins({
      type: 'success',
      title: 'Nouvel élève inscrit',
      message: `${studentName} vient d'être inscrit(e)`,
    });
  }

  onAbsenceDetected(studentName: string, parentUserId: string) {
    this.notifyUser(parentUserId, {
      type: 'warning',
      title: 'Absence détectée',
      message: `${studentName} est absent(e) aujourd'hui`,
    });
    this.notifyAdmins({
      type: 'warning',
      title: 'Absence signalée',
      message: `${studentName} est absent(e) aujourd'hui`,
    });
  }

  onNewMessage(receiverUserId: string, senderName: string, subject: string) {
    this.notifyUser(receiverUserId, {
      type: 'info',
      title: `Message de ${senderName}`,
      message: subject,
    });
  }

  onPaymentReceived(
    studentName: string,
    amount: number,
    parentUserId?: string,
  ) {
    this.notifyAdmins({
      type: 'success',
      title: 'Paiement reçu',
      message: `${studentName} — ${amount.toLocaleString('fr-FR')} Ar`,
    });
    if (parentUserId) {
      this.notifyUser(parentUserId, {
        type: 'success',
        title: 'Paiement confirmé',
        message: `Paiement de ${amount.toLocaleString('fr-FR')} Ar enregistré`,
      });
    }
  }

  onAnnouncementCreated(title: string) {
    this.notifyAll({
      type: 'info',
      title: 'Nouvelle annonce',
      message: title,
    });
  }
}