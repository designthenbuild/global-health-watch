'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const DISCOVERIES_DOTS = [
  { id: '6', name: 'Psilocybin Trial Results', severity: 'BREAKTHROUGH', location: 'London, UK', keyStat: '67% remission rate in treatment-resistant depression', ageContext: 'Adults 25-65 with TRD', whyHere: 'Imperial College London Phase 3 trial', timeline: 'Results published today', source: 'The Lancet', link: 'https://www.thelancet.com', color: '#00C9A7', coordinates: [-0.1276, 51.5074] as [number, number] },
  { id: '7', name: 'GLP-1 Cardiovascular Trial', severity: 'BREAKTHROUGH', location: 'Boston, USA', keyStat: '20% reduction in heart attack risk in non-diabetics', ageContext: 'Adults 45-75', whyHere: 'Harvard Medical School Phase 3 results', timeline: 'Published this week', source: 'NEJM', link: 'https://www.nejm.org', color: '#00C9A7', coordinates: [-71.0589, 42.3601] as [number, number] },
  { id: '8', name: 'mRNA Malaria Vaccine', severity: 'BREAKTHROUGH', location: 'Burkina Faso', keyStat: '77% efficacy in Phase 3 African trial', ageContext: 'Children 6 months to 5 years', whyHere: 'Phase 3 trial across 4 African countries', timeline: 'Results published this week', source: 'The Lancet', link: 'https://www.thelancet.com', color: '#00C9A7', coordinates: [-1.5616, 12.3642] as [number, number] },
  { id: '9', name: 'CAR-T Lymphoma Therapy', severity: 'BREAKTHROUGH', location: 'Houston, USA', keyStat: '54% complete remission in lymphoma patients', ageContext: 'Adults with relapsed lymphoma', whyHere: 'MD Anderson Cancer Center trial', timeline: 'FDA approval granted this month', source: 'NEJM', link: 'https://www.nejm.org', color: '#00C9A7', coordinates: [-95.3698, 29.7604] as [number, number] },
  { id: '10', name: 'CRISPR Haemophilia B', severity: 'BREAKTHROUGH', location: 'London, UK', keyStat: 'Single infusion corrects haemophilia B — 89% success', ageContext: 'Males with severe haemophilia B', whyHere: 'UCL gene therapy trial', timeline: 'Published this week', source: 'NEJM', link: 'https://www.nejm.org', color: '#4CC9F0', coordinates: [-0.1276, 51.5074] as [number, number] },
];

const REGION_VIEWS: Record<string, { center: [number, number]; zoom: number }> = {
  'Global': { center: [20, 20], zoom: 1.8 },
  'Europe': { center: [10, 50], zoom: 3.5 },
  'GCC·MENA': { center: [45, 25], zoom: 3.5 },
  'North America': { center: [-95, 40], zoom: 3 },
  'SE Asia': { center: [110, 10], zoom: 3.5 },
  'LATAM': { center: [-60, -15], zoom: 3 },
  'Africa': { center: [20, 5], zoom: 3 },
  'ANZ': { center: [140, -25], zoom: 3.5 },
};

interface MapViewProps {
  variant: string;
  region: string;
  threats?: Dot[];
}

interface Dot {
  id: string;
  name: string;
  severity: string;
  color: string;
  location: string;
  keyStat: string;
  ageContext: string;
  whyHere: string;
  timeline: string;
  source: string;
  link?: string;
  coordinates: [number, number];
}

export default function MapView({ variant, region, threats = [] }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [activeDot, setActiveDot] = useState<Dot | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20, 20],
      zoom: 1.8,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;
    const view = REGION_VIEWS[region] || REGION_VIEWS['Global'];
    map.current.flyTo({ center: view.center, zoom: view.zoom, duration: 1500 });
  }, [region]);

  useEffect(() => {
    if (!map.current) return;

    const addDots = () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      const dots = variant === 'DISCOVERIES' ? DISCOVERIES_DOTS : threats;

      dots.forEach(dot => {
        const el = document.createElement('div');
        el.style.width = '14px';
        el.style.height = '14px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = dot.color;
        el.style.border = '2px solid rgba(255,255,255,0.4)';
        el.style.cursor = 'pointer';
        el.style.boxShadow = `0 0 8px ${dot.color}`;
        el.addEventListener('click', () => { setActiveDot(dot); setQuestion(''); setAnswer(''); });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(dot.coordinates)
          .addTo(map.current!);
        markersRef.current.push(marker);
      });
    };

    if (map.current.isStyleLoaded()) addDots();
    else map.current.on('load', addDots);
  }, [variant, threats]);

  const askClaude = async () => {
    if (!question.trim() || !activeDot) return;
    setLoading(true);
    setAnswer('');
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context: activeDot }),
      });
      const data = await res.json();
      setAnswer(data.response);
    } catch { setAnswer('Unable to get explanation right now.'); }
    setLoading(false);
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '8px 24px', display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {['24h', '7d', '30d', '1yr', 'All'].map(t => (
          <button key={t} style={{ backgroundColor: t === '7d' ? 'var(--accent-teal)' : 'transparent', color: t === '7d' ? '#000' : 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>{t}</button>
        ))}
      </div>

      <div ref={mapContainer} style={{ width: '100%', height: '55vh' }} />

      {activeDot && (
        <div style={{ position: 'fixed', top: '80px', right: '24px', width: '320px', backgroundColor: '#1A2A3A', borderRadius: '10px', padding: '16px', zIndex: 1000, fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <strong style={{ fontSize: '15px' }}>{activeDot.name}</strong>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ background: activeDot.color, color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>{activeDot.severity}</span>
              <button onClick={() => setActiveDot(null)} style={{ background: 'transparent', border: 'none', color: '#8892A4', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
          </div>
          <div style={{ color: '#8892A4', marginBottom: '6px' }}>📍 {activeDot.location}</div>
          <div style={{ marginBottom: '6px' }}><strong style={{ color: '#00C9A7' }}>Key stat:</strong> {activeDot.keyStat}</div>
          <div style={{ marginBottom: '6px' }}><strong style={{ color: '#00C9A7' }}>Who&apos;s affected:</strong> {activeDot.ageContext}</div>
          <div style={{ marginBottom: '6px' }}><strong style={{ color: '#00C9A7' }}>Why here:</strong> {activeDot.whyHere}</div>
          <div style={{ marginBottom: '6px', color: '#8892A4', fontSize: '12px' }}>{activeDot.timeline}</div>
          <div style={{ color: '#8892A4', fontSize: '12px', marginBottom: '12px' }}>
            Source: {activeDot.link
              ? <a href={activeDot.link} target="_blank" rel="noopener noreferrer" style={{ color: '#00C9A7', textDecoration: 'underline' }}>{activeDot.source}</a>
              : activeDot.source}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#00C9A7', marginBottom: '8px' }}>EXPLAIN THIS TO ME</div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && askClaude()} placeholder="Ask a question..." style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '12px' }} />
              <button onClick={askClaude} disabled={loading} style={{ backgroundColor: '#00C9A7', color: '#000', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>{loading ? '...' : 'Ask'}</button>
            </div>
            {answer && <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#fff', backgroundColor: 'rgba(0,201,167,0.08)', padding: '10px', borderRadius: '6px' }}>{answer}</div>}
          </div>
        </div>
      )}
    </div>
  );
}