import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { skillApi } from '../utils/api'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement,
} from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

const ALL_SKILLS = [
  'Python','JavaScript','TypeScript','React','Next.js','Vue.js','Node.js',
  'HTML','CSS','TailwindCSS','SQL','PostgreSQL','MongoDB','Redis',
  'Docker','Kubernetes','AWS','GCP','Azure','Terraform','Linux','Bash',
  'Git','CI/CD','FastAPI','Django','REST APIs','GraphQL',
  'Machine Learning','Deep Learning','TensorFlow','PyTorch','Scikit-Learn',
  'Pandas','NumPy','Matplotlib','Seaborn','NLP','Computer Vision',
  'Excel','Power BI','Tableau','R','Statistics','Data Visualization',
  'Swift','Kotlin','Flutter','React Native','Android','iOS','Firebase','Dart',
  'Security','Networking','Cryptography','Penetration Testing',
  'Figma','UI/UX','Responsive Design','Business Intelligence',
]

const CAREER_OPTIONS = [
  '','AI Engineer','Data Analyst','Data Scientist','Frontend Developer',
  'Backend Developer','Full Stack Developer','DevOps Engineer',
  'Cybersecurity Analyst','Cloud Engineer','Mobile Developer',
]

const COLORS = ['#6C63FF','#10b981','#f59e0b','#ef4444','#3b82f6']

