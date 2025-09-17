import React from 'react'

const UserList = ({ users, currentUserId }) => {
  console.log('🎭 UserList received users:', users)
  console.log('🎭 UserList users length:', users?.length)
  console.log('🎭 Current user ID:', currentUserId)
  
  if (!users || users.length === 0) {
    console.log('🎭 UserList: No users to display')
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '10px',
      padding: '15px',
      color: 'white',
      minWidth: '200px',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h4 style={{
        margin: '0 0 10px 0',
        fontSize: '14px',
        color: '#ccc',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        Active Users ({users.length})
      </h4>
      
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {users.map((user, index) => {
          console.log(`🎭 Rendering user ${index}:`, user)
          return (
            <div
              key={`${user.userId}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: index < users.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: user.color || '#007acc',
                  marginRight: '10px',
                  flexShrink: 0
                }}
              />
              <span style={{
                fontSize: '13px',
                fontWeight: user.userId === currentUserId ? '600' : '400',
                opacity: user.userId === currentUserId ? 1 : 0.9
              }}>
                {user.username}
                {user.userId === currentUserId && ' (you)'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UserList