import { useState, useEffect, useRef } from 'react'
import { api } from '../utils/api'
import { Stream, ChatMessage, User } from '../types'
import './Watch.css'

interface WatchProps {
  streamId: string
  user: User
}

const EMOTES = ['🎵', '🎶', '🎤', '🔊', '🔥', '💯', '😍', '🙌', '👏', '💜', '🎧', '🎼', '🎹', '🥁', '🎸']

export default function Watch({ streamId, user }: WatchProps) {
  const [stream, setStream] = useState<Stream | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const response = await api.get(`/api/streams/${streamId}`)
        setStream(response.data)

        // Load HLS video
        if (response.data.playback_id && videoRef.current) {
          const hlsUrl = `https://stream.mux.com/${response.data.playback_id}.m3u8`
          if ((videoRef.current as any).canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = hlsUrl
          }
        }
      } catch (err) {
        console.error('Failed to fetch stream:', err)
      } finally {
        setLoading(false)
      }
    }

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/api/chat/${streamId}`)
        setMessages(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      }
    }

    fetchStream()
    fetchMessages()
    const messagesInterval = setInterval(fetchMessages, 2000)
    const streamInterval = setInterval(fetchStream, 5000)

    return () => {
      clearInterval(messagesInterval)
      clearInterval(streamInterval)
    }
  }, [streamId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    try {
      await api.post(`/api/chat/${streamId}`, {
        message: message.trim()
      })
      setMessage('')
      // Refetch messages
      const response = await api.get(`/api/chat/${streamId}`)
      setMessages(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const handleFollow = async () => {
    if (!stream) return
    try {
      await api.post('/api/follow', { target_user_id: stream.user_id })
      setIsFollowing(!isFollowing)
    } catch (err) {
      console.error('Failed to follow:', err)
    }
  }

  const handleSubscribe = async () => {
    if (!stream) return
    try {
      await api.post('/api/subscribe', { target_user_id: stream.user_id })
      setIsSubscribed(!isSubscribed)
    } catch (err) {
      console.error('Failed to subscribe:', err)
    }
  }

  const addEmote = (emote: string) => {
    setMessage(prev => prev + emote)
  }

  if (loading) {
    return <div className="container"><p>Loading stream...</p></div>
  }

  if (!stream) {
    return <div className="container"><p>Stream not found</p></div>
  }

  return (
    <div className="watch-container">
      <div className="watch-main">
        {/* Video Player */}
        <div className="player-section">
          <div className="player-wrapper">
            {stream.playback_id ? (
              <video
                ref={videoRef}
                className="video-player"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <div className="no-stream">No stream available</div>
            )}
          </div>

          <div className="stream-info">
            <div className="info-header">
              <div>
                <h2>{stream.stream_name}</h2>
                <p className="genre">📁 {stream.genre}</p>
                <p className="viewers">👥 {stream.view_count || 0} viewers</p>
              </div>
              <div className="action-buttons">
                <button
                  className={`follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollow}
                >
                  {isFollowing ? '✅ Following' : '👤 Follow'}
                </button>
                <button
                  className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
                  onClick={handleSubscribe}
                >
                  {isSubscribed ? '⭐ Subscribed' : '🔔 Subscribe'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-header">
          <h3>💬 Chat</h3>
        </div>

        <div className="messages">
          {messages.map(msg => (
            <div key={msg.id} className="message">
              <span className="username">{msg.username}</span>
              <span className="text">{msg.message}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-section">
          <div className="emotes-bar">
            {EMOTES.map(emote => (
              <button
                key={emote}
                className="emote-btn"
                onClick={() => addEmote(emote)}
                title={emote}
              >
                {emote}
              </button>
            ))}
          </div>

          <div className="input-group">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Send a message..."
            />
            <button className="send-btn" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
