import express from 'express'
import {Server} from 'socket.io'
import cors from 'cors'
import {createServer} from 'http'

const app = express()
app.use(cors())
app.use(express.json())

const server = createServer(app)
const io = new Server(server,{
  cors: {
    origin:"http://localhost:5173",
    methods:["GET","POST"]
  }
})

io.on('connection',(socket)=>{
  console.log(`A user connected : ${socket.id}`);

  socket.on('code-change',(code)=>{
    socket.broadcast.emit('code-receive',code)
  })

  socket.on('disconnect',()=>{
    console.log(`User disconnectd: ${socket.id}`);
  })
})

const PORT = 3001
server.listen(PORT,() => console.log(`Server listening on port ${PORT}`))
