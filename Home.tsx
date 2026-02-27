import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Stream } from '../types'
import './Home.css'

interface HomeProps {
  onSelectStream: (streamId: string) => void
}

export default function Home({ onSelectStream }: HomeProps) {
  const [liveStreams, setLiveStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await api.get('/api/streams/live')
        setLiveStreams(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        console.error('Failed to fetch streams:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStreams()
    const interval = setInterval(fetchStreams, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="container"><p>Loading streams...</p></div>
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>🔴 Live Now</h1>
        <p>{liveStreams.length} streams live</p>
      </div>

      <div className="streams-grid">
        {liveStreams.length === 0 ? (
          <p className="no-streams">No streams currently live. Check back soon!</p>
        ) : (
          liveStreams.map((stream) => (
            <div key={stream.id} className="stream-card" onClick={() => onSelectStream(stream.id)}>
              <div className="stream-thumbnail">
                <div className="live-badge">🔴 LIVE</div>
                {stream.playback_id && (
                  <img 
                    src={`https://image.mux.com/${stream.playback_id}/thumbnail.jpg`}
                    alt={stream.stream_name}
                  />
                )}
              </div>
              <div className="stream-info">
                <h3>{stream.stream_name}</h3>
                <p className="genre">{stream.genre}</p>
                <p className="viewers">👥 {stream.view_count || 0} viewers</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
