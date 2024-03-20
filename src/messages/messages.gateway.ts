import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { corsOptions } from 'config/cors.config';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: corsOptions })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  handleConnection(client: Socket) {
    console.log('client connected', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('client disconnected', client.id);
  }
}
