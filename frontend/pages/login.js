import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { authApi } from '../utils/api'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ username:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const registered = router.query.registered === '1'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(form.username, form.password)
      localStorage.setItem('sb_token', res.data.access_token)
      localStorage.setItem('sb_user', form.username)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          <div className="card">
            <div className="card-body">
              <div style={{ textAlign:'center', marginBottom:28 }}>
                <div style={{ fontSize:48, marginBottom:8 }}>🔐</div>
                <h1 style={{ fontSize:24, fontWeight:700 }}>Welcome Back</h1>
                <p style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>Sign in to your SkillBridge account</p>
              </div>
              {registered && <div className="alert alert-success">Account created! Please log in.</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" type="text" required placeholder="Your username"
                    value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" required placeholder="Your password"
                    value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                </div>
                <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'12px' }} disabled={loading}>
                  {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
                </button>
              </form>
              <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--muted)' }}>
                No account? <Link href="/register" style={{ color:'var(--primary)', fontWeight:600 }}>Register for free</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
