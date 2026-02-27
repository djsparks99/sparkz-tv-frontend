import { useState } from 'react'
import { api } from '../utils/api'
import { User } from '../types'
import './Profile.css'

interface ProfileProps {
  user: User
  onUpdate: (user: User) => void
}

export default function Profile({ user, onUpdate }: ProfileProps) {
  const [djName, setDjName] = useState(user.dj_name || '')
  const [bio, setBio] = useState(user.bio || '')
  const [profilePic, setProfilePic] = useState(user.profile_pic || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('profile_pic', file)

    try {
      setLoading(true)
      setError('')
      const response = await fetch('https://sparkz-tv-d5ee412c7726.herokuapp.com/api/users/profile-pic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })
      if (!response.ok) throw new Error('Failed to upload profile pic')
      const data = await response.json()
      setProfilePic(data.profile_pic)
      onUpdate({ ...user, profile_pic: data.profile_pic })
      setSuccess('✅ Profile picture updated!')
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile picture')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.put('/api/users/profile', {
        dj_name: djName,
        bio
      })
      onUpdate(response.data)
      setSuccess('✅ Profile updated!')
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-container">
      <h1>👤 My Profile</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="profile-card">
        {/* Profile Picture */}
        <div className="profile-pic-section">
          <div className="profile-pic">
            {profilePic ? (
              <img src={profilePic} alt="Profile" />
            ) : (
              <div className="placeholder">✨</div>
            )}
          </div>
          <label className="pic-upload">
            📸 Change Picture
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              disabled={loading}
            />
          </label>
        </div>

        {/* Profile Info */}
        <div className="profile-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user.email} disabled />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input type="text" value={user.username} disabled />
          </div>

          <div className="form-group">
            <label>DJ Name</label>
            <input
              type="text"
              value={djName}
              onChange={(e) => setDjName(e.target.value)}
              placeholder="Enter your DJ name"
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <button
            className="primary-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
