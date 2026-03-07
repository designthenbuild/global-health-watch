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

const TOPIC_LABELS: Record<string, string> = {
  LONGEVITY: 'Longevity',
  PERFORMANCE: 'Performance',
  INVESTMENTS: 'Investments',
  'MENTAL HEALTH': 'Mental Health',
  DISCOVERIES: 'Discoveries',
  THREATS: 'Threats',
  RECALLS: 'Recalls',
};

const REGION_COORDS: Record<string, [number, number]> = {
  'united states': [37.09, -95.71], 'usa': [37.09, -95.71],
  'new york': [40.71, -74.00], 'boston': [42.36, -71.05],
  'san francisco': [37.77, -122.41], 'los angeles': [34.05, -118.24],
  'chicago': [41.87, -87.62], 'washington': [38.90, -77.03],
  'united kingdom': [51.50, -0.12], 'london': [51.50, -0.12], 'uk': [51.50, -0.12],
  'europe': [48.85, 10.0], 'germany': [51.16, 10.45], 'france': [46.22, 2.21],
  'switzerland': [46.81, 8.22], 'italy': [41.87, 12.56], 'spain': [40.46, -3.74],
  'netherlands': [52.13, 5.29], 'sweden': [60.12, 18.64], 'denmark': [56.26, 9.50],
  'china': [35.86, 104.19], 'beijing': [39.90, 116.40], 'shanghai': [31.22, 121.47],
  'japan': [36.20, 138.25], 'tokyo': [35.68, 139.69],
  'india': [20.59, 78.96], 'australia': [-25.27, 133.77],
  'uae': [23.42, 53.84], 'dubai': [25.20, 55.27], 'abu dhabi': [24.45, 54.37],
  'saudi': [23.88, 45.07], 'qatar': [25.35, 51.18], 'kuwait': [29.37, 47.97],
  'canada': [56.13, -106.34], 'brazil': [-14.23, -51.92],
  'africa': [8.78, 34.50], 'kenya': [-0.02, 37.90], 'nigeria': [9.08, 8.67],
  'south korea': [35.90, 127.76], 'singapore': [1.35, 103.81],
  'israel': [31.04, 34.85], 'taiwan': [23.69, 120.96],
};

