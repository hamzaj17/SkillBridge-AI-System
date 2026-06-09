import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Navbar() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('sb_token')
    const user = localStorage.getItem('sb_user')
    setLoggedIn(!!token)
    setUsername(user || '')
  }, [router.pathname])

  const logout = () => {
    localStorage.removeItem('sb_token')
    localStorage.removeItem('sb_user')
    router.push('/')
  }

  const isActive = (href) => router.pathname === href ? 'active' : ''

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-brand">
          <span>🌉</span> SkillBridge AI
        </Link>
        <div className="navbar-links">
          <Link href="/" className={isActive('/')}>Home</Link>
          <Link href="/docs" className={isActive('/docs')}>Model Docs</Link>
          {loggedIn ? (
            <>
              <Link href="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>Hi, <b>{username}</b></span>
              <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className={isActive('/login')}>Login</Link>
              <Link href="/register">
                <button className="btn btn-primary btn-sm">Register</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
