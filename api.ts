const API_URL = import.meta.env.VITE_API_URL || 'https://sparkz-tv-d5ee412c7726.herokuapp.com'

export const api = {
  async post(endpoint: string, data: any) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error(`API error: ${response.statusText}`)
    return response.json()
  },

  async get(endpoint: string) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })
    if (!response.ok) throw new Error(`API error: ${response.statusText}`)
    return response.json()
  },

  async put(endpoint: string, data: any) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error(`API error: ${response.statusText}`)
    return response.json()
  },

  async delete(endpoint: string) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })
    if (!response.ok) throw new Error(`API error: ${response.statusText}`)
    return response.json()
  }
}
