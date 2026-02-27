export interface User {
  id: string
  email: string
  username: string
  dj_name?: string
  bio?: string
  profile_pic?: string
}

export interface Stream {
  id: string
  stream_name: string
  genre: string
  is_live: boolean
  playback_id?: string
  view_count?: number
}
