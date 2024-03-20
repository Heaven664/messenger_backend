import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { corsOptions } from 'config/cors.config';
import { Socket, Server } from 'socket.io';
import { AddMessageDto } from './dto/message-dto';

@WebSocketGateway({ cors: corsOptions })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('client connected', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('client disconnected', client.id);
  }

  @SubscribeMessage('join')
  onJoin(@MessageBody() email: string, @ConnectedSocket() client: Socket) {
    // Join the room with the client email address
    client.join(email);
  }

  @SubscribeMessage('private message')
  onPrivateMessage(@MessageBody() message: AddMessageDto) {
    // Send the message to the receiver and the sender
    this.server.to(message.receiverEmail).emit('private message', message);
    this.server.to(message.senderEmail).emit('private message', message);
  }
}
