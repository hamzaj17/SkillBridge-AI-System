import Navbar from '../components/Navbar'

const pipeline = [
  { stage: 'Data Gathering', desc: 'LinkedIn job postings, O*NET database, and a custom skill-career matrix covering 10 career domains and 60+ skills.', tech: 'Pydantic validation' },
  { stage: 'Data Cleaning', desc: 'Duplicate removal, missing value handling, skill name standardisation (Python / python / PYTHON → Python), and special character stripping.', tech: 'Pandas, drop_duplicates, fillna' },
  { stage: 'Feature Engineering', desc: 'Skills are encoded into binary feature vectors using MultiLabelBinarizer — each column represents one skill.', tech: 'scikit-learn MultiLabelBinarizer' },
  { stage: 'Model Training', desc: 'Random Forest Classifier with 200 trees trained on a stratified 80/20 split. Model serialised with joblib and loaded globally at API startup.', tech: 'RandomForestClassifier, joblib' },
  { stage: 'Model Evaluation', desc: 'Accuracy, Precision, Recall, and F1-score computed on the held-out test set and stored in MongoDB for live dashboard display.', tech: 'sklearn.metrics' },
]

const careers = [
  'AI Engineer','Data Analyst','Data Scientist','Frontend Developer',
  'Backend Developer','Full Stack Developer','DevOps Engineer',
  'Cybersecurity Analyst','Cloud Engineer','Mobile Developer',
]

export default function Docs() {
  return (
    <>
      <Navbar />
      <div className="section">
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom:12 }}>Model Documentation</div>
          <h1 className="section-title">How SkillBridge AI Works</h1>
          <p className="section-sub" style={{ maxWidth:640 }}>
            A transparent look at the end-to-end machine learning pipeline powering career prediction and skill gap analysis.
          </p>

          <div className="card" style={{ marginBottom:32 }}>
            <div className="card-body">
              <h2 style={{ fontWeight:700, marginBottom:20 }}>ML Pipeline — 5 Stages</h2>
              {pipeline.map((p, i) => (
                <div key={i} style={{ display:'flex', gap:16, marginBottom:i < pipeline.length-1 ? 24 : 0 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0, marginTop:4, fontSize:14 }}>{i+1}</div>
                  <div>
                    <h3 style={{ fontWeight:700, marginBottom:4 }}>{p.stage}</h3>
                    <p style={{ color:'var(--muted)', fontSize:14, marginBottom:6 }}>{p.desc}</p>
                    <span className="badge badge-primary" style={{ fontSize:11 }}>{p.tech}</span>
                    {i < pipeline.length - 1 && <hr className="divider" style={{ marginTop:16 }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom:32 }}>
            <div className="card">
              <div className="card-body">
                <h2 style={{ fontWeight:700, marginBottom:16 }}>Dataset</h2>
                <table style={{ width:'100%', fontSize:14, borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid var(--border)' }}>
                      <th style={{ textAlign:'left', padding:'8px 0', color:'var(--muted)' }}>Source</th>
                      <th style={{ textAlign:'left', padding:'8px 0', color:'var(--muted)' }}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ padding:'8px 0' }}>LinkedIn Job Postings</td><td>Primary</td></tr>
                    <tr><td style={{ padding:'8px 0' }}>O*NET Occupation Database</td><td>Secondary</td></tr>
                    <tr><td style={{ padding:'8px 0' }}>Custom Skill Matrix</td><td>Supplemental</td></tr>
                  </tbody>
                </table>
                <hr className="divider" />
                <p style={{ fontSize:14 }}><b>1,200 samples</b> · <b>10 career classes</b> · <b>60+ skills</b></p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 style={{ fontWeight:700, marginBottom:16 }}>Supported Careers</h2>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {careers.map(c => <span key={c} className="badge badge-primary">{c}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h2 style={{ fontWeight:700, marginBottom:16 }}>API Endpoints</h2>
              <table style={{ width:'100%', fontSize:14, borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--border)' }}>
                    <th style={{ textAlign:'left', padding:'8px 12px', color:'var(--muted)' }}>Method</th>
                    <th style={{ textAlign:'left', padding:'8px 12px', color:'var(--muted)' }}>Endpoint</th>
                    <th style={{ textAlign:'left', padding:'8px 12px', color:'var(--muted)' }}>Description</th>
                    <th style={{ textAlign:'left', padding:'8px 12px', color:'var(--muted)' }}>Auth</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['POST','  /register','Register new user','No'],
                    ['POST','  /token','Login → JWT','No'],
                    ['POST','  /predict','Predict career + skill gap','Yes'],
                    ['GET','  /roadmap','Personalised roadmap','Yes'],
                    ['GET','  /reports','User report history','Yes'],
                    ['GET','  /metrics','Model evaluation metrics','Yes'],
                    ['GET','  /careers','List all careers','No'],
                    ['GET','  /skills','List all skills','No'],
                  ].map(([m, ep, d, auth]) => (
                    <tr key={ep} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'10px 12px' }}>
                        <span className={`badge ${m==='POST' ? 'badge-warning' : 'badge-success'}`}>{m}</span>
                      </td>
                      <td style={{ padding:'10px 12px', fontFamily:'monospace', fontSize:13 }}>{ep}</td>
                      <td style={{ padding:'10px 12px', color:'var(--muted)' }}>{d}</td>
                      <td style={{ padding:'10px 12px' }}>
                        <span className={`badge ${auth==='Yes' ? 'badge-danger' : 'badge-success'}`}>{auth}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return { props: {} }
}
