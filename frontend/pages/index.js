import Navbar from '../components/Navbar'
import Link from 'next/link'

const features = [
  { icon: '🎯', title: 'Career Prediction', desc: 'AI-powered Random Forest model predicts your best-fit career based on your current skills.' },
  { icon: '📊', title: 'Skill Gap Analysis', desc: 'Instantly see which skills you are missing to reach your desired career and by how much.' },
  { icon: '🗺️', title: 'Learning Roadmap', desc: 'Get a personalised month-by-month learning plan tailored to your goal career.' },
  { icon: '📈', title: 'Progress Dashboard', desc: 'Track your analysis history, match percentages, and skill growth over time.' },
  { icon: '🔒', title: 'Secure Auth', desc: 'JWT-based authentication with bcrypt password hashing — your data stays safe.' },
  { icon: '🤖', title: 'ML Pipeline', desc: 'End-to-end pipeline: data gathering, cleaning, feature engineering, training, and evaluation.' },
]

export default function Home() {
  return (
    <>
      <Navbar />
      <section className="hero">
        <div className="container">
          <h1>Bridge the Gap to Your Dream Career</h1>
          <p>SkillBridge AI analyses your skills, predicts the right career, and hands you a personalised roadmap to get there.</p>
          <div className="hero-btns">
            <Link href="/register"><button className="btn" style={{ background:'#fff', color:'var(--primary)', fontWeight:700 }}>Get Started Free</button></Link>
            <Link href="/docs"><button className="btn btn-outline" style={{ borderColor:'rgba(255,255,255,.6)', color:'#fff' }}>See How It Works</button></Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-sub">A complete AI-powered career intelligence platform.</p>
          <div className="grid-3">
            {features.map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background:'var(--primary-light)' }}>
        <div className="container" style={{ textAlign:'center' }}>
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Three simple steps to your personalised career plan</p>
          <div className="grid-3">
            {[
              { step:'1', title:'Enter Your Skills', desc:'Select or type your current technical skills and optionally your desired career.' },
              { step:'2', title:'AI Predicts & Analyses', desc:'Our Random Forest model predicts your best-fit career and identifies skill gaps.' },
              { step:'3', title:'Get Your Roadmap', desc:'Receive a month-by-month learning roadmap with actionable topics to master.' },
            ].map(s => (
              <div key={s.step} style={{ textAlign:'center' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, margin:'0 auto 16px' }}>{s.step}</div>
                <h3 style={{ fontWeight:700, marginBottom:8 }}>{s.title}</h3>
                <p style={{ color:'var(--muted)', fontSize:14 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <br /><br />
          <Link href="/register"><button className="btn btn-primary" style={{ fontSize:16, padding:'12px 32px' }}>Start Your Analysis →</button></Link>
        </div>
      </section>

      <footer style={{ borderTop:'1px solid var(--border)', padding:'32px 0', textAlign:'center', color:'var(--muted)', fontSize:14 }}>
        <div className="container">
          <span>🌉 <b style={{ color:'var(--primary)' }}>SkillBridge AI</b> — Web Engineering Project</span>
          <span style={{ margin:'0 16px' }}>·</span>
          <span>Next.js · FastAPI · MongoDB · Random Forest</span>
        </div>
      </footer>
    </>
  )
}

export async function getStaticProps() {
  return { props: {} }
}
