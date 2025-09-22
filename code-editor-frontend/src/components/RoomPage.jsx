import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import io from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'
import UserList from './UserList'

const RoomPage = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [code, setCode] = useState("// Loading...")
  const [language, setLanguage] = useState('javascript')
  const [users, setUsers] = useState([])
  const [sessionTitle, setSessionTitle] = useState('Loading...')
  const [isConnected, setIsConnected] = useState(false)
  const [username, setUsername] = useState('')
  const [userId, setUserId] = useState('')
  
  const editorRef = useRef(null)
  const socketRef = useRef(null)

  // Available languages
  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'typescript', name: 'TypeScript', icon: '🔷' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'csharp', name: 'C#', icon: '💜' },
    { id: 'html', name: 'HTML', icon: '🌐' },
    { id: 'css', name: 'CSS', icon: '🎨' },
    { id: 'json', name: 'JSON', icon: '📋' },
    { id: 'markdown', name: 'Markdown', icon: '📝' }
  ]

  useEffect(() => {
    // Get user info
    const usernameParam = searchParams.get('username')
    const storedUsername = usernameParam || localStorage.getItem('username')
    const storedUserId = localStorage.getItem('userId') || uuidv4()
    
    if (!storedUsername) {
      navigate('/')
      return
    }

    setUsername(storedUsername)
    setUserId(storedUserId)
    localStorage.setItem('userId', storedUserId)
    localStorage.setItem('username', storedUsername)

    // Initialize socket connection
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001"
    socketRef.current = io.connect(socketUrl)
    
    socketRef.current.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
      
      // Join room
      socketRef.current.emit('join-room', {
        roomId,
        user: {
          userId: storedUserId,
          username: storedUsername,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        }
      })
    })

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    // Session data received
    socketRef.current.on('session-data', (data) => {
      console.log('Session data received:', data)
      console.log('Users from session-data:', data.users)
      setCode(data.code || "// Welcome to Echo Editor!")
      setLanguage(data.language || 'javascript')
      setSessionTitle(data.title || 'Collaborative Session')
      setUsers(data.users || [])
    })

    // Code updates from other users
    socketRef.current.on('code-receive', (data) => {
      console.log('Code received from:', data.username)
      setCode(data.code)
    })

    // Language changes
    socketRef.current.on('language-changed', (data) => {
      console.log('Language changed to:', data.language, 'by', data.username)
      setLanguage(data.language)
    })

    // User joined
    socketRef.current.on('user-joined', (data) => {
      console.log('User joined:', data.username)
      console.log('Updated users after join:', data.users)
      setUsers(data.users)
    })

    // User left
    socketRef.current.on('user-left', (data) => {
      console.log('User left:', data.username)
      console.log('Updated users after leave:', data.users)
      setUsers(data.users)
    })

    // User list updated (from cleanup)
    socketRef.current.on('user-list-updated', (data) => {
      console.log('User list updated via cleanup:', data.users)
      setUsers(data.users)
    })

    // Handle errors
    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error)
      alert('Connection error: ' + error.message)
    })

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [roomId, navigate, searchParams])

  const handleEditorChange = (value) => {
    setCode(value)
    
    if (socketRef.current && isConnected) {
      socketRef.current.emit('code-change', {
        code: value,
        roomId
      })
    }
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    
    if (socketRef.current && isConnected) {
      socketRef.current.emit('language-change', {
        language: newLanguage,
        roomId
      })
    }
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    alert('Room ID copied to clipboard!')
  }

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    navigate('/')
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
      {/* Header */}
      <div style={{
        background: '#2d2d30',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #3e3e42',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#cccccc' }}>
            {sessionTitle}
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#888',
            background: '#3c3c3c',
            padding: '4px 10px',
            borderRadius: '15px',
            border: '1px solid #5a5a5a'
          }}>
            <span style={{ color: '#007acc', fontWeight: '500' }}>👤</span>
            <span>{username}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '12px',
            color: isConnected ? '#4CAF50' : '#f44336'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? '#4CAF50' : '#f44336'
            }} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              background: '#3c3c3c',
              color: 'white',
              border: '1px solid #5a5a5a',
              borderRadius: '5px',
              padding: '5px 10px',
              fontSize: '14px'
            }}
          >
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {lang.name}
              </option>
            ))}
          </select>

          {/* Room ID */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#888' }}>Room:</span>
            <code
              onClick={copyRoomId}
              style={{
                background: '#3c3c3c',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#007acc'
              }}
              title="Click to copy"
            >
              {roomId.slice(0, 8)}...
            </code>
          </div>

          {/* Leave Button */}
          <button
            onClick={leaveRoom}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Leave
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          onMount={(editor) => {
            editorRef.current = editor
          }}
          options={{
            fontSize: 16,
            minimap: { enabled: true },
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true }
          }}
        />
        
        {/* User List Overlay */}
        <UserList users={users} currentUserId={userId} />
        
        {/* Connection Status Overlay */}
        {!isConnected && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(244, 67, 54, 0.9)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            zIndex: 1000
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Connection Lost</h3>
            <p style={{ margin: 0 }}>Trying to reconnect...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomPage