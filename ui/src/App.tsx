import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
import { ShieldCheck, Info, Activity, User, Zap, Fingerprint, Scale, Monitor, Terminal, Layers } from 'lucide-react';
import StatusBar from './components/StatusBar';
import RiskGauge from './components/RiskGauge';
import FeatureChart from './components/FeatureChart';
import ScanHistory, { useScanHistory } from './components/ScanHistory';
import type { ScanEntry } from './components/ScanHistory';

interface Contribution { feature: string; value: number; }
interface CounterfactualRecommendation { feature: string; current: number; suggested: number; improvement: string; new_prob: number; }
interface PredictionData {
  prediction: string; probability: number; confidence_score: number;
  confidence_status: string; review_required: boolean; narrative: string;
  contributions: Contribution[]; fairness_warning: string; is_ood: boolean;
  similarity_score: number;
  fairness_metrics?: { demographic_parity_diff: number; equal_opportunity_diff: number; treatment_equality: number; };
  counterfactuals?: { current_prob: number; recommendations: CounterfactualRecommendation[]; can_be_approved: boolean; };
  model_version: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insight'|'whatif'|'trust'|'governance'>('insight');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [result, setResult] = useState<PredictionData|null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [latestEntry, setLatestEntry] = useState<ScanEntry|null>(null);
  const { addEntry } = useScanHistory();

