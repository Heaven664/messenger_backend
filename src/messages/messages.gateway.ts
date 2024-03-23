import { UsersService } from 'src/users/users.service';
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
import { ChatsService } from 'src/chats/chats.service';
import { ModuleRef } from '@nestjs/core';
import { OnModuleInit } from '@nestjs/common';
import { Chat } from 'src/chats/schema/chats.schema';
import { ContactsService } from 'src/contacts/contacts.service';

@WebSocketGateway({ cors: corsOptions })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  private chatsService: ChatsService;
  private usersService: UsersService;
  private contactsService: ContactsService;

  constructor(
    private messagesService: MessagesService,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.chatsService = this.moduleRef.get(ChatsService, { strict: false });
    this.usersService = this.moduleRef.get(UsersService, { strict: false });
    this.contactsService = this.moduleRef.get(ContactsService, {
      strict: false,
    });
  }

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('client connected', client.id);
  }

  async handleDisconnect(client: Socket) {
    const disconnectionTimestamp = new Date().getTime();
    // Update user offline status in users collection
    await this.usersService.makeUserOffline(
      client.data.email,
      disconnectionTimestamp,
    );
    // Update user activity status in chats collections and update last seen time
    await this.chatsService.makeUserOffline(
      client.data.email,
      disconnectionTimestamp,
    );
    // Send the offline event to the contacts
    const chats = await this.chatsService.findAllChats(client.data.email);
    const contacts = chats.map((chat: Chat) => chat.friendEmail);
    for (const contact of contacts) {
      this.server.to(contact).emit('friend offline', client.data.email);
      this.server.to(contact).emit('check header offline status', {
        email: client.data.email,
        lastSeenTime: disconnectionTimestamp,
      });
    }
    console.log('client disconnected', client.id);
  }

  @SubscribeMessage('join')
  async onJoin(
    @MessageBody() email: string,
    @ConnectedSocket() client: Socket,
  ) {
    // Join the room with the client email address
    client.join(email);
    // Save the email address in the client data
    client.data.email = email;
    // Update user online status in users collection
    await this.usersService.makeUserOnline(email);
    // Update user activity status in chats collections
    await this.chatsService.makeUserOnline(email);
    // Send the online event to the contacts
    const chats = await this.chatsService.findAllChats(email);
    const contacts = chats.map((chat: Chat) => chat.friendEmail);
    for (const contact of contacts) {
      this.server.to(contact).emit('friend online', email);
      this.server.to(contact).emit('check header online status', email);
    }
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
    this.server.to(senderEmail).emit('message read');
  }

  @SubscribeMessage('add contact')
  async onAddContact(
    @MessageBody('userEmail') userEmail: string,
    @MessageBody('friendEmail') friendEmail: string,
  ) {
    // Find the friendship between the two users
    const contact = await this.contactsService.findFriendship(
      friendEmail,
      userEmail,
    );
    const friendship = contact ? contact.friendship : null;

    // Send socket event to the user who got added to update their contacts
    this.server
      .to(friendEmail)
      .emit('new contact', { friendship, adderEmail: userEmail });
  }
}