function guessCoords(text: string): [number, number] | null {
  const lower = text.toLowerCase();
  for (const [key, coords] of Object.entries(REGION_COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return null;
}

function jitter(coord: number): number { return coord + (Math.random() - 0.5) * 1.5; }

interface StaticLocation {
  name: string; lat: number; lng: number;
  topic: string; type: string; url: string; region: string;
}

interface LiveDot {
  headline: string; source: string; time: string; link: string;
  lat: number; lng: number; topic: string; age: number;
}

interface ModalInfo {
  title: string; subtitle: string; meta?: string;
  link: string; topic: string; isLive: boolean; type?: string;
}

const REGION_VIEWS: Record<string, { center: [number, number]; zoom: number }> = {
  'Global': { center: [20, 20], zoom: 2 },
  'Europe': { center: [10, 50], zoom: 3.5 },
  'GCC·MENA': { center: [45, 25], zoom: 3.5 },
  'North America': { center: [-95, 40], zoom: 3 },
  'SE Asia': { center: [110, 10], zoom: 3.5 },
  'LATAM': { center: [-60, -15], zoom: 3 },
  'Africa': { center: [20, 5], zoom: 3 },
  'ANZ': { center: [140, -25], zoom: 3.5 },
};

export default function MapView({ activeVariants, region }: { activeVariants: string[]; region?: string; threats?: unknown[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [staticLocs, setStaticLocs] = useState<StaticLocation[]>([]);
  const [liveDots, setLiveDots] = useState<LiveDot[]>([]);
  const [modal, setModal] = useState<ModalInfo | null>(null);
  const [timeFilter, setTimeFilter] = useState<'1h' | '24h' | '7d' | 'all'>('24h');
  const [mapMode, setMapMode] = useState<'live' | 'directory' | 'both'>('both');
  const [dotCounts, setDotCounts] = useState({ static: 0, live: 0 });

  // Load static locations
  useEffect(() => {
    fetch('/api/locations').then(r => r.json()).then(setStaticLocs).catch(() => setStaticLocs([]));
  }, []);

  // Load live feed dots
  useEffect(() => {
    const topics = ['LONGEVITY', 'PERFORMANCE', 'INVESTMENTS', 'MENTAL HEALTH', 'DISCOVERIES', 'THREATS', 'RECALLS'];
    Promise.all(topics.map(t => fetch(`/api/feed?tab=${encodeURIComponent(t)}`).then(r => r.json())))
      .then(results => {
        const dots: LiveDot[] = [];
        results.forEach((result, i) => {
          (result.items ?? []).forEach((item: { headline: string; source: string; time: string; link: string }) => {
            const coords = guessCoords(item.headline + ' ' + item.source);
            if (!coords) return;
            const ageMatch = item.time.match(/(\d+)\s*(min|hour|day|h|m|d)/i);
            let age = 120;
            if (ageMatch) {
              const n = parseInt(ageMatch[1]);
              const unit = ageMatch[2].toLowerCase();
              if (unit.startsWith('m')) age = n;
              else if (unit.startsWith('h')) age = n * 60;
              else if (unit.startsWith('d')) age = n * 1440;
            }
            dots.push({ headline: item.headline, source: item.source, time: item.time, link: item.link, lat: jitter(coords[0]), lng: jitter(coords[1]), topic: topics[i], age });
          });
        });
        setLiveDots(dots);
      }).catch(() => {});
  }, []);

  // Load Leaflet once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as unknown as Record<string, unknown>).L) { setLeafletLoaded(true); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Init map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    const map = L.map(mapRef.current, { center: [25, 20], zoom: 2, zoomControl: false, attributionControl: false, worldCopyJump: false, maxBounds: [[-90,-180],[90,180]], maxBoundsViscosity: 1.0 });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    mapInstanceRef.current = map;
  }, [leafletLoaded]);

  // Fly to region
  useEffect(() => {
    if (!mapInstanceRef.current || !region) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    const view = REGION_VIEWS[region] ?? REGION_VIEWS['Global'];
    map.flyTo(view.center, view.zoom, { duration: 1.5 });
  }, [region]);

  // Render markers
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markersRef.current.forEach((m: any) => map.removeLayer(m));
    markersRef.current = [];

    const timeMs = { '1h': 60, '24h': 1440, '7d': 10080, 'all': Infinity }[timeFilter];
    let staticCount = 0;
    let liveCount = 0;

    // STATIC dots — hollow rings, smaller, always present unless topic toggled off
    if (mapMode !== 'live') {
      staticLocs.forEach(loc => {
        if (activeVariants.length > 0 && !activeVariants.includes(loc.topic)) return;
        const c = TOPIC_COLORS[loc.topic] ?? '#999';
        const icon = L.divIcon({
          className: '',
          html: `<div title="${loc.name}" style="
            width:9px;height:9px;border-radius:50%;
            background:transparent;
            border:2px solid ${c};
            box-shadow:0 0 4px ${c}66;
            cursor:pointer;
          "></div>`,
          iconSize: [9, 9], iconAnchor: [4, 4],
        });
        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map)
          .on('click', () => setModal({
            title: loc.name,
            subtitle: `${loc.type} · ${loc.region}`,
            link: loc.url,
            topic: loc.topic,
            isLive: false,
            type: loc.type,
          }));
        markersRef.current.push(marker);
        staticCount++;
      });
    }

    // LIVE dots — filled + glowing, sized by recency
    if (mapMode !== 'directory') {
      liveDots.forEach(dot => {
        if (activeVariants.length > 0 && !activeVariants.includes(dot.topic)) return;
        if (dot.age > timeMs) return;
        const c = TOPIC_COLORS[dot.topic] ?? '#999';
        const freshness = 1 - Math.min(dot.age / timeMs, 1);
        const size = 7 + Math.round(freshness * 7); // 7-14px
        const glow = dot.age < 120 ? `box-shadow:0 0 10px ${c},0 0 20px ${c}66;` : `box-shadow:0 0 5px ${c}99;`;
        const pulse = dot.age < 120 ? 'animation:mapPulse 2s ease-in-out infinite;' : '';
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:${c};
            opacity:${0.5 + freshness * 0.5};
            border:1px solid ${c};
            ${glow}${pulse}
            cursor:pointer;
          "></div>`,
          iconSize: [size, size], iconAnchor: [size / 2, size / 2],
        });
        const marker = L.marker([dot.lat, dot.lng], { icon }).addTo(map)
          .on('click', () => setModal({
            title: dot.headline,
            subtitle: `${dot.source} · ${dot.time}`,
            link: dot.link,
            topic: dot.topic,
            isLive: true,
          }));
        markersRef.current.push(marker);
        liveCount++;
      });
    }

    setDotCounts({ static: staticCount, live: liveCount });
  }, [leafletLoaded, staticLocs, liveDots, activeVariants, timeFilter, mapMode]);

  const c = (topic: string) => TOPIC_COLORS[topic] ?? '#999';

  return (
    <div style={{ position: 'relative', width: '100%', height: '460px', backgroundColor: '#0a0a0f' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Top center — time filter + mode toggle */}
      <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', gap: '6px', alignItems: 'center' }}>
        {/* Time filter */}
        <div style={{ display: 'flex', gap: '2px', backgroundColor: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '3px' }}>
          {(['1h', '24h', '7d', 'all'] as const).map(t => (
            <button key={t} onClick={() => setTimeFilter(t)} style={{ backgroundColor: timeFilter === t ? 'rgba(0,201,167,0.25)' : 'transparent', color: timeFilter === t ? '#00C9A7' : 'rgba(255,255,255,0.45)', border: timeFilter === t ? '1px solid rgba(0,201,167,0.4)' : '1px solid transparent', borderRadius: '5px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '2px', backgroundColor: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '3px' }}>
          {([['both', 'Both'], ['live', '● Live'], ['directory', '○ Directory']] as const).map(([mode, label]) => (
            <button key={mode} onClick={() => setMapMode(mode)} style={{ backgroundColor: mapMode === mode ? 'rgba(255,255,255,0.12)' : 'transparent', color: mapMode === mode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', border: '1px solid transparent', borderRadius: '5px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom left — legend + counts */}
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '9px', height: '9px', borderRadius: '50%', border: '2px solid #00C9A7', backgroundColor: 'transparent' }} />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Directory ({dotCounts.static})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00C9A7', boxShadow: '0 0 6px #00C9A7' }} />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Live news ({dotCounts.live})</span>
        </div>
        <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        {Object.entries(TOPIC_COLORS).map(([topic, color]) => (
          <div key={topic} style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: activeVariants.length === 0 || activeVariants.includes(topic) ? 1 : 0.2, transition: 'opacity 0.2s' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: color }} />
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{TOPIC_LABELS[topic]}</span>
          </div>
        ))}
      </div>

      {/* Attribution */}
      <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 1000, fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>
        © OpenStreetMap © CartoDB
      </div>

      {/* Dot modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setModal(null)}>
          <div style={{ backgroundColor: '#13131f', border: `1px solid ${c(modal.topic)}55`, borderRadius: '14px', maxWidth: '440px', width: '100%', padding: '24px', boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 40px ${c(modal.topic)}22` }}
            onClick={e => e.stopPropagation()}>
            {/* Topic tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c(modal.topic), boxShadow: `0 0 6px ${c(modal.topic)}` }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: c(modal.topic), letterSpacing: '0.1em' }}>{modal.topic}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>{modal.isLive ? '● LIVE NEWS' : `· ${modal.type}`}</span>
            </div>
            {/* Title */}
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.45, marginBottom: '8px' }}>
              {modal.title}
            </div>
            {/* Meta */}
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
              {modal.subtitle}
            </div>
            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href={modal.link} target="_blank" rel="noopener noreferrer"
                style={{ backgroundColor: c(modal.topic), color: '#000', padding: '9px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                {modal.isLive ? 'Read article ↗' : 'Visit website ↗'}
              </a>
              <button onClick={() => setModal(null)}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '9px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes mapPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
