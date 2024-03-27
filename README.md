# Messenger

### Table of content

- [Intro](#intro)
- [Deployment](#deployment)
- [Technologies](#technologies)
- [Functionality](#functionality)
- [Future Updates](#future-updates)

## Intro

Messenger is a web-based real-time chat application provides functionality for users to create accounts, add contacts, send private messages, and customize profiles with avatars and privacy settings.

This repository contains server code. For client code visit [this repository](https://github.com/Heaven664/messenger).

## Deployment

This application is deployed for public usage at [https://messenger664.vercel.app](https://messenger664.vercel.app).

I chose not to create a shared account and skipping the registration step for visitors. Maintaining such an account would require constant monitoring and removal of inappropriate messages.

Therefore, each user will need to create their own private account. Feel free to remain anonymous and register with a fake email, as it primarily serves as a unique user identification and will not be used for mailing.

## Technologies

- [Client](#client)
- [Server](#server)
- [Database](#database)
- [Protocols](#protocols)
- [Authentication](#authentication)
- [Images](#images)
- [Responsiveness](#responsiveness)
- [Styling](#styling)

### <span style="color: #4a9a64"> Client</span>

The client application was built on [NEXT.js](https://nextjs.org/). This framework was chosen to enhance [React.js](https://react.dev/) functionality, by utilizing its built-in features:

- Server-side Rendering (SSR)
- File-based Routing
- Image Optimization
- Authentication

### <span style="color: #4a9a64"> Server</span>

The server application was built on [NEST.js](https://nestjs.com/). This framework was chosen to enhance [Express.js](https://expressjs.com/) functionality, by utilizing its features:

- Application Architecture
- TypeScript Support
- Dependency Injection
- Built-in Support for WebSockets

### <span style="color: #4a9a64"> Database</span>

Although an SQL database would be more native for a chat application, given the relationships between entities, [MongoDB](https://www.mongodb.com/) was chosen to gain more experience working with it.

Database interactions were managed using the [Mongoose.js](https://mongoosejs.com/) library, providing a higher level of abstraction and additional features built on top of the MongoDB Node.js driver.

Due to the various interconnected database queries, I had the opportunity to utilize [transactions](https://www.mongodb.com/docs/manual/core/transactions/) to ensure the atomicity of the commands.

### <span style="color: #4a9a64"> Protocols</span>

This application utilizes both [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) and [WebSocket (WS)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) protocols for client-server communication. Actions that require real-time notifications to other users, such as messaging, are executed through WebSockets, and subsequent logic, like database saving, is achieved through dependency injection of other services in NEST.js into the WebSocket gateway methods.

WebSocket interactions are implemented using the [Socket.io](https://socket.io/) library, while HTTP requests are sent using the [Axios](https://axios-http.com/docs/intro) library.

### <span style="color: #4a9a64"> Authentication</span>

Authentication is implemented using JWT. It issues access and refresh tokens to users, allowing them to stay signed in.

This mechanism also protects routes, ensuring that only authenticated users can perform dangerous HTTP requests.

Additionally, it verifies a user's identity, safeguarding the app from malicious requests attempting to perform actions on behalf of other users.

Authentication is handled with [NextAuth.js](https://next-auth.js.org/) on the client side and [@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt) library on the server side.

### <span style="color: #4a9a64"> Images</span>

Due to a cheap hosting service, there are limits on upload speeds. To reduce traffic load, images are compressed to enhance UX and decrease processing time.

Images are compressed on the client side using [compressor.js](https://www.npmjs.com/package/compressorjs) to maintain a maximum width but the aspect ratio preserved through dynamic calculation of image dimensions. On the server side, image saving is handled by [Multer](https://www.npmjs.com/package/multer).

### <span style="color: #4a9a64"> Responsiveness</span>

The application is fully responsive, adapting its UI to fit various screen sizes seamlessly.

### <span style="color: #4a9a64"> Styling</span>

While most components are custom-built and styled from scratch, the project incorporates several [Material UI](https://mui.com) components, such as Accordion, Switch buttons, and Text fields, to speed up the development process.

Custom styling is implemented using the SASS extension language to harness its advanced features:

- Variables
- Nesting
- Mixins

## Functionality

- [Login](#login)
- [Profile](#profile)
- [Contacts](#contacts)
- [Chats](#chats)
- [Messages](#messages)
- [Settings](#settings)

### <span style="color: #4a9a64"> Login</span>

Every user must create a personal account to interact with the application. Upon successful login, users are issued a JWT token to remain logged in for a certain period. Additionally, a socket event is emitted to notify their contacts that they are online.

https://github.com/Heaven664/messenger/assets/105215745/3c984427-be3d-488f-9050-4ba86bea4216

### <span style="color: #4a9a64"> Profile</span>

Clicking on either an image or the name of a contact within a chat window redirects you to their profile page, where you can view their essential details, including location, name, and email address. Or you can see your own information by clicking on profile icon on navigation bar. Also users can log out on the profile page.

https://github.com/Heaven664/messenger/assets/105215745/b0a30e66-e6df-431a-9495-3b4fd5a9d4da

### <span style="color: #4a9a64"> Contacts</span>

Users can add contacts by entering the email address of a contact they used for registration, which serves as a unique identifier for each user. The application permits users to add contacts without requiring confirmation, enabling immediate conversation initiation. When a user adds a new contact, the contact receives a real-time notification via web-sockets and can also view their new contact. Contacts can be removed.

https://github.com/Heaven664/messenger/assets/105215745/392d7f81-df8c-42e8-bfdb-c6be98dd1c94

### <span style="color: #4a9a64"> Chats</span>

After a user sends first message to their new contact a new chat will be created. Chats are sorted based on the timestamp of the last message sent, it means that when there is a new message in a chat - chat will be automatically moved to the top of the list.

https://github.com/Heaven664/messenger/assets/105215745/6caf5d99-225b-42fc-8015-d36b7bb5c025

### <span style="color: #4a9a64"> Messages</span>

Users can send private messages to each other. Messages are sent via web-sockets same as events connected with the messages like updating 'isViewed' property on message object. Massages also include a timestamp of the time they were sent converted to a local time.

https://github.com/Heaven664/messenger/assets/105215745/9ad0274e-4024-4222-8a24-b3b0d0e0612c

### <span style="color: #4a9a64"> Settings</span>

In the settings section, users can update some of their personal information and configure privacy settings, including the "last seen" permission. When the "last seen" permission is enabled, other users can see the last time a user was online in the chat window if the user is currently offline. Additionally, users have the option to upload their profile images.

https://github.com/Heaven664/messenger/assets/105215745/0650ed9e-24f9-41eb-b321-6cc7926ea829

## Future Updates

This application serves as my primary pet project, and I am dedicated to releasing additional features in future updates and working on current ~~bugs~~(features). Currently, the main objective was to develop a functional application that meets the core requirements of a chat app. Stay tuned to this section for upcoming updates. I will update it as soon as I determine the next steps. Thank you for your interest!
 