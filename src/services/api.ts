import axios from 'axios'

export const TOKEN_STORAGE_KEY = 'examen-soto-token'

export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const getAuthConfig = (): {
  headers: {
    'Content-Type': string
    Authorization?: string
    'X-User-Name'?: string | undefined
  }
} => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  const userName = localStorage.getItem('examen-soto-user-name')

  const headers = {
    'Content-Type': 'application/json',
  } as {
    'Content-Type': string
    Authorization?: string
    'X-User-Name'?: string | undefined
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (userName) {
    headers['X-User-Name'] = userName
  }

  return { headers }
}