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
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.85)',
      borderRadius: '12px',
      padding: '16px',
      color: 'white',
      minWidth: '220px',
      maxWidth: '280px',
      zIndex: 1000,
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      <h4 style={{
        margin: '0 0 12px 0',
        fontSize: '13px',
        color: '#a0a0a0',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: '600',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '8px'
      }}>
        👥 Active Users ({users.length})
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
                padding: '10px 8px',
                borderRadius: '6px',
                marginBottom: index < users.length - 1 ? '4px' : '0',
                background: user.userId === currentUserId ? 'rgba(0, 122, 204, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: user.userId === currentUserId ? '1px solid rgba(0, 122, 204, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: user.color || '#007acc',
                  marginRight: '12px',
                  flexShrink: 0,
                  boxShadow: `0 0 8px ${user.color || '#007acc'}40`,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
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