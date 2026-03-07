'use client';

import { useEffect, useRef, useState } from 'react';

const TOPIC_COLORS: Record<string, string> = {
  LONGEVITY: '#059669',
  PERFORMANCE: '#2563EB',
  INVESTMENTS: '#D97706',
  'MENTAL HEALTH': '#7C3AED',
  DISCOVERIES: '#00B4D8',
  THREATS: '#E63946',
  RECALLS: '#F97316',
};

const TOPIC_SUBLAYERS: Record<string, string[]> = {
  LONGEVITY: ['Biotech', 'Clinic', 'Wellness Resort', 'Wellness Club'],
  PERFORMANCE: ['Performance Lab', 'Wearable', 'Altitude Training', 'Recovery', 'Sports Clinic', 'HBOT Clinic'],
  INVESTMENTS: ['VC Fund', 'Sovereign Fund'],
  'MENTAL HEALTH': ['Live News'],
  DISCOVERIES: ['Live News'],
  THREATS: ['Live News'],
  RECALLS: ['Live News'],
};

interface StaticLocation { name: string; lat: number; lng: number; topic: string; type: string; url: string; region: string; }
interface LiveDot { headline: string; source: string; time: string; link: string; lat: number; lng: number; topic: string; age: number; }
interface ModalDot { name?: string; headline?: string; source?: string; time?: string; link: string; topic: string; type?: string; isLive?: boolean; }

const REGION_COORDS: Record<string, [number, number]> = {
  'united states': [37.09, -95.71], 'usa': [37.09, -95.71], 'new york': [40.71, -74.00],
  'boston': [42.36, -71.05], 'san francisco': [37.77, -122.41], 'los angeles': [34.05, -118.24],
  'chicago': [41.87, -87.62], 'united kingdom': [51.50, -0.12], 'london': [51.50, -0.12],
  'uk': [51.50, -0.12], 'europe': [48.85, 10.0], 'germany': [51.16, 10.45],
  'france': [46.22, 2.21], 'switzerland': [46.81, 8.22], 'italy': [41.87, 12.56],
  'spain': [40.46, -3.74], 'china': [35.86, 104.19], 'beijing': [39.90, 116.40],
  'shanghai': [31.22, 121.47], 'japan': [36.20, 138.25], 'tokyo': [35.68, 139.69],
  'india': [20.59, 78.96], 'australia': [-25.27, 133.77], 'uae': [23.42, 53.84],
  'dubai': [25.20, 55.27], 'abu dhabi': [24.45, 54.37], 'saudi': [23.88, 45.07],
  'qatar': [25.35, 51.18], 'canada': [56.13, -106.34], 'brazil': [-14.23, -51.92],
  'africa': [8.78, 34.50], 'kenya': [-0.02, 37.90], 'south korea': [35.90, 127.76],
  'singapore': [1.35, 103.81], 'israel': [31.04, 34.85], 'global': [20.0, 10.0],
};