export default function Dashboard() {
  const router = useRouter()
  const [tab, setTab] = useState('analyze')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [skillSearch, setSkillSearch] = useState('')
  const [desiredCareer, setDesiredCareer] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [reports, setReports] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState('')
  const [customSkill, setCustomSkill] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('sb_token')) { router.push('/login'); return }
    fetchReports()
    fetchMetrics()
  }, [])

  const fetchReports = async () => {
    try { const r = await skillApi.reports(); setReports(r.data.reports) } catch {}
  }

  const fetchMetrics = async () => {
    try { const r = await skillApi.metrics(); setMetrics(r.data) } catch {}
  }

  const toggleSkill = (s) => {
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const addCustomSkill = () => {
    const s = customSkill.trim()
    if (s && !selectedSkills.includes(s)) {
      setSelectedSkills(prev => [...prev, s])
    }
    setCustomSkill('')
  }

  const handleAnalyze = async () => {
    if (selectedSkills.length === 0) { setError('Please select at least one skill.'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const r = await skillApi.predict(selectedSkills, desiredCareer || undefined)
      setResult(r.data)
      const rm = await skillApi.roadmap(r.data.predicted_career)
      setRoadmap(rm.data)
      fetchReports()
      setTab('results')
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Make sure the backend is running.')
    } finally { setLoading(false) }
  }

  const filteredSkills = ALL_SKILLS.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase()) && !selectedSkills.includes(s)
  )

  const username = typeof window !== 'undefined' ? localStorage.getItem('sb_user') : ''

  return (
    <>
      <Navbar />
      <div className="section" style={{ paddingTop:36 }}>
        <div className="container">
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ fontSize:26, fontWeight:700 }}>Welcome, {username} 👋</h1>
              <p style={{ color:'var(--muted)', marginTop:4 }}>Analyse your skills and discover your perfect career path.</p>
            </div>
            {metrics && (
              <div className="badge badge-success" style={{ fontSize:14, padding:'8px 16px' }}>
                Model Accuracy: {(metrics.accuracy * 100).toFixed(1)}%
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:4, borderBottom:'2px solid var(--border)', marginBottom:28 }}>
            {[['analyze','🔍 Analyse'],['results','📊 Results'],['roadmap','🗺️ Roadmap'],['history','📋 History'],['metrics','🤖 Model Metrics']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                style={{ padding:'10px 18px', border:'none', background:'none', cursor:'pointer', fontWeight:600, fontSize:14,
                  color: tab===key ? 'var(--primary)' : 'var(--muted)',
                  borderBottom: tab===key ? '2px solid var(--primary)' : '2px solid transparent',
                  marginBottom:-2, transition:'all .2s' }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── ANALYZE TAB ── */}
          {tab === 'analyze' && (
            <div className="grid-2" style={{ alignItems:'start' }}>
              <div>
                <div className="card" style={{ marginBottom:20 }}>
                  <div className="card-body">
                    <h2 style={{ fontWeight:700, marginBottom:4 }}>Your Current Skills</h2>
                    <p style={{ color:'var(--muted)', fontSize:13, marginBottom:16 }}>Click to select · {selectedSkills.length} selected</p>

                    <input className="form-input" placeholder="Search skills…" value={skillSearch}
                      onChange={e => setSkillSearch(e.target.value)} style={{ marginBottom:12 }} />

                    <div style={{ display:'flex', flexWrap:'wrap', gap:8, maxHeight:260, overflowY:'auto', marginBottom:16 }}>
                      {filteredSkills.map(s => (
                        <span key={s} className="skill-tag skill-tag-unselected" onClick={() => toggleSkill(s)}>{s}</span>
                      ))}
                      {filteredSkills.length === 0 && <span style={{ color:'var(--muted)', fontSize:13 }}>No skills match your search.</span>}
                    </div>

                    {selectedSkills.length > 0 && (
                      <>
                        <p style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Selected:</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                          {selectedSkills.map(s => (
                            <span key={s} className="skill-tag skill-tag-selected" onClick={() => toggleSkill(s)}>{s} ✕</span>
                          ))}
                        </div>
                      </>
                    )}

                    <hr className="divider" />
                    <div style={{ display:'flex', gap:8 }}>
                      <input className="form-input" placeholder="Add custom skill…" value={customSkill}
                        onChange={e => setCustomSkill(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustomSkill()} />
                      <button className="btn btn-secondary" onClick={addCustomSkill}>Add</button>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <h2 style={{ fontWeight:700, marginBottom:12 }}>Desired Career (optional)</h2>
                    <select className="form-input" value={desiredCareer} onChange={e => setDesiredCareer(e.target.value)}>
                      {CAREER_OPTIONS.map(c => <option key={c} value={c}>{c || '— Let AI decide —'}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <div className="card">
                  <div className="card-body" style={{ textAlign:'center' }}>
                    <div style={{ fontSize:56, marginBottom:12 }}>🚀</div>
                    <h2 style={{ fontWeight:700, marginBottom:8 }}>Ready to Analyse?</h2>
                    <p style={{ color:'var(--muted)', fontSize:14, marginBottom:20 }}>
                      You have selected <b>{selectedSkills.length}</b> skill{selectedSkills.length !== 1 ? 's' : ''}.
                      The AI will predict your best-fit career and identify skill gaps.
                    </p>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:16 }}
                      onClick={handleAnalyze} disabled={loading}>
                      {loading ? <><span className="spinner" /> Analysing your skills…</> : '🔍 Analyse My Skills'}
                    </button>
                    {reports.length > 0 && (
                      <div style={{ marginTop:16 }}>
                        <p style={{ fontSize:13, color:'var(--muted)' }}>You have {reports.length} previous report{reports.length !== 1 ? 's' : ''}.</p>
                        <button className="btn btn-secondary btn-sm" style={{ marginTop:8 }} onClick={() => setTab('history')}>View History →</button>
                      </div>
                    )}
                  </div>
                </div>

                {reports[0] && (
                  <div className="card" style={{ marginTop:16 }}>
                    <div className="card-body">
                      <p style={{ fontSize:12, color:'var(--muted)', marginBottom:8 }}>LAST ANALYSIS</p>
                      <h3 style={{ fontWeight:700, color:'var(--primary)', marginBottom:4 }}>{reports[0].predicted_career}</h3>
                      <div className="progress-bar" style={{ marginBottom:4 }}>
                        <div className="progress-fill" style={{ width: reports[0].match_percentage + '%' }} />
                      </div>
                      <p style={{ fontSize:13, color:'var(--muted)' }}>{reports[0].match_percentage}% match · {reports[0].missing_skills?.length} skills missing</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── RESULTS TAB ── */}
          {tab === 'results' && (
            result ? (
              <div>
                <div className="grid-4" style={{ marginBottom:24 }}>
                  <div className="stat-card">
                    <div className="stat-label">Predicted Career</div>
                    <div style={{ fontSize:18, fontWeight:700, color:'var(--primary)', marginTop:4 }}>{result.predicted_career}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Match Score</div>
                    <div className="stat-value">{result.match_percentage}%</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Matched Skills</div>
                    <div className="stat-value" style={{ color:'var(--secondary)' }}>{result.matched_skills.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Missing Skills</div>
                    <div className="stat-value" style={{ color:'var(--danger)' }}>{result.missing_skills.length}</div>
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom:24 }}>
                  {/* Pie Chart */}
                  <div className="card">
                    <div className="card-body">
                      <h2 style={{ fontWeight:700, marginBottom:16 }}>Skill Coverage</h2>
                      <div className="chart-container" style={{ height:240 }}>
                        <Pie
                          data={{
                            labels: ['Matched Skills','Missing Skills'],
                            datasets: [{ data: [result.matched_skills.length, result.missing_skills.length],
                              backgroundColor: ['#10b981','#ef4444'], borderWidth: 0 }]
                          }}
                          options={{ plugins:{ legend:{ position:'bottom' } }, maintainAspectRatio:false }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top Careers Bar */}
                  <div className="card">
                    <div className="card-body">
                      <h2 style={{ fontWeight:700, marginBottom:16 }}>Top Career Matches</h2>
                      {result.top_careers.map((c, i) => (
                        <div key={i} className="career-row">
                          <span className="career-name">{c.career}</span>
                          <div className="career-bar-wrap">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: c.probability + '%', background: COLORS[i] }} />
                            </div>
                          </div>
                          <span className="career-pct">{c.probability}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="card">
                    <div className="card-body">
                      <h2 style={{ fontWeight:700, marginBottom:12 }}>✅ Skills You Have</h2>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {result.matched_skills.map(s => <span key={s} className="skill-tag skill-tag-matched">{s}</span>)}
                        {result.matched_skills.length === 0 && <span style={{ color:'var(--muted)', fontSize:13 }}>None matched — add more skills!</span>}
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <h2 style={{ fontWeight:700, marginBottom:12 }}>❌ Skills to Learn</h2>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {result.missing_skills.map(s => <span key={s} className="skill-tag skill-tag-missing">{s}</span>)}
                        {result.missing_skills.length === 0 && <span style={{ color:'var(--secondary)', fontWeight:600 }}>🎉 You have all required skills!</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop:20, textAlign:'center' }}>
                  <button className="btn btn-primary" onClick={() => setTab('roadmap')}>View Your Roadmap →</button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3>No results yet</h3>
                <p>Run an analysis first to see your results.</p>
                <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => setTab('analyze')}>Go to Analyse</button>
              </div>
            )
          )}

          {/* ── ROADMAP TAB ── */}
          {tab === 'roadmap' && (
            roadmap ? (
              <div>
                <div className="card" style={{ marginBottom:24 }}>
                  <div className="card-body">
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
                      <h2 style={{ fontWeight:700 }}>Learning Roadmap</h2>
                      <span className="badge badge-primary">{roadmap.career}</span>
                    </div>
                    <p style={{ color:'var(--muted)', fontSize:14 }}>Your personalised {roadmap.phases.length}-month plan to become a {roadmap.career}.</p>
                  </div>
                </div>
                {roadmap.phases.map((p) => (
                  <div key={p.month} className="roadmap-phase">
                    <div className="phase-number">{p.month}</div>
                    <div className="phase-content">
                      <div className="phase-month">Month {p.month}</div>
                      <div className="phase-topics">
                        {p.topics.map(t => <span key={t} className="badge badge-primary">{t}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🗺️</div>
                <h3>No roadmap yet</h3>
                <p>Analyse your skills first to generate a personalised roadmap.</p>
                <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => setTab('analyze')}>Analyse My Skills</button>
              </div>
            )
          )}

          {/* ── HISTORY TAB ── */}
          {tab === 'history' && (
            reports.length > 0 ? (
              <div>
                <h2 style={{ fontWeight:700, marginBottom:20 }}>Your Analysis History</h2>
                {/* Line chart of match % over time */}
                {reports.length >= 2 && (
                  <div className="card" style={{ marginBottom:24 }}>
                    <div className="card-body">
                      <h3 style={{ fontWeight:700, marginBottom:16 }}>Match Score Over Time</h3>
                      <div className="chart-container">
                        <Line
                          data={{
                            labels: reports.slice().reverse().map((r,i) => `Analysis ${i+1}`),
                            datasets: [{
                              label: 'Match %',
                              data: reports.slice().reverse().map(r => r.match_percentage),
                              borderColor: '#6C63FF', backgroundColor: 'rgba(108,99,255,.1)',
                              fill: true, tension: 0.4, pointRadius: 5,
                            }]
                          }}
                          options={{ plugins:{ legend:{ display:false } }, scales:{ y:{ min:0, max:100 } }, maintainAspectRatio:false }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {reports.map((r, i) => (
                    <div key={i} className="card">
                      <div className="card-body">
                        <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:12 }}>
                          <div>
                            <h3 style={{ fontWeight:700 }}>{r.predicted_career}</h3>
                            <p style={{ color:'var(--muted)', fontSize:13 }}>{new Date(r.created_at).toLocaleString()}</p>
                          </div>
                          <span className={`badge ${r.match_percentage >= 70 ? 'badge-success' : r.match_percentage >= 40 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize:15, padding:'6px 14px' }}>
                            {r.match_percentage}% match
                          </span>
                        </div>
                        <div className="progress-bar" style={{ marginBottom:12 }}>
                          <div className="progress-fill" style={{ width: r.match_percentage + '%' }} />
                        </div>
                        <div style={{ display:'flex', gap:16, fontSize:13, flexWrap:'wrap' }}>
                          <span>✅ <b>{r.matched_skills?.length}</b> skills matched</span>
                          <span>❌ <b>{r.missing_skills?.length}</b> skills missing</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>No history yet</h3>
                <p>Your past analyses will appear here.</p>
                <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => setTab('analyze')}>Run First Analysis</button>
              </div>
            )
          )}

          {/* ── METRICS TAB ── */}
          {tab === 'metrics' && (
            metrics ? (
              <div>
                <h2 style={{ fontWeight:700, marginBottom:20 }}>Model Evaluation Metrics</h2>
                <div className="grid-4" style={{ marginBottom:24 }}>
                  {[
                    ['Accuracy', metrics.accuracy],
                    ['Precision', metrics.precision],
                    ['Recall', metrics.recall],
                    ['F1 Score', metrics.f1_score],
                  ].map(([label, val]) => (
                    <div key={label} className="stat-card" style={{ textAlign:'center' }}>
                      <div className="stat-label">{label}</div>
                      <div className="stat-value">{(val * 100).toFixed(1)}%</div>
                      <div className="progress-bar" style={{ marginTop:8 }}>
                        <div className="progress-fill" style={{ width: (val * 100) + '%', background: val >= 0.9 ? 'var(--secondary)' : 'var(--primary)' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-body">
                    <h3 style={{ fontWeight:700, marginBottom:16 }}>Metrics Comparison</h3>
                    <div className="chart-container">
                      <Bar
                        data={{
                          labels: ['Accuracy','Precision','Recall','F1 Score'],
                          datasets: [{
                            label: 'Score',
                            data: [metrics.accuracy, metrics.precision, metrics.recall, metrics.f1_score].map(v => +(v*100).toFixed(1)),
                            backgroundColor: ['#6C63FF','#10b981','#f59e0b','#3b82f6'],
                            borderRadius: 8, borderSkipped: false,
                          }]
                        }}
                        options={{
                          plugins:{ legend:{ display:false } },
                          scales:{ y:{ min:0, max:100, ticks:{ callback: v => v+'%' } } },
                          maintainAspectRatio:false,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="card" style={{ marginTop:20 }}>
                  <div className="card-body">
                    <h3 style={{ fontWeight:700, marginBottom:8 }}>About the Model</h3>
                    <p style={{ color:'var(--muted)', fontSize:14 }}>
                      <b>Algorithm:</b> Random Forest Classifier with 200 estimators trained on a skill-career dataset covering 10 career domains and 60+ technical skills.
                      Features are binarised using MultiLabelBinarizer (one column per skill). The model was trained on a stratified 80/20 split and serialised with joblib for fast inference.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">🤖</div><h3>Loading metrics…</h3></div>
            )
          )}
        </div>
      </div>
    </>
  )
}
