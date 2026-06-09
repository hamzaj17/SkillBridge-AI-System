import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({ baseURL: BASE })

// attach token
api.interceptors.request.use(cfg => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sb_token') : null
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const authApi = {
  register: (d) => api.post('/register', d),
  login: (username, password) => {
    const form = new URLSearchParams({ username, password })
    return api.post('/token', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  },
}

export const skillApi = {
  predict: (skills, desired_career) => api.post('/predict', { skills, desired_career }),
  roadmap: (career) => api.get('/roadmap', { params: { career } }),
  reports: () => api.get('/reports'),
  metrics: () => api.get('/metrics'),
  careers: () => api.get('/careers'),
  skills: () => api.get('/skills'),
}
