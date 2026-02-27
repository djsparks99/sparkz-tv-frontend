import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { User, Stream } from '../types'
import './Dashboard.css'

interface DashboardProps {
  user: User
  onUpdate: (user: User) => void
}

const GENRES = ['drum and bass', 'jungle', 'dubstep', 'house', 'techno', 'reggae', 'pop', 'other']

export default function Dashboard({ user, onUpdate }: DashboardProps) {
  const [stream, setStream] = useState<Stream | null>(null)
  const [streamName, setStreamName] = useState('')
  const [genre, setGenre] = useState('drum and bass')
  const [isLive, setIsLive] = useState(false)
  const [showStreamKey, setShowStreamKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const response = await api.get('/api/streams/mine')
        if (response.data) {
          setStream(response.data)
          setStreamName(response.data.stream_name || '')
          setGenre(response.data.genre || 'drum and bass')
          setIsLive(response.data.is_live || false)
        } else {
          // Create new stream
          await createStream()
        }
      } catch (err) {
        console.error('Failed to fetch stream:', err)
      }
    }
    fetchStream()
  }, [])

  const createStream = async () => {
    try {
      setLoading(true)
      const response = await api.post('/api/streams', {
        stream_name: 'My Stream',
        genre: 'drum and bass'
      })
      setStream(response.data)
      setStreamName(response.data.stream_name)
      setGenre(response.data.genre)
    } catch (err: any) {
      setError(err.message || 'Failed to create stream')
    } finally {
      setLoading(false)
    }
  }

  const handleGoLive = async () => {
    if (!stream) return
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      const response = await api.put(`/api/streams/${stream.id}/go-live`, {
        stream_name: streamName,
        genre
      })
      setStream(response.data)
      setIsLive(true)
      setSuccess('🎉 You are now live!')
    } catch (err: any) {
      setError(err.message || 'Failed to go live')
    } finally {
      setLoading(false)
    }
  }

  const handleEndStream = async () => {
    if (!stream) return
    try {
      setLoading(true)
      setError('')
      const response = await api.put(`/api/streams/${stream.id}/end`, {})
      setStream(response.data)
      setIsLive(false)
      setSuccess('✅ Stream ended')
    } catch (err: any) {
      setError(err.message || 'Failed to end stream')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateStreamKey = async () => {
    if (!stream) return
    try {
      setLoading(true)
      const response = await api.post(`/api/streams/${stream.id}/regenerate-key`, {})
      setStream(response.data)
      setSuccess('✅ Stream key regenerated')
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate key')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyStreamKey = () => {
    if (stream?.stream_key) {
      navigator.clipboard.writeText(stream.stream_key)
      setSuccess('✅ Stream key copied!')
    }
  }

  const handleCopyServerUrl = () => {
    if (stream?.server_url) {
      navigator.clipboard.writeText(stream.server_url)
      setSuccess('✅ Server URL copied!')
    }
  }

  if (!stream && !loading) {
    return (
      <div className="dashboard-container">
        <div className="card">
          <p>Loading your stream...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <h1>📊 Streaming Dashboard</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="dashboard-grid">
        {/* Stream Settings */}
        <div className="card">
          <h2>⚙️ Stream Settings</h2>
          
          <div className="form-group">
            <label>Stream Name</label>
            <input
              type="text"
              value={streamName}
              onChange={(e) => setStreamName(e.target.value)}
              placeholder="Enter stream name"
            />
          </div>

          <div className="form-group">
            <label>Genre</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)}>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Stream Status</label>
            <div className="status-badge" style={{ background: isLive ? '#10b981' : '#6b7280' }}>
              {isLive ? '🔴 LIVE' : '⚫ OFFLINE'}
            </div>
          </div>

          <div className="button-group">
            {!isLive ? (
              <button className="success-btn" onClick={handleGoLive} disabled={loading}>
                {loading ? 'Starting...' : '🎬 Go Live'}
              </button>
            ) : (
              <button className="danger-btn" onClick={handleEndStream} disabled={loading}>
                {loading ? 'Ending...' : '⏹️ End Stream'}
              </button>
            )}
          </div>
        </div>

        {/* Stream Keys */}
        <div className="card">
          <h2>🔑 Stream Keys</h2>

          <div className="key-section">
            <label>Server URL</label>
            <div className="key-display">
              <code>{stream?.server_url || 'Loading...'}</code>
              <button className="copy-btn" onClick={handleCopyServerUrl}>📋</button>
            </div>
          </div>

          <div className="key-section">
            <label>Stream Key {!showStreamKey && '(Hidden)'}</label>
            <div className="key-display">
              <code className="key-input">
                {showStreamKey ? stream?.stream_key : '••••••••••••••••'}
              </code>
              <button 
                className="copy-btn" 
                onClick={() => setShowStreamKey(!showStreamKey)}
              >
                {showStreamKey ? '👁️‍🗨️' : '👁️'}
              </button>
              {showStreamKey && (
                <button className="copy-btn" onClick={handleCopyStreamKey}>📋</button>
              )}
            </div>
          </div>

          <button className="secondary-btn" onClick={handleRegenerateStreamKey} disabled={loading}>
            🔄 Regenerate Key
          </button>
        </div>

        {/* Statistics */}
        <div className="card">
          <h2>📈 Statistics</h2>
          <div className="stat-item">
            <span>View Count:</span>
            <strong>{stream?.view_count || 0}</strong>
          </div>
          <div className="stat-item">
            <span>Stream ID:</span>
            <code className="stat-code">{stream?.id.substring(0, 16)}...</code>
          </div>
        </div>
      </div>
    </div>
  )
}
