# Real-Time Chat Application (WebSockets)

A full-stack chat application that supports real-time group and private messaging. The backend is built with Express, Socket.IO, and MongoDB, while the frontend is a React + Vite SPA styled with Tailwind CSS. Authentication is handled with JWT stored in HTTP-only cookies, and chat history is persisted in MongoDB.

## Features

- User registration and login with JWT-based authentication
- Real-time messaging via Socket.IO (group chat and private 1:1 chat)
- Message persistence for group and private chats
- Online member list for the global room
- Responsive, monochrome UI with form validation

## Tech Stack

**Backend**
- Node.js + Express (TypeScript)
- Socket.IO (WebSocket transport)
- MongoDB + Mongoose
- JWT authentication + bcrypt password hashing
- Cookie-based auth for HTTP and Socket.IO

**Frontend**
- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- React Router 7
- Socket.IO client

**Infrastructure / Tooling**
- Docker Compose for MongoDB + Mongo Express (optional)

## Architecture Overview

### Authentication flow
1. User signs up or logs in via REST endpoints (`/auth/create-user`, `/auth/login`).
2. On successful login, the server issues a JWT and stores it in an HTTP-only cookie (`auth_token`).
3. Protected REST APIs and Socket.IO connections validate the cookie token.

### WebSocket flow
- The client connects to the Socket.IO server and immediately emits `join-room` for the global room (`_chat_room`).
- The server broadcasts connected members via the `member` event.
- Private chat uses a per-user room joined through `private-room`.
- Messages are persisted to MongoDB and broadcast to the correct room.

### Data persistence
- Group messages are stored in the `GroupChat` collection.
- Private messages are stored in the `Conversation` collection.
- Messages are fetched on demand through REST endpoints.

## Project Structure

```
chat_application_websockets/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Express + Socket.IO server
│   │   ├── server.ts              # Server entry point
│   │   ├── config/                # Env + DB connection
│   │   ├── controller/            # Route handlers
│   │   ├── middleware/            # JWT auth for HTTP & Socket.IO
│   │   ├── model/                 # Mongoose schemas
│   │   ├── routes/                # API routing
│   │   └── types/                 # Global types
│   ├── docker-compose.yml
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Routes
│   │   ├── components/            # UI components
│   │   ├── hooks/                 # Socket hook
│   │   ├── consts/                # URLs & room constants
│   │   ├── types/                 # Global types
│   │   └── utils/                 # Validation helpers
│   └── package.json
└── Readme.md
```

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm
- MongoDB (local or via Docker)

### 1) Configure environment
Copy and update the backend env file:

```bash
cp backend/.env.example backend/.env
```

Set at least the following values in `backend/.env`:

```bash
MONGO_URI=mongodb://localhost:27017/chat_app
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10
PORT=3000
```

### 2) (Optional) Start MongoDB with Docker Compose

```bash
cd backend
docker-compose up -d
```

This also starts **mongo-express** on `http://localhost:8081`.

### 3) Start the backend

```bash
cd backend
npm install
npm run dev
```

Server runs at `http://localhost:3000`.

### 4) Start the frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## API Endpoints

### Authentication
- `POST /auth/create-user` — Register a new user
- `POST /auth/login` — Login and receive JWT cookie

### Chat History
- `GET /api/v1/pchat/:selectedUserId` — Private chat history between two users
- `GET /api/v1/gchat/:roomId` — Group chat history for a room

## WebSocket Events

**Client → Server**
- `join-room` — Join a global room (`_chat_room`)
- `private-room` — Join a user-specific room for 1:1 chat
- `send_message` — Send a group message
- `send_private_message` — Send a private message

**Server → Client**
- `member` — Member list updates for the global room
- `receive_message` — Group message broadcast
- `receive_private_message` — Private message delivery

## Data Models (MongoDB)

**User**
```ts
{
  fname: string,
  lname: string,
  email: string, // unique
  password: string, // hashed
  address: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Conversation (Private chat)**
```ts
{
  sender: ObjectId,   // User
  receiver: ObjectId, // User
  message: string,
  timestamp: Date
}
```

**GroupChat (Group messages)**
```ts
{
  sender: ObjectId, // User
  receiver: string, // room ID
  message: string,
  timestamp: Date
}
```

## Development Scripts

**Backend**
- `npm run dev` — Start dev server (tsx watch)
- `npm run build` — TypeScript build
- `npm start` — Run compiled server

**Frontend**
- `npm run dev` — Start Vite dev server
- `npm run lint` — Lint frontend
- `npm run build` — TypeScript build + Vite build
- `npm run preview` — Preview production build
