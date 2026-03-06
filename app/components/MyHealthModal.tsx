'use client';

import { useState } from 'react';

const CONDITIONS = [
  'Diabetes', 'Heart Disease', 'Cancer', 'Hypertension', 'Asthma',
  'Depression', 'Anxiety', 'Autoimmune Disease', 'HIV/AIDS', 'Obesity',
  'Kidney Disease', 'Liver Disease', 'COPD', 'Epilepsy', 'Alzheimer\'s',
  'Parkinson\'s', 'Multiple Sclerosis', 'Crohn\'s Disease', 'Arthritis', 'Osteoporosis',
];

const LIFESTYLES = [
  'Smoker', 'Former Smoker', 'Frequent Traveller', 'Healthcare Worker',
  'Pregnant', 'Immunocompromised', 'Elderly (65+)', 'Child (under 12)',
  'Athlete', 'Vegan/Vegetarian',
];

interface MyHealthModalProps {
  onClose: () => void;
}

export default function MyHealthModal({ onClose }: MyHealthModalProps) {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleCondition = (c: string) => {
    setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const toggleLifestyle = (l: string) => {
    setLifestyle(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const generateBrief = async () => {
    setLoading(true);
    setBrief('');
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age, location, conditions, lifestyle }),
      });
      const data = await res.json();
      setBrief(data.brief);
      setStep(4);
    } catch {
      setBrief('Unable to generate your health brief right now. Please try again.');
      setStep(4);
    }
    setLoading(false);
  };

  const overlay: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const modal: React.CSSProperties = {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '32px',
    width: '560px',
    maxWidth: '95vw',
    maxHeight: '85vh',
    overflowY: 'auto',
    border: '1px solid var(--border-color)',
    position: 'relative',
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    backgroundColor: active ? 'var(--accent-teal)' : 'var(--bg-primary)',
    color: active ? '#000' : 'var(--text-primary)',
    border: `1px solid ${active ? 'var(--accent-teal)' : 'var(--border-color)'}`,
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: active ? '700' : '400',
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  const backBtn: React.CSSProperties = {
    flex: 1,
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    cursor: 'pointer',
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '20px', cursor: 'pointer' }}>✕</button>

        <div style={{ color: 'var(--accent-teal)', fontWeight: '700', fontSize: '11px', letterSpacing: '0.08em', marginBottom: '8px' }}>MY HEALTH</div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: 'var(--text-primary)' }}>
          {step === 1 && 'Tell us about you'}
          {step === 2 && 'Your health conditions'}
          {step === 3 && 'Your lifestyle'}
          {step === 4 && 'Your Personal Health Brief'}
        </h2>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', backgroundColor: s <= step ? 'var(--accent-teal)' : 'var(--border-color)' }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Your age</label>
              <input value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 34" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Your location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Milan, Italy" style={inputStyle} />
            </div>
            <button onClick={() => setStep(2)} style={{ width: '100%', backgroundColor: 'var(--accent-teal)', color: '#000', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Select any that apply. This helps us highlight what&apos;s relevant to you.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
              {CONDITIONS.map(c => (
                <button key={c} style={chipStyle(conditions.includes(c))} onClick={() => toggleCondition(c)}>{c}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(1)} style={backBtn}>← Back</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, backgroundColor: 'var(--accent-teal)', color: '#000', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Select any that apply.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
              {LIFESTYLES.map(l => (
                <button key={l} style={chipStyle(lifestyle.includes(l))} onClick={() => toggleLifestyle(l)}>{l}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(2)} style={backBtn}>← Back</button>
              <button onClick={generateBrief} disabled={loading} style={{ flex: 2, backgroundColor: 'var(--accent-teal)', color: '#000', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                {loading ? 'Generating your brief...' : 'Generate My Health Brief →'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{brief}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setStep(1); setBrief(''); }} style={backBtn}>Update Profile</button>
              <button onClick={onClose} style={{ flex: 1, backgroundColor: 'var(--accent-teal)', color: '#000', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}