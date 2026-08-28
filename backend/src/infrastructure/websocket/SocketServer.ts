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
        this.connectedUsers.set(userId, socket.id);
        socket.join(userId); // Join a room of their own ID
        Logger.info(`User ${userId} registered on socket ${socket.id}`);
      });

      socket.on('disconnect', () => {
        // Remove from connected users
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId);
            Logger.info(`User ${userId} disconnected`);
            break;
          }
        }
      });
    });

    Logger.info('✅ WebSocket Server initialized');
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
