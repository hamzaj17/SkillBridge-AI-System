import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { authApi } from '../utils/api'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ username:'', email:'', password:'', confirm:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      await authApi.register({ username: form.username, email: form.email, password: form.password })
      router.push('/login?registered=1')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ width:'100%', maxWidth:440 }}>
          <div className="card">
            <div className="card-body">
              <div style={{ textAlign:'center', marginBottom:28 }}>
                <div style={{ fontSize:48, marginBottom:8 }}>🌉</div>
                <h1 style={{ fontSize:24, fontWeight:700 }}>Create Account</h1>
                <p style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>Join SkillBridge AI for free</p>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" type="text" required placeholder="e.g. john_doe"
                    value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" required placeholder="you@example.com"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" required placeholder="Min 6 characters"
                    value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" required placeholder="Repeat password"
                    value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} />
                </div>
                <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'12px' }} disabled={loading}>
                  {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
                </button>
              </form>
              <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--muted)' }}>
                Already have an account? <Link href="/login" style={{ color:'var(--primary)', fontWeight:600 }}>Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
