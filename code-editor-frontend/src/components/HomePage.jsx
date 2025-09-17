import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const HomePage = () => {
  const [roomId, setRoomId] = useState('')
  const [username, setUsername] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Generate or retrieve user ID
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', uuidv4())
    }
    
    // Load saved username
    const savedUsername = localStorage.getItem('username')
    if (savedUsername) {
      setUsername(savedUsername)
    }
  }, [])

  const createNewSession = async () => {
    console.log('🚀 Creating new session for username:', username)
    
    if (!username.trim()) {
      alert('Please enter your username')
      return
    }

    setIsCreating(true)
    try {
      console.log('📡 Sending request to create session...')
      const response = await fetch('http://localhost:3001/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Collaborative Session',
          language: 'javascript'
        })
      })

      console.log('📥 Response received:', response.status, response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Session created:', data)
        const { roomId } = data
        localStorage.setItem('username', username)
        console.log('🔄 Navigating to room:', roomId)
        navigate(`/room/${roomId}?username=${encodeURIComponent(username)}`)
      } else {
        console.error('❌ Failed to create session:', response.status)
        alert('Failed to create session')
      }
    } catch (error) {
      console.error('💥 Error creating session:', error)
      alert('Failed to create session: ' + error.message)
    } finally {
      setIsCreating(false)
    }
  }

  const joinExistingSession = () => {
    if (!username.trim()) {
      alert('Please enter your username')
      return
    }
    
    if (!roomId.trim()) {
      alert('Please enter a room ID')
      return
    }

    localStorage.setItem('username', username)
    navigate(`/room/${roomId}?username=${encodeURIComponent(username)}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            margin: '0 0 10px 0',
            background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            Echo Editor
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Collaborative Code Editor in Real-time
          </p>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#333'
          }}>
            Your Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e1e5e9',
              borderRadius: '10px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2a5298'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <button
            onClick={createNewSession}
            disabled={isCreating}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s ease, opacity 0.3s ease',
              opacity: isCreating ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isCreating) e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
            }}
          >
            {isCreating ? '⏳ Creating Session...' : '🚀 Create New Session'}
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '25px 0',
          color: '#999'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e1e5e9' }}></div>
          <span style={{ padding: '0 20px', fontSize: '14px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e1e5e9' }}></div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#333'
          }}>
            Join Existing Session
          </label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e1e5e9',
              borderRadius: '10px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box',
              marginBottom: '12px'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2a5298'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
          <button
            onClick={joinExistingSession}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#2a5298',
              border: '2px solid #2a5298',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#2a5298'
              e.target.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = '#2a5298'
            }}
          >
            🔗 Join Session
          </button>
        </div>

        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#888',
          marginTop: '20px'
        }}>
          ✨ Real-time collaboration • 🎨 Multiple languages • 💾 Auto-save
        </div>
      </div>
    </div>
  )
}

export default HomePage