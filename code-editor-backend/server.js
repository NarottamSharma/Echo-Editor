import express from 'express'
import {Server} from 'socket.io'
import cors from 'cors'
import {createServer} from 'http'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'
import Session from './models/Session.js'
import User from './models/User.js'

// Load environment variables
dotenv.config()

const app = express()
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"]
}))
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echo-editor')
  .then(() => console.log('📁 Connected to MongoDB Atlas'))
  .catch(err => {
    console.warn('⚠️  MongoDB not available, running in memory-only mode')
    console.warn('   Database features will be limited until MongoDB is connected')
    console.error('   MongoDB error:', err.message)
  })

const server = createServer(app)
const io = new Server(server,{
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods:["GET","POST"]
  }
})

// Store active rooms and users
const activeRooms = new Map()
const activeSockets = new Map() // Track socket.id -> user info

// In-memory fallback when DB is not available
const memoryStorage = {
  sessions: new Map(),
  users: new Map()
}

// Helper function to check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1

// Clean up stale users periodically
setInterval(async () => {
  console.log('🧹 Cleaning up stale users...')
  
  for (const [roomId, socketIds] of activeRooms.entries()) {
    if (socketIds.size === 0) {
      activeRooms.delete(roomId)
      continue
    }

    let session
    if (isMongoConnected()) {
      session = await Session.findOne({ roomId })
    } else {
      session = memoryStorage.sessions.get(roomId)
    }

    if (session) {
      // Remove users whose sockets are no longer connected
      const activeUserIds = Array.from(socketIds).map(socketId => activeSockets.get(socketId)?.userId).filter(Boolean)
      session.activeUsers = session.activeUsers.filter(user => activeUserIds.includes(user.userId))
      
      if (isMongoConnected()) {
        await session.save()
      }
      
      // Broadcast updated user list
      io.to(roomId).emit('user-list-updated', {
        users: session.activeUsers
      })
    }
  }
}, 30000) // Clean up every 30 seconds

// REST API Routes
app.get('/api/sessions/:roomId', async (req, res) => {
  try {
    let session
    if (isMongoConnected()) {
      session = await Session.findOne({ roomId: req.params.roomId })
    } else {
      session = memoryStorage.sessions.get(req.params.roomId)
    }
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }
    res.json(session)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session' })
  }
})