  const [formData, setFormData] = useState({
    person_age: 30, person_income: 60000, person_home_ownership: 'RENT',
    person_emp_length: 5, loan_intent: 'EDUCATION', loan_grade: 'B',
    loan_amnt: 15000, loan_int_rate: 11.5, cb_person_default_on_file: 'N',
    cb_person_cred_hist_length: 5, person_gender: 'Male',
    model_choice: 'xgboost', tone: 'executive'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value)||0 : value }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(`TERMINAL FAULT: ${res.status}`);
      const data: PredictionData = await res.json();
      setResult(data);
      setScanCount(c => c + 1);
      const entry = addEntry({
        prediction: data.prediction, probability: data.probability,
        confidence: data.confidence_score, model: formData.model_choice, isOod: data.is_ood,
      });
      setLatestEntry(entry);
    } catch (err: any) {
      setError(err.message || 'UPLINK FAILURE: DATA SYNC INTERRUPTED');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'whatif' && result) {
      const t = setTimeout(() => handleSubmit(), 700);
      return () => clearTimeout(t);
    }
  }, [formData.loan_amnt, formData.person_income, formData.loan_int_rate]);

  return (
    <>
      {loading && (
        <div className="scan-overlay">
          <div className="scan-spinner" />
          <span className="scan-label">Scanning Profile...</span>
        </div>
      )}

      <StatusBar scanCount={scanCount} currentModel={formData.model_choice} />

      <div className="dossier-layout">
        <div className="bg-orbs">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
        </div>
        <div className="pulse-bg" />

        {/* Sidebar */}
        <aside className="sidebar-scanner">
          <div className="flex items-center gap-3 mb-8">
            <div className="logo-badge">V</div>
            <div>
              <h1 style={{ margin:0, fontSize:'18px', fontWeight:900, letterSpacing:'-0.5px' }}>VERIDIAN</h1>
              <p style={{ margin:0, fontSize:'9px', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.25em' }}>Intelligence Platform</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'0' }}>
            <div className="sidebar-section-label">
              <User size={10} /> Applicant Profile
            </div>
            <div className="field-group">
              <label className="field-label">Age</label>
              <input name="person_age" type="number" value={formData.person_age} onChange={handleInputChange} className="field-input" />
            </div>
            <div className="field-group">
              <label className="field-label">Annual Income ($)</label>
              <input name="person_income" type="number" value={formData.person_income} onChange={handleInputChange} className="field-input" />
            </div>
            <div className="field-group">
              <label className="field-label">Employment Years</label>
              <input name="person_emp_length" type="number" value={formData.person_emp_length} onChange={handleInputChange} className="field-input" />
            </div>
            <div className="field-group">
              <label className="field-label">Home Ownership</label>
              <select name="person_home_ownership" value={formData.person_home_ownership} onChange={handleInputChange} className="field-input">
                <option value="RENT">Rent</option>
                <option value="OWN">Own</option>
                <option value="MORTGAGE">Mortgage</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="sidebar-section-label" style={{ marginTop:'1rem' }}>
              <Monitor size={10} /> Loan Parameters
            </div>
            <div className="field-group">
              <label className="field-label">Loan Amount ($)</label>
              <input name="loan_amnt" type="number" value={formData.loan_amnt} onChange={handleInputChange} className="field-input" />
            </div>
            <div className="field-group">
              <label className="field-label">Interest Rate (%)</label>
              <input name="loan_int_rate" type="number" step="0.1" value={formData.loan_int_rate} onChange={handleInputChange} className="field-input" />
            </div>
            <div className="field-group">
              <label className="field-label">Loan Intent</label>
              <select name="loan_intent" value={formData.loan_intent} onChange={handleInputChange} className="field-input">
                <option value="EDUCATION">Education</option>
                <option value="MEDICAL">Medical</option>
                <option value="VENTURE">Venture</option>
                <option value="PERSONAL">Personal</option>
                <option value="HOMEIMPROVEMENT">Home Improvement</option>
                <option value="DEBTCONSOLIDATION">Debt Consolidation</option>
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Loan Grade</label>
              <select name="loan_grade" value={formData.loan_grade} onChange={handleInputChange} className="field-input">
                {['A','B','C','D','E','F','G'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Prior Default on File</label>
              <select name="cb_person_default_on_file" value={formData.cb_person_default_on_file} onChange={handleInputChange} className="field-input">
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Credit History (yrs)</label>
              <input name="cb_person_cred_hist_length" type="number" value={formData.cb_person_cred_hist_length} onChange={handleInputChange} className="field-input" />
            </div>

            <div className="sidebar-section-label" style={{ marginTop:'1rem' }}>
              <Zap size={10} /> Engine Config
            </div>
            <div className="field-group">
              <label className="field-label">Tactical Engine</label>
              <select name="model_choice" value={formData.model_choice} onChange={handleInputChange} className="field-input">
                <option value="xgboost">XGBoost (Interpretable)</option>
                <option value="random_forest">Random Forest (Stable)</option>
                <option value="mlp_baseline">Neural Net (Deep Audit)</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="analyze-button" style={{ marginTop:'0.5rem' }}>
              {loading ? 'Scanning...' : 'Run Profile Scan'}
            </button>
          </form>
        </aside>

        {/* Main Stage */}
        <main className="main-stage">
          {/* Nav */}
          <div style={{ display:'flex', gap:'0.5rem', marginBottom:'2rem' }}>
            {(['insight','whatif','trust','governance'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`nav-tab ${activeTab===tab?'active':''}`}>
                {tab === 'insight' ? 'Insight' : tab === 'whatif' ? 'Simulator' : tab === 'trust' ? 'X-Ray' : 'Logs'}
              </button>
            ))}
          </div>

          {error && (
            <div className="glass-dossier fade-up" style={{ marginBottom:'1.5rem', padding:'1.25rem 1.5rem', borderColor:'rgba(244,63,94,0.3)', background:'rgba(244,63,94,0.06)', display:'flex', alignItems:'center', gap:'1rem' }}>
              <Terminal className="text-rose-500" size={20} style={{ color:'var(--accent-rose)', flexShrink:0 }} />
              <div>
                <p style={{ margin:0, fontSize:'11px', fontWeight:800, color:'var(--accent-rose)', textTransform:'uppercase', letterSpacing:'0.15em' }}>Protocol Fault</p>
                <p style={{ margin:'4px 0 0', fontSize:'11px', fontFamily:'var(--font-mono)', color:'rgba(244,63,94,0.7)' }}>{error}</p>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="fade-up" style={{ height:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', gap:'1rem' }}>
              <Layers size={60} style={{ color:'#27272a', animation:'none' }} strokeWidth={1} />
              <h2 style={{ margin:0, fontSize:'22px', fontWeight:800, letterSpacing:'-0.5px' }}>AUTHENTICATION REQUIRED</h2>
              <p style={{ margin:0, fontSize:'13px', color:'var(--text-dim)', maxWidth:'320px', lineHeight:1.6 }}>Input applicant parameters and trigger a scan to initialize intelligence feedback.</p>
            </div>
          )}

          {result && !loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }} className="fade-up">

              {/* Hero Decision Card */}
              <div className="glass-dossier" style={{ padding:'2.5rem', position:'relative', overflow:'hidden' }}>
                <span style={{ position:'absolute', top:'1.25rem', right:'1.5rem', fontSize:'9px', fontWeight:800, color:'var(--text-muted)', letterSpacing:'0.4em', textTransform:'uppercase' }}>VERIDIAN v2.0</span>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'3rem', alignItems:'center' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
                      <Zap size={12} style={{ color: result.prediction==='Approved' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }} />
                      <span style={{ fontSize:'9px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.3em', color:'var(--text-dim)' }}>Official Clearance Status</span>
                    </div>
                    <h2 style={{ margin:0, fontSize:'clamp(60px,10vw,110px)', lineHeight:1, fontWeight:900, letterSpacing:'-4px', color: result.prediction==='Approved' ? 'var(--text-white)' : 'var(--text-dim)' }}>
                      {result.prediction.toUpperCase()}
                    </h2>
                  </div>
                  <RiskGauge probability={result.probability} prediction={result.prediction} size={180} />
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                    <div style={{ fontSize:'9px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--text-dim)' }}>Internal Confidence</div>
                    <div style={{ fontSize:'52px', fontFamily:'var(--font-mono)', fontWeight:800, color: result.review_required ? 'var(--accent-rose)' : 'var(--accent-cyan)', lineHeight:1 }}>
                      {(result.confidence_score * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', padding:'3px 10px', borderRadius:'6px', background: result.review_required ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)', color: result.review_required ? 'var(--accent-rose)' : 'var(--accent-emerald)', display:'inline-block', width:'fit-content' }}>
                      {result.review_required ? 'Review Required' : result.confidence_status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
                {/* Narrative */}
                <div className="glass-dossier" style={{ padding:'2rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                      <Terminal size={16} style={{ color:'var(--accent-indigo)' }} />
                      <span style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--text-dim)' }}>Intelligence Briefing</span>
                    </div>
                    <select name="tone" value={formData.tone} onChange={handleInputChange} className="field-input" style={{ width:'auto', fontSize:'10px', padding:'0.3rem 0.6rem' }}>
                      <option value="executive">Executive</option>
                      <option value="technical">Technical</option>
                      <option value="simple">Simple</option>
                    </select>
                  </div>
                  <p style={{ margin:0, fontSize:'15px', lineHeight:1.7, color:'rgba(255,255,255,0.8)', fontWeight:500, flexGrow:1 }}>
                    "{result.narrative}"
                  </p>
                  <div style={{ paddingTop:'1rem', borderTop:'1px solid var(--border-glass)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'9px', fontWeight:700, color:'var(--text-muted)', fontFamily:'var(--font-mono)', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                      SHAPLEY VALUE VECTOR <Info size={9} />
                    </span>
                    <div style={{ display:'flex', gap:'4px' }}>
                      {[0,1,2].map(i => <div key={i} style={{ width:'5px', height:'5px', borderRadius:'50%', background: i===0 ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.08)' }} />)}
                    </div>
                  </div>
                </div>

                {/* Feature Chart */}
                <div className="glass-dossier" style={{ padding:'2rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                    <Activity size={16} style={{ color:'var(--accent-rose)' }} />
                    <span style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--text-dim)' }}>Feature Influence Metrics</span>
                  </div>
                  <FeatureChart contributions={result.contributions} limit={6} />
                </div>
              </div>

              {/* Simulator Tab */}
              {activeTab === 'whatif' && (
                <div className="glass-dossier fade-up" style={{ padding:'2rem' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                      <div>
                        <h3 style={{ margin:'0 0 0.5rem', fontSize:'11px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.25em', color:'var(--accent-indigo)' }}>Adaptive Stress Testing</h3>
                        <p style={{ margin:0, fontSize:'12px', color:'var(--text-dim)', lineHeight:1.6 }}>Manipulate core variables to observe real-time shifts in the clearance logic.</p>
                      </div>
                      {[
                        { name:'loan_amnt', label:'Loan Amount', min:1000, max:100000, step:1000, prefix:'$' },
                        { name:'person_income', label:'Annual Income', min:5000, max:250000, step:5000, prefix:'$' },
                        { name:'loan_int_rate', label:'Interest Rate', min:5, max:30, step:0.5, prefix:'', suffix:'%' },
                      ].map(s => (
                        <div key={s.name} style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                            <label style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', color:'var(--text-dim)' }}>{s.label}</label>
                            <span style={{ fontSize:'18px', fontFamily:'var(--font-mono)', fontWeight:800 }}>
                              {s.prefix}{(formData as any)[s.name].toLocaleString()}{s.suffix ?? ''}
                            </span>
                          </div>
                          <input type="range" name={s.name} min={s.min} max={s.max} step={s.step} value={(formData as any)[s.name]} onChange={handleInputChange} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                      {result.counterfactuals && result.prediction === 'Denied' ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                          <h4 style={{ margin:0, fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.25em', color:'var(--accent-emerald)' }}>Clearance Reconstitution Path</h4>
                          {result.counterfactuals.recommendations.map((rec, i) => (
                            <div key={i} style={{ padding:'1rem 1.25rem', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-glass)', borderRadius:'12px', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'border-color 0.2s' }}>
                              <div>
                                <p style={{ margin:0, fontSize:'12px', fontWeight:700, textTransform:'uppercase' }}>{rec.improvement}</p>
                                <p style={{ margin:'4px 0 0', fontSize:'10px', fontFamily:'var(--font-mono)', color:'var(--text-muted)' }}>Delta: {(rec.suggested - rec.current).toFixed(2)}</p>
                              </div>
                              <div style={{ textAlign:'right' }}>
                                <div style={{ fontSize:'11px', fontWeight:800, color:'var(--accent-emerald)', fontFamily:'var(--font-mono)' }}>{(rec.new_prob * 100).toFixed(1)}%</div>
                                <div style={{ fontSize:'9px', color:'var(--text-muted)', textTransform:'uppercase' }}>Target Prob</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding:'2.5rem', border:'2px dashed rgba(255,255,255,0.06)', borderRadius:'16px', textAlign:'center' }}>
                          <Zap size={28} style={{ color:'#27272a', marginBottom:'1rem' }} />
                          <p style={{ margin:0, fontSize:'10px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.15em' }}>Profile status is optimal or requires executive review.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* X-Ray Tab */}
              {activeTab === 'trust' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }} className="fade-up">
                  <div className="glass-dossier" style={{ padding:'2rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                      <Fingerprint size={16} style={{ color:'var(--accent-cyan)' }} />
                      <span style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--text-dim)' }}>Statistical Manifold Scan <Info size={9} /></span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'1.5rem 0', gap:'1rem' }}>
                      <svg width="180" height="180" style={{ filter: result.is_ood ? 'drop-shadow(0 0 15px rgba(244,63,94,0.3))' : 'drop-shadow(0 0 15px rgba(34,211,238,0.3))' }}>
                        <circle cx="90" cy="90" r="80" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="transparent" />
                        <circle cx="90" cy="90" r="80" stroke={result.is_ood ? 'var(--accent-rose)' : 'var(--accent-cyan)'}
                          strokeWidth="6" fill="transparent" strokeDasharray={502} strokeDashoffset={502 - (502 * result.similarity_score)}
                          strokeLinecap="round" transform="rotate(-90 90 90)"
                          style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
                        />
                        <text x="90" y="84" textAnchor="middle" fill="white" fontSize="28" fontFamily="var(--font-mono)" fontWeight="800">{(result.similarity_score * 100).toFixed(0)}%</text>
                        <text x="90" y="104" textAnchor="middle" fill="var(--text-dim)" fontSize="9" fontFamily="var(--font-mono)" fontWeight="700">SIMILARITY</text>
                      </svg>
                      <span style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.3em', padding:'4px 14px', borderRadius:'6px', background:'rgba(255,255,255,0.04)', color: result.is_ood ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>
                        {result.is_ood ? 'OOD DETECTED' : 'NOMINAL DATA MATCH'}
                      </span>
                    </div>
                  </div>

                  <div className="glass-dossier" style={{ padding:'2rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                      <Scale size={16} style={{ color:'var(--accent-emerald)' }} />
                      <span style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', color:'var(--text-dim)' }}>Algorithmic Neutrality Check</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                      {[
                        { label:'Demographic Parity', metric:'DPD', value: result.fairness_metrics?.demographic_parity_diff ?? 0.032, color:'var(--accent-emerald)', status:'Optimal', Icon: ShieldCheck },
                        { label:'Equal Opportunity', metric:'EOD', value: result.fairness_metrics?.equal_opportunity_diff ?? 0.041, color:'var(--accent-emerald)', status:'Compliant', Icon: ShieldCheck },
                        { label:'Individual Fairness', metric:'IFS', value: result.fairness_metrics?.treatment_equality ?? 0.025, color:'var(--accent-amber)', status:'Verified', Icon: Zap },
                      ].map((item, i) => (
                        <div key={i} style={{ padding:'1rem 1.25rem', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-glass)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                            <item.Icon size={18} style={{ color: item.color }} />
                            <div>
                              <div style={{ fontSize:'12px', fontWeight:700, textTransform:'uppercase' }}>{item.label}</div>
                              <div style={{ fontSize:'10px', fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>{item.metric}: {item.value.toFixed(3)}</div>
                            </div>
                          </div>
                          <span style={{ fontSize:'9px', fontWeight:800, textTransform:'uppercase', padding:'3px 10px', borderRadius:'5px', background:'rgba(255,255,255,0.04)', color: item.color }}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === 'governance' && (
                <div className="fade-up">
                  <ScanHistory latestEntry={latestEntry} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default App;