function guessCoords(text: string): [number, number] | null {
  const lower = text.toLowerCase();
  for (const [key, coords] of Object.entries(REGION_COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return null;
}

function addJitter(coord: number): number { return coord + (Math.random() - 0.5) * 2; }

export default function MapView({ activeVariants, region, threats }: { activeVariants: string[]; region?: string; threats?: unknown[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({ LONGEVITY: true, PERFORMANCE: true, INVESTMENTS: true, 'MENTAL HEALTH': true, DISCOVERIES: true, THREATS: true, RECALLS: true });
  const [activeSubLayers, setActiveSubLayers] = useState<Record<string, boolean>>({});
  const [liveDots, setLiveDots] = useState<LiveDot[]>([]);
  const [staticLocs, setStaticLocs] = useState<StaticLocation[]>([]);
  const [modal, setModal] = useState<ModalDot | null>(null);
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'1h' | '24h' | '7d' | 'all'>('24h');

  useEffect(() => {
    fetch('/api/locations').then(r => r.json()).then(setStaticLocs).catch(() => setStaticLocs([]));
  }, []);

  useEffect(() => {
    const topics = ['LONGEVITY', 'PERFORMANCE', 'INVESTMENTS', 'MENTAL HEALTH', 'DISCOVERIES', 'THREATS', 'RECALLS'];
    Promise.all(topics.map(t => fetch(`/api/feed?tab=${encodeURIComponent(t)}`).then(r => r.json())))
      .then(results => {
        const dots: LiveDot[] = [];
        results.forEach((result, i) => {
          const topic = topics[i];
          (result.items ?? []).forEach((item: { headline: string; source: string; time: string; link: string }) => {
            const coords = guessCoords(item.headline + ' ' + item.source);
            if (coords) {
              const ageMatch = item.time.match(/(\d+)\s*(min|hour|day|h|m|d)/i);
              let age = 60;
              if (ageMatch) {
                const n = parseInt(ageMatch[1]);
                const unit = ageMatch[2].toLowerCase();
                if (unit.startsWith('m')) age = n;
                else if (unit.startsWith('h')) age = n * 60;
                else if (unit.startsWith('d')) age = n * 60 * 24;
              }
              dots.push({ headline: item.headline, source: item.source, time: item.time, link: item.link, lat: addJitter(coords[0]), lng: addJitter(coords[1]), topic, age });
            }
          });
        });
        setLiveDots(dots);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.querySelector('script[src*="leaflet"]')) { setLeafletLoaded(true); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    const map = L.map(mapRef.current, { center: [25, 20], zoom: 2, zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    mapInstanceRef.current = map;
  }, [leafletLoaded]);

  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markersRef.current.forEach((m: any) => map.removeLayer(m));
    markersRef.current = [];
    const timeFilterMinutes = { '1h': 60, '24h': 1440, '7d': 10080, 'all': Infinity }[timeFilter];

    staticLocs.forEach(loc => {
      if (!activeLayers[loc.topic]) return;
      if (activeSubLayers[`${loc.topic}::${loc.type}`] === false) return;
      const color = TOPIC_COLORS[loc.topic] ?? '#999';
      const icon = L.divIcon({ className: '', html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid ${color}88;box-shadow:0 0 6px ${color}88;cursor:pointer;"></div>`, iconSize: [10, 10], iconAnchor: [5, 5] });
      const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map).on('click', () => setModal({ name: loc.name, link: loc.url, topic: loc.topic, type: loc.type, isLive: false }));
      markersRef.current.push(marker);
    });

    liveDots.forEach(dot => {
      if (!activeLayers[dot.topic]) return;
      if (dot.age > timeFilterMinutes) return;
      const color = TOPIC_COLORS[dot.topic] ?? '#999';
      const opacity = Math.max(0.3, 1 - dot.age / timeFilterMinutes);
      const size = dot.age < 60 ? 12 : dot.age < 360 ? 9 : 7;
      const pulse = dot.age < 120 ? 'animation:livePulse 2s infinite;' : '';
      const icon = L.divIcon({ className: '', html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};opacity:${opacity};border:1.5px solid ${color};box-shadow:0 0 ${dot.age < 120 ? '10px' : '4px'} ${color}99;cursor:pointer;${pulse}"></div>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
      const marker = L.marker([dot.lat, dot.lng], { icon }).addTo(map).on('click', () => setModal({ headline: dot.headline, source: dot.source, time: dot.time, link: dot.link, topic: dot.topic, isLive: true }));
      markersRef.current.push(marker);
    });
  }, [leafletLoaded, staticLocs, liveDots, activeLayers, activeSubLayers, timeFilter]);

  const color = (topic: string) => TOPIC_COLORS[topic] ?? '#999';

  return (
    <div style={{ position: 'relative', width: '100%', height: '420px', backgroundColor: '#0a0a0f' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', gap: '4px', backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px' }}>
        {(['1h', '24h', '7d', 'all'] as const).map(t => (
          <button key={t} onClick={() => setTimeFilter(t)} style={{ backgroundColor: timeFilter === t ? 'rgba(0,201,167,0.3)' : 'transparent', color: timeFilter === t ? '#00C9A7' : 'rgba(255,255,255,0.5)', border: timeFilter === t ? '1px solid rgba(0,201,167,0.5)' : '1px solid transparent', borderRadius: '5px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, backgroundColor: 'rgba(10,10,20,0.92)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', minWidth: '180px', backdropFilter: 'blur(8px)' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>LAYERS</div>
        {Object.keys(TOPIC_COLORS).map(topic => (
          <div key={topic}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer' }} onClick={() => setActiveLayers(prev => ({ ...prev, [topic]: !prev[topic] }))}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: activeLayers[topic] ? color(topic) : 'transparent', border: `2px solid ${color(topic)}`, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: activeLayers[topic] ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', flex: 1 }}>{topic}</span>
              <span onClick={e => { e.stopPropagation(); setExpandedLayer(expandedLayer === topic ? null : topic); }} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>{expandedLayer === topic ? '▲' : '▼'}</span>
            </div>
            {expandedLayer === topic && TOPIC_SUBLAYERS[topic]?.map(sub => {
              const isActive = activeSubLayers[`${topic}::${sub}`] !== false;
              return (
                <div key={sub} onClick={() => setActiveSubLayers(prev => ({ ...prev, [`${topic}::${sub}`]: !isActive }))}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0 3px 18px', cursor: 'pointer' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isActive ? color(topic) : 'transparent', border: `1.5px solid ${color(topic)}`, opacity: 0.7 }} />
                  <span style={{ fontSize: '10px', color: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}>{sub}</span>
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>● static &nbsp;◉ live news</div>
      </div>

      <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 1000, fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>© OpenStreetMap © CartoDB</div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setModal(null)}>
          <div style={{ backgroundColor: '#12121e', border: `1px solid ${color(modal.topic)}44`, borderRadius: '14px', maxWidth: '420px', width: '100%', padding: '24px', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '10px', color: color(modal.topic), fontWeight: 700, letterSpacing: '0.1em', marginBottom: '8px' }}>{modal.topic} {modal.type ? `· ${modal.type}` : '· LIVE NEWS'}</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.45, marginBottom: '12px' }}>{modal.name ?? modal.headline}</div>
            {modal.source && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>{modal.source} · {modal.time}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href={modal.link} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: color(modal.topic), color: '#000', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>{modal.isLive ? 'Read article ↗' : 'Visit website ↗'}</a>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 14px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes livePulse { 0%,100%{box-shadow:0 0 4px currentColor;transform:scale(1)} 50%{box-shadow:0 0 12px currentColor;transform:scale(1.3)} }`}</style>
    </div>
  );
}
