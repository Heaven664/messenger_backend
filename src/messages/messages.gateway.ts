import { MessagesService } from './messages.service';
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
  constructor(private messagesService: MessagesService) {}

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

  @SubscribeMessage('message read')
  async onReadMessage(
    @MessageBody('senderEmail') senderEmail: string,
    @MessageBody('receiverEmail') receiverEmail: string,
  ) {
    // Read the messages in the database
    await this.messagesService.readMessages(receiverEmail, senderEmail);
    // Send the message read event to the sender
    this.server.to(senderEmail).emit('message read', receiverEmail);
  }
}
