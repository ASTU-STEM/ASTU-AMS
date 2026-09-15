import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Logger } from '../../core/utils/logger.utils';

export class SocketServer {
  private static io: SocketIOServer;
  private static connectedUsers = new Map<string, string>(); // userId -> socketId

  public static initialize(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket: Socket) => {
      Logger.info(`Client connected: ${socket.id}`);

      // Expect client to send their ID when connecting
      socket.on('register', (userId: string) => {
        if (userId) {
          this.connectedUsers.set(userId, socket.id);
          socket.join(userId); // Join a room of their own ID
          Logger.info(`User ${userId} registered on socket ${socket.id}`);
          
          // Send current online user list to caller and broadcast update
          socket.emit('online-users', Array.from(this.connectedUsers.keys()));
          socket.broadcast.emit('user-status-changed', { userId, online: true });
        }
      });

      // WebRTC Real-Time Voice & Video Signaling Handlers
      socket.on('call-user', (data: { targetUserId: string; callerId: string; callerName: string; offer: any; callType?: 'voice' | 'video' }) => {
        Logger.info(`${data.callType || 'voice'} call initiated from ${data.callerName} (${data.callerId}) to ${data.targetUserId}`);
        this.io.to(data.targetUserId).emit('incoming-call', {
          callerId: data.callerId,
          callerName: data.callerName,
          offer: data.offer,
          callType: data.callType || 'voice'
        });
      });

      socket.on('answer-call', (data: { targetUserId: string; answer: any }) => {
        Logger.info(`Voice call answered by target ${data.targetUserId}`);
        this.io.to(data.targetUserId).emit('call-answered', { answer: data.answer });
      });

      socket.on('ice-candidate', (data: { targetUserId: string; candidate: any }) => {
        this.io.to(data.targetUserId).emit('ice-candidate', { candidate: data.candidate });
      });

      socket.on('end-call', (data: { targetUserId: string }) => {
        this.io.to(data.targetUserId).emit('call-ended');
      });

      socket.on('reject-call', (data: { targetUserId: string }) => {
        this.io.to(data.targetUserId).emit('call-rejected');
      });

      // Google Meet Interactive Feature Events
      socket.on('meeting-reaction', (data: { targetUserId: string; emoji: string; senderName: string }) => {
        this.io.to(data.targetUserId).emit('meeting-reaction', { emoji: data.emoji, senderName: data.senderName });
      });

      socket.on('meeting-raise-hand', (data: { targetUserId: string; isHandRaised: boolean; senderName: string }) => {
        this.io.to(data.targetUserId).emit('meeting-raise-hand', { isHandRaised: data.isHandRaised, senderName: data.senderName });
      });

      socket.on('meeting-incall-message', (data: { targetUserId: string; text: string; senderName: string; time: string }) => {
        this.io.to(data.targetUserId).emit('meeting-incall-message', { text: data.text, senderName: data.senderName, time: data.time });
      });

      socket.on('meeting-captions', (data: { targetUserId: string; text: string; senderName: string }) => {
        this.io.to(data.targetUserId).emit('meeting-captions', { text: data.text, senderName: data.senderName });
      });

      socket.on('meeting-recording-status', (data: { targetUserId: string; isRecording: boolean; senderName: string }) => {
        this.io.to(data.targetUserId).emit('meeting-recording-status', { isRecording: data.isRecording, senderName: data.senderName });
      });

      socket.on('meeting-security-update', (data: { targetUserId: string; isMeetingLocked: boolean; senderName: string }) => {
        this.io.to(data.targetUserId).emit('meeting-security-update', { isMeetingLocked: data.isMeetingLocked, senderName: data.senderName });
      });

      socket.on('disconnect', () => {
        // Remove from connected users
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId);
            Logger.info(`User ${userId} disconnected`);
            this.io.emit('user-status-changed', { userId, online: false });
            break;
          }
        }
      });
    });

    Logger.info('✅ WebSocket Server initialized');
  }

  public static getOnlineUserIds(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public static isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  public static getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io has not been initialized');
    }
    return this.io;
  }

  public static emitToUser(userId: string, event: string, payload: any) {
    if (this.io) {
      this.io.to(userId).emit(event, payload);
    }
  }
}