app.post('/api/sessions', async (req, res) => {
  try {
    const { title, language } = req.body
    const roomId = uuidv4()
    
    const sessionData = {
      roomId,
      title: title || 'Untitled Session',
      language: language || 'javascript',
      code: "// Welcome to Echo Editor!\n// Start typing to collaborate in real-time\n\nconsole.log('Hello, collaborative world!');",
      activeUsers: [],
      createdAt: new Date(),
      lastModified: new Date()
    }
    
    if (isMongoConnected()) {
      const session = new Session(sessionData)
      await session.save()
      res.json({ roomId, session: sessionData })
    } else {
      memoryStorage.sessions.set(roomId, sessionData)
      res.json({ roomId, session: sessionData })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' })
  }
})

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`)

  // Join room
  socket.on('join-room', async (data) => {
    const { roomId, user } = data
    
    try {
      // Find or create session
      let session
      if (isMongoConnected()) {
        session = await Session.findOne({ roomId })
        if (!session) {
          session = new Session({ roomId })
          await session.save()
        }
      } else {
        session = memoryStorage.sessions.get(roomId)
        if (!session) {
          session = {
            roomId,
            title: 'Collaborative Session',
            code: "// Welcome to Echo Editor!\n// Start typing to collaborate in real-time\n\nconsole.log('Hello, collaborative world!');",
            language: 'javascript',
            activeUsers: [],
            createdAt: new Date(),
            lastModified: new Date()
          }
          memoryStorage.sessions.set(roomId, session)
        }
      }

      // Create or update user
      const userId = user.userId || uuidv4()
      const username = user.username || `User ${socket.id.slice(0, 4)}`
      const userColor = user.color || `#${Math.floor(Math.random()*16777215).toString(16)}`

      if (isMongoConnected()) {
        await User.findOneAndUpdate(
          { userId },
          { 
            userId,
            username, 
            color: userColor,
            currentRoom: roomId,
            lastSeen: new Date()
          },
          { upsert: true, new: true }
        )
      } else {
        memoryStorage.users.set(userId, {
          userId,
          username,
          color: userColor,
          currentRoom: roomId,
          lastSeen: new Date()
        })
      }

      // Use atomic operations to avoid version conflicts
      if (isMongoConnected()) {
        // Remove existing user and add new one atomically
        await Session.updateOne(
          { roomId },
          { 
            $pull: { activeUsers: { userId } },
            $set: { lastModified: new Date() }
          }
        )
        
        const updatedSession = await Session.findOneAndUpdate(
          { roomId },
          { 
            $push: { activeUsers: { userId, username, color: userColor, joinedAt: new Date() } },
            $set: { lastModified: new Date() }
          },
          { new: true }
        )
        
        session = updatedSession || session
      } else {
        // For memory storage, just update normally
        session.activeUsers = session.activeUsers.filter(u => u.userId !== userId)
        session.activeUsers.push({ userId, username, color: userColor, joinedAt: new Date() })
      }

      // Join socket room
      socket.join(roomId)
      socket.userId = userId
      socket.roomId = roomId
      socket.username = username
      socket.userColor = userColor

      // Store room info and socket tracking
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, new Set())
      }
      activeRooms.get(roomId).add(socket.id)
      
      // Track this socket
      activeSockets.set(socket.id, { userId, username, roomId, userColor })

      // Send current session data to user
      socket.emit('session-data', {
        code: session.code,
        language: session.language,
        title: session.title,
        users: session.activeUsers
      })

      // Broadcast user joined to room
      socket.to(roomId).emit('user-joined', {
        userId,
        username,
        color: userColor,
        users: session.activeUsers
      })

      console.log(`👥 ${username} joined room ${roomId}`)

    } catch (error) {
      console.error('Error joining room:', error)
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  // Handle code changes
  socket.on('code-change', async (data) => {
    const { code, roomId } = data
    
    try {
      // Update session in database or memory
      if (isMongoConnected()) {
        await Session.findOneAndUpdate(
          { roomId },
          { code, lastModified: new Date() }
        )
      } else {
        const session = memoryStorage.sessions.get(roomId)
        if (session) {
          session.code = code
          session.lastModified = new Date()
        }
      }

      // Broadcast to all users in room except sender
      socket.to(roomId).emit('code-receive', {
        code,
        userId: socket.userId,
        username: socket.username
      })

    } catch (error) {
      console.error('Error updating code:', error)
    }
  })

  // Handle language change
  socket.on('language-change', async (data) => {
    const { language, roomId } = data
    
    try {
      if (isMongoConnected()) {
        await Session.findOneAndUpdate(
          { roomId },
          { language, lastModified: new Date() }
        )
      } else {
        const session = memoryStorage.sessions.get(roomId)
        if (session) {
          session.language = language
          session.lastModified = new Date()
        }
      }

      socket.to(roomId).emit('language-changed', {
        language,
        userId: socket.userId,
        username: socket.username
      })

    } catch (error) {
      console.error('Error updating language:', error)
    }
  })

  // Handle cursor position (for user presence)
  socket.on('cursor-move', (data) => {
    const { position, selection } = data
    socket.to(socket.roomId).emit('user-cursor', {
      userId: socket.userId,
      username: socket.username,
      color: socket.userColor,
      position,
      selection
    })
  })

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`👋 User disconnected: ${socket.id}`)
    
    const socketInfo = activeSockets.get(socket.id)
    if (socketInfo) {
      const { userId, username, roomId } = socketInfo
      
      try {
        // Clean up socket tracking first
        activeSockets.delete(socket.id)
        
        // Clean up room tracking
        if (activeRooms.has(roomId)) {
          activeRooms.get(roomId).delete(socket.id)
          if (activeRooms.get(roomId).size === 0) {
            activeRooms.delete(roomId)
          }
        }
        
        // Check if this user has other active connections in the same room
        const userStillInRoom = Array.from(activeSockets.values()).some(
          info => info.userId === userId && info.roomId === roomId
        )
        
        // Only remove user from session if they have no other active connections
        if (!userStillInRoom) {
          let session
          if (isMongoConnected()) {
            // Use atomic operation to remove user
            session = await Session.findOneAndUpdate(
              { roomId },
              { 
                $pull: { activeUsers: { userId } },
                $set: { lastModified: new Date() }
              },
              { new: true }
            )

            // Update user's current room
            await User.findOneAndUpdate(
              { userId },
              { currentRoom: null, lastSeen: new Date() }
            )
          } else {
            session = memoryStorage.sessions.get(roomId)
            if (session) {
              session.activeUsers = session.activeUsers.filter(u => u.userId !== userId)
            }

            const user = memoryStorage.users.get(userId)
            if (user) {
              user.currentRoom = null
              user.lastSeen = new Date()
            }
          }

          if (session) {
            // Broadcast user left to room
            socket.to(roomId).emit('user-left', {
              userId,
              username,
              users: session.activeUsers
            })
            
            console.log(`🚪 ${username} left room ${roomId}`)
          }
        } else {
          console.log(`� ${username} still has other connections in room ${roomId}`)
        }

      } catch (error) {
        console.error('Error handling disconnect:', error)
      }
    }
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`))
