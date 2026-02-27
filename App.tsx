import { useState, useEffect } from 'react'
import { api } from './utils/api'
import { User } from './types'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Watch from './pages/Watch'
import Profile from './pages/Profile'
import Home from './pages/Home'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'watch' | 'profile' | 'login'>('home')
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/api/me').then(setUser).catch(() => {
        localStorage.removeItem('token')
        setCurrentPage('login')
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
      setCurrentPage('login')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setCurrentPage('login')
  }

  const handleNavigate = (page: string, streamId?: string) => {
    if (streamId) setSelectedStreamId(streamId)
    setCurrentPage(page as any)
  }

  if (loading) return <div className="container">Loading...</div>

  return (
    <div className="app">
      {user && (
        <nav className="nav">
          <div className="nav-left">
            <h1 className="logo">✨ SPARKZ.TV</h1>
            <div className="nav-links">
              <button className={currentPage === 'home' ? 'active' : ''} onClick={() => handleNavigate('home')}>
                Home
              </button>
              <button className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => handleNavigate('dashboard')}>
                Dashboard
              </button>
              <button className={currentPage === 'profile' ? 'active' : ''} onClick={() => handleNavigate('profile')}>
                Profile
              </button>
            </div>
          </div>
          <div className="nav-right">
            <span className="username">{user.dj_name || user.username}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </nav>
      )}

      <main className="main-content">
        {!user && <Login onLogin={(userData) => { setUser(userData); setCurrentPage('home') }} />}
        {user && currentPage === 'home' && <Home onSelectStream={(id) => handleNavigate('watch', id)} />}
        {user && currentPage === 'dashboard' && <Dashboard user={user} onUpdate={setUser} />}
        {user && currentPage === 'profile' && <Profile user={user} onUpdate={setUser} />}
        {user && currentPage === 'watch' && selectedStreamId && <Watch streamId={selectedStreamId} user={user} />}
      </main>
    </div>
  )
}

export default App
