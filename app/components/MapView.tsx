'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

const TOPIC_COLORS: Record<string, string> = {
  LONGEVITY: '#059669',
  PERFORMANCE: '#2563EB',
  INVESTMENTS: '#D97706',
  'MENTAL HEALTH': '#7C3AED',
  DISCOVERIES: '#00B4D8',
  THREATS: '#E63946',
};

const TOPIC_SIGNALS: Record<string, string[]> = {
  LONGEVITY: ['Biotech','Longevity Clinics','Wellness Resorts','Research Institutions','Live News'],
  PERFORMANCE: ['Performance Labs','Altitude & Hypoxic Training','Recovery & Biohacking','Wearable Companies','Sports Medicine Clinics','Live News'],
  INVESTMENTS: ['VC Funds','Sovereign & State Funds','Family Offices','Live News'],
  'MENTAL HEALTH': ['Research Centers','Psychedelic & Ketamine Clinics','WHO & Policy Bodies','Live News'],
  DISCOVERIES: ['Clinical Trial Sites','Research Universities','Biotech Hubs','Live News'],
  THREATS: ['Health Agencies','Biosecurity Centers','Product Recalls','Live News'],
};

const SIGNAL_DESCRIPTIONS: Record<string, string> = {
  'Biotech': 'Biotechnology company',
  'Longevity Clinics': 'Longevity & preventive medicine clinic',
  'Wellness Resorts': 'Luxury wellness & health resort',
  'Research Institutions': 'Longevity research institution',
  'Performance Labs': 'Elite sports performance facility',
  'Altitude & Hypoxic Training': 'Altitude & hypoxic training center',
  'Recovery & Biohacking': 'Recovery & biohacking facility',
  'Wearable Companies': 'Health wearable technology company',
  'Sports Medicine Clinics': 'Sports medicine & orthopedic clinic',
  'VC Funds': 'Venture capital fund investing in health',
  'Sovereign & State Funds': 'Sovereign wealth fund with health mandate',
  'Family Offices': 'Family office investing in health & longevity',
  'Research Centers': 'Mental health research center',
  'Psychedelic & Ketamine Clinics': 'Psychedelic & ketamine therapy clinic',
  'WHO & Policy Bodies': 'Global mental health policy body',
  'Clinical Trial Sites': 'Major clinical trial & research site',
  'Research Universities': 'Leading medical research university',
  'Biotech Hubs': 'Life sciences & biotech innovation hub',
  'Health Agencies': 'National or international health agency',
  'Biosecurity Centers': 'Biosecurity & pandemic preparedness center',
  'Product Recalls': 'Food & drug regulatory agency',
};

const REGION_COORDS: Record<string, [number, number]> = {
  'united states': [37.09,-95.71],'usa': [37.09,-95.71],'u.s.': [37.09,-95.71],
  'new york': [40.71,-74.00],'boston': [42.36,-71.05],'san francisco': [37.77,-122.41],
  'los angeles': [34.05,-118.24],'chicago': [41.87,-87.62],'washington': [38.90,-77.03],
  'seattle': [47.60,-122.33],'houston': [29.76,-95.36],'miami': [25.77,-80.19],
  'united kingdom': [51.50,-0.12],'london': [51.50,-0.12],'uk': [51.50,-0.12],
  'europe': [48.85,10.0],'germany': [51.16,10.45],'france': [46.22,2.21],
  'switzerland': [46.81,8.22],'italy': [41.87,12.56],'spain': [40.46,-3.74],
  'netherlands': [52.13,5.29],'sweden': [60.12,18.64],'denmark': [56.26,9.50],
  'norway': [60.47,8.46],'finland': [61.92,25.74],'belgium': [50.85,4.35],
  'china': [35.86,104.19],'beijing': [39.90,116.40],'shanghai': [31.22,121.47],
  'japan': [36.20,138.25],'tokyo': [35.68,139.69],'india': [20.59,78.96],
  'australia': [-25.27,133.77],'sydney': [-33.86,151.20],'melbourne': [-37.81,144.96],
  'uae': [23.42,53.84],'dubai': [25.20,55.27],'abu dhabi': [24.45,54.37],
  'saudi': [23.88,45.07],'riyadh': [24.71,46.67],'qatar': [25.35,51.18],
  'doha': [25.28,51.52],'kuwait': [29.37,47.97],'bahrain': [26.06,50.55],
  'canada': [56.13,-106.34],'toronto': [43.65,-79.38],'vancouver': [49.28,-123.12],
  'brazil': [-14.23,-51.92],'mexico': [23.63,-102.55],
  'africa': [8.78,34.50],'kenya': [-0.02,37.90],'nigeria': [9.08,8.67],
  'south africa': [-30.55,22.93],'ethiopia': [9.14,40.48],
  'south korea': [35.90,127.76],'singapore': [1.35,103.81],'taiwan': [23.69,120.96],
  'israel': [31.04,34.85],'hong kong': [22.31,114.16],'thailand': [15.87,100.99],
  'new zealand': [-40.90,174.88],'ireland': [53.41,-8.24],'portugal': [39.39,-8.22],
  'indonesia': [-0.78,113.92],'malaysia': [4.21,101.97],
};

function guessCoords(text: string): [number,number]|null {
  const lower = text.toLowerCase();
  for (const [key,coords] of Object.entries(REGION_COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return null;
}

function jitter(c: number): number { return c+(Math.random()-0.5)*2; }

interface StaticLocation {
  name: string; lat: number; lng: number;
  topic: string; signal?: string; type?: string; url: string; region: string;
}

interface LiveDot {
  headline: string; source: string; time: string; link: string;
  lat: number; lng: number; topic: string; age: number; summary?: string;
}

interface ModalInfo {
  title: string; subtitle: string; description?: string;
  link: string; topic: string; isLive: boolean; signal?: string; summary?: string;
}

const REGION_VIEWS: Record<string, {center:[number,number];zoom:number}> = {
  'Global':       {center:[20, 10],   zoom:2},
  'Europe':       {center:[50, 10],   zoom:3.5},
  'GCC·MENA':     {center:[24, 50],   zoom:4},
  'North America':{center:[40, -95],  zoom:3},
  'SE Asia':      {center:[10, 110],  zoom:3.5},
  'LATAM':        {center:[-15, -60], zoom:3},
  'Africa':       {center:[5, 20],    zoom:3},
  'ANZ':          {center:[-25, 140], zoom:3.5},
};

const TOPIC_ORDER = ['LONGEVITY','PERFORMANCE','INVESTMENTS','MENTAL HEALTH','DISCOVERIES','THREATS'];
const GHW_URL = 'global-health-watch.vercel.app';

// ── MODAL PANEL ───────────────────────────────────────────────────────────────

function ModalPanel({ modal, color, onClose, isDark }: {
  modal: ModalInfo; color: string; onClose: () => void; isDark: boolean;
}) {
  const [snapshot, setSnapshot] = useState('');
  const [snapLoading, setSnapLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const modalBg = isDark ? '#0f1117' : '#ffffff';
  const textPrimary = isDark ? '#ffffff' : '#111111';
  const textSecondary = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  const borderCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  useEffect(() => {
    if (!modal.isLive) return;
    setSnapLoading(true);
    const context = modal.summary
      ? `Headline: "${modal.title}". Article summary: ${modal.summary}. Source: ${modal.subtitle}.`
      : `Headline: "${modal.title}". Source: ${modal.subtitle}.`;
    fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'In 2 plain-English sentences, summarise what this health story is about and why it matters. Be factual and calm.',
        context,
      }),
    })
      .then(r => r.json())
      .then(d => { setSnapshot(d.answer ?? ''); setSnapLoading(false); })
      .catch(() => setSnapLoading(false));
  }, [modal.title, modal.subtitle, modal.summary, modal.isLive]);

  function shareWhatsApp() {
    const text = `🌍 *${modal.title}*\n\nVia Global Health Watch — real-time global health intelligence\n🔗 https://${GHW_URL}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  function shareX() {
    const text = `${modal.title}\n\n🌍 Via Global Health Watch\nhttps://${GHW_URL} #GlobalHealth #HealthWatch`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  }

  function copyText() {
    navigator.clipboard.writeText(`${modal.title}\n\n🌍 Via Global Health Watch\nhttps://${GHW_URL}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:2000, backgroundColor:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor:modalBg, border:`1px solid ${color}33`, borderRadius:'16px', maxWidth:'440px', width:'100%', maxHeight:'88vh', overflowY:'auto', boxShadow:`0 24px 80px rgba(0,0,0,0.5), 0 0 40px ${color}22` }}
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{ padding:'18px 18px 0', position:'sticky', top:0, backgroundColor:modalBg, zIndex:1, borderRadius:'16px 16px 0 0' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', backgroundColor:color, boxShadow:`0 0 6px ${color}`, flexShrink:0 }} />
              <span style={{ fontSize:'10px', fontWeight:700, color, letterSpacing:'0.1em' }}>{modal.topic}</span>
              {modal.signal && <span style={{ fontSize:'10px', color:textSecondary }}>· {modal.signal}</span>}
              {modal.isLive && <span style={{ fontSize:'10px', color:textSecondary }}>· ● LIVE</span>}
            </div>
            <button
              onClick={onClose}
              style={{ width:'28px', height:'28px', borderRadius:'50%', border:`1px solid ${borderCol}`, background:'transparent', color:textSecondary, cursor:'pointer', fontSize:'13px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:'8px' }}
            >✕</button>
          </div>
          <div style={{ fontSize:'15px', fontWeight:700, color:textPrimary, lineHeight:1.45, marginBottom:'5px' }}>{modal.title}</div>
          <div style={{ fontSize:'11px', color:textSecondary, marginBottom:'12px' }}>{modal.subtitle}</div>
          <div style={{ height:'1px', backgroundColor:borderCol }} />
        </div>

        {/* BODY */}
        <div style={{ padding:'14px 18px 18px' }}>

          {/* AI Snapshot — live dots */}
          {modal.isLive && (
            <div style={{ backgroundColor:`${color}0D`, border:`1px solid ${color}22`, borderRadius:'10px', padding:'12px 14px', marginBottom:'12px' }}>
              <div style={{ fontSize:'10px', fontWeight:700, color, letterSpacing:'0.08em', marginBottom:'6px' }}>⚡ AI SNAPSHOT</div>
              {snapLoading ? (
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor:color, animation:'snapPulse 1s ease-in-out infinite' }} />
                  <span style={{ fontSize:'12px', color:textSecondary, fontStyle:'italic' }}>Generating summary…</span>
                </div>
              ) : snapshot ? (
                <div style={{ fontSize:'12px', color:textPrimary, lineHeight:1.65 }}>{snapshot}</div>
              ) : (
                <div style={{ fontSize:'12px', color:textSecondary }}>Read the full article for details.</div>
              )}
            </div>
          )}

          {/* Directory — about block */}
          {!modal.isLive && modal.description && (
            <div style={{ backgroundColor:`${color}0D`, border:`1px solid ${color}22`, borderRadius:'10px', padding:'12px 14px', marginBottom:'12px' }}>
              <div style={{ fontSize:'10px', fontWeight:700, color, letterSpacing:'0.08em', marginBottom:'6px' }}>ABOUT</div>
              <div style={{ fontSize:'12px', color:textPrimary, lineHeight:1.65 }}>{modal.description}</div>
            </div>
          )}

          {/* Primary CTA */}
          <a
            href={modal.link} target="_blank" rel="noopener noreferrer"
            style={{ display:'block', textAlign:'center', backgroundColor: modal.isLive ? color : 'transparent', color: modal.isLive ? '#fff' : color, padding:'11px 18px', borderRadius:'8px', fontSize:'12px', fontWeight:700, textDecoration:'none', border: modal.isLive ? 'none' : `1px solid ${color}55`, marginBottom:'14px' }}
          >
            {modal.isLive ? 'Read full article ↗' : 'Visit website ↗'}
          </a>

          {/* Share */}
          {(
            <div style={{ borderTop:`1px solid ${borderCol}`, paddingTop:'12px' }}>
              <div style={{ fontSize:'10px', color:textSecondary, marginBottom:'8px', letterSpacing:'0.06em', fontWeight:600 }}>SHARE VIA GLOBAL HEALTH WATCH</div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={shareWhatsApp} style={{ flex:1, backgroundColor:'#25D366', border:'none', borderRadius:'8px', padding:'10px 6px', fontSize:'11px', fontWeight:700, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>
                <button onClick={shareX} style={{ flex:1, backgroundColor:'#000', border:`1px solid ${borderCol}`, borderRadius:'8px', padding:'10px 6px', fontSize:'11px', fontWeight:700, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Post to X
                </button>
                <button onClick={copyText} title="Copy to clipboard" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border:`1px solid ${borderCol}`, borderRadius:'8px', padding:'10px 14px', fontSize:'13px', cursor:'pointer', color: copied ? color : textSecondary, transition:'all 0.2s' }}>
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes snapPulse {
          0%, 100% { opacity:1; transform:scale(1); }
          50% { opacity:0.4; transform:scale(1.4); }
        }
      `}</style>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function MapView({ activeVariants, region, isDark = true }: {
  activeVariants: string[]; region?: string; threats?: unknown[]; isDark?: boolean;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [staticLocs, setStaticLocs] = useState<StaticLocation[]>([]);
  const [liveDots, setLiveDots] = useState<LiveDot[]>([]);
  const [modal, setModal] = useState<ModalInfo|null>(null);
  const [timeFilter, setTimeFilter] = useState<'1h'|'24h'|'7d'|'all'>('24h');
  const [mapMode, setMapMode] = useState<'live'|'directory'|'both'>('both');
  const [activeSignals, setActiveSignals] = useState<Record<string,string[]>>({});
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string,boolean>>({});
  const [mapReady, setMapReady] = useState(false);
  const [counts, setCounts] = useState({static:0,live:0});
  const [mapHeight, setMapHeight] = useState(typeof window !== "undefined" && window.innerWidth < 768 ? 280 : 500);
  const dragRef = useRef<{startY:number;startH:number}|null>(null);
  const activeTopic = activeVariants.length===1 ? activeVariants[0] : null;

  const bg = isDark ? 'rgba(10,10,20,0.92)' : 'rgba(255,255,255,0.95)';
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const textPrimary = isDark ? '#fff' : '#111';
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)';
  const textSecondary = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  useEffect(() => {
    setActiveSignals(prev => {
      const next = {...prev};
      activeVariants.forEach(topic => {
        if (!next[topic]) next[topic] = [...(TOPIC_SIGNALS[topic] ?? [])];
      });
      return next;
    });
  }, [activeVariants]);

  const toggleSignal = useCallback((topic: string, signal: string) => {
    setActiveSignals(prev => {
      const current = prev[topic] ?? TOPIC_SIGNALS[topic] ?? [];
      const updated = current.includes(signal) ? current.filter(s => s !== signal) : [...current, signal];
      return {...prev, [topic]: updated};
    });
  }, []);

  const toggleAllSignals = useCallback((topic: string) => {
    setActiveSignals(prev => {
      const all = TOPIC_SIGNALS[topic] ?? [];
      const current = prev[topic] ?? all;
      const allOn = all.every(s => current.includes(s));
      return {...prev, [topic]: allOn ? [] : [...all]};
    });
  }, []);

  useEffect(() => {
    fetch('/api/locations').then(r => r.json()).then(setStaticLocs).catch(() => {});
  }, []);

  useEffect(() => {
    const topics = ['LONGEVITY','PERFORMANCE','INVESTMENTS','MENTAL HEALTH','DISCOVERIES','THREATS'];
    Promise.all(topics.map(t => fetch(`/api/feed?tab=${encodeURIComponent(t)}`).then(r => r.json())))
      .then(results => {
        const dots: LiveDot[] = [];
        results.forEach((result, i) => {
          (result.items ?? []).forEach((item: {headline:string;source:string;time:string;link:string;summary?:string}) => {
            const coords = guessCoords(item.headline + ' ' + item.source);
            if (!coords) return;
            const m = item.time?.match(/(\d+)\s*(min|hour|day|h\b|m\b|d\b)/i);
            let age = 720;
            if (m) {
              const n = parseInt(m[1]);
              const u = m[2].toLowerCase()[0];
              age = u==='m' ? n : u==='h' ? n*60 : n*1440;
            }
            dots.push({
              headline: item.headline, source: item.source,
              time: item.time, link: item.link,
              lat: jitter(coords[0]), lng: jitter(coords[1]),
              topic: topics[i], age, summary: item.summary,
            });
          });
        });
        setLiveDots(dots);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).L) { setLeafletLoaded(true); return; }
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
    const map = L.map(mapRef.current, {
      center: [25, 20], zoom: 2,
      zoomControl: false, attributionControl: false,
      worldCopyJump: false,
      maxBounds: [[-85,-180],[85,180]],
      maxBoundsViscosity: 1.0,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);
    L.control.zoom({position: 'topright'}).addTo(map);
    mapInstanceRef.current = map;
    setMapReady(true);
  }, [leafletLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !region) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    const view = REGION_VIEWS[region] ?? REGION_VIEWS['Global'];
    map.flyTo(view.center, view.zoom, {duration: 1.5});
  }, [region]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapInstanceRef.current as any).invalidateSize();
    }, 50);
  }, [mapHeight]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapInstanceRef.current as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markersRef.current.forEach((m: any) => map.removeLayer(m));
    markersRef.current = [];

    const timeMs = {'1h':60,'24h':1440,'7d':10080,'all':Infinity}[timeFilter];
    let sCount = 0, lCount = 0;

    if (mapMode !== 'live') {
      staticLocs.forEach(loc => {
        const topicActive = activeVariants.length > 0 && activeVariants.includes(loc.topic);
        if (!topicActive) return;
        const sigName = loc.signal ?? loc.type ?? '';
        const topicSignals = activeSignals[loc.topic];
        if (topicSignals && !topicSignals.includes(sigName)) return;
        const col = TOPIC_COLORS[loc.topic] ?? '#999';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const icon = (L as any).divIcon({
          className: '',
          html: `<div style="width:10px;height:10px;border-radius:50%;background:${col}22;border:2px solid ${col};box-shadow:0 0 5px ${col}44;cursor:pointer;"></div>`,
          iconSize: [10,10], iconAnchor: [5,5],
        });
        const marker = L.marker([loc.lat, loc.lng], {icon}).addTo(map)
          .on('click', () => setModal({
            title: loc.name, subtitle: loc.region ?? '',
            description: SIGNAL_DESCRIPTIONS[sigName] ?? sigName,
            link: loc.url, topic: loc.topic, isLive: false, signal: sigName,
          }));
        markersRef.current.push(marker);
        sCount++;
      });
    }

    if (mapMode !== 'directory') {
      liveDots.forEach(dot => {
        const topicActive = activeVariants.length > 0 && activeVariants.includes(dot.topic);
        if (!topicActive) return;
        if (dot.age > timeMs) return;
        const topicSignals = activeSignals[dot.topic];
        if (topicSignals && !topicSignals.includes('Live News')) return;
        const col = TOPIC_COLORS[dot.topic] ?? '#999';
        const freshness = Math.max(0, 1 - dot.age / Math.min(timeMs, 1440));
        const size = Math.round(7 + freshness * 7);
        const isPulse = dot.age < 120;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const icon = (L as any).divIcon({
          className: '',
          html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${col};opacity:${0.55+freshness*0.45};border:1px solid ${col}cc;box-shadow:0 0 ${isPulse?12:5}px ${col}${isPulse?'cc':'66'};cursor:pointer;${isPulse?'animation:mapPulse 2s ease-in-out infinite;':''}"></div>`,
          iconSize: [size,size], iconAnchor: [size/2,size/2],
        });
        const marker = L.marker([dot.lat, dot.lng], {icon}).addTo(map)
          .on('click', () => setModal({
            title: dot.headline, subtitle: `${dot.source} · ${dot.time}`,
            link: dot.link, topic: dot.topic, isLive: true, summary: dot.summary,
          }));
        markersRef.current.push(marker);
        lCount++;
      });
    }

    setCounts({static: sCount, live: lCount});
  }, [mapReady, staticLocs, liveDots, activeVariants, activeSignals, activeTopic, timeFilter, mapMode]);

  const c = (t: string) => TOPIC_COLORS[t] ?? '#999';

  const onDragStart = (e: React.MouseEvent) => {
    dragRef.current = {startY: e.clientY, startH: mapHeight};
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const newH = Math.max(300, Math.min(800, dragRef.current.startH + (ev.clientY - dragRef.current.startY)));
      setMapHeight(newH);
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const activeTopicsOrdered = TOPIC_ORDER.filter(t => activeVariants.includes(t));

  return (
    <div style={{position:'relative', width:'100%', backgroundColor:'#0a0a0f'}}>
      <div ref={mapRef} style={{width:'100%', height:`${mapHeight}px`}} />

      {/* LAYERS PANEL */}
      <div style={{position:'absolute', top:'12px', left:'12px', zIndex:1000}}>
        <div style={{ backgroundColor:bg, border:`1px solid ${border}`, borderRadius:'10px', minWidth:'200px', maxWidth:'220px', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.35)', maxHeight:'380px', overflowY:'auto' }}>
          <div style={{padding:'8px 12px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:'6px'}}>
            <svg width="11" height="11" viewBox="0 0 13 13" fill="none" style={{opacity:0.5}}>
              <rect y="0" width="13" height="2.5" rx="1.25" fill={textPrimary}/>
              <rect y="5" width="13" height="2.5" rx="1.25" fill={textPrimary}/>
              <rect y="10" width="13" height="2.5" rx="1.25" fill={textPrimary}/>
            </svg>
            <span style={{fontSize:'10px', fontWeight:700, color:textMuted, letterSpacing:'0.08em'}}>LAYERS</span>
          </div>
          {activeTopicsOrdered.length === 0 ? (
            <div style={{padding:'14px 12px', fontSize:'11px', color:textMuted, textAlign:'center', lineHeight:1.6}}>
              Select a topic above<br/>to explore the map
            </div>
          ) : activeTopicsOrdered.map(topic => {
            const signals = TOPIC_SIGNALS[topic] ?? [];
            const activeList = activeSignals[topic] ?? signals;
            const allOn = signals.every(s => activeList.includes(s));
            const isCollapsed = collapsedTopics[topic];
            return (
              <div key={topic} style={{borderBottom:`1px solid ${border}`}}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', cursor:'pointer' }} onClick={() => setCollapsedTopics(p => ({...p, [topic]: !p[topic]}))}>
                  <div style={{display:'flex', alignItems:'center', gap:'7px'}}>
                    <div style={{width:'8px', height:'8px', borderRadius:'50%', backgroundColor:c(topic), boxShadow:`0 0 5px ${c(topic)}`}} />
                    <span style={{fontSize:'10px', fontWeight:800, color:c(topic), letterSpacing:'0.07em'}}>{topic}</span>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <button onClick={e => { e.stopPropagation(); toggleAllSignals(topic); }} style={{ fontSize:'9px', color: allOn ? c(topic) : textMuted, background:'none', border:`1px solid ${allOn ? c(topic)+'44' : border}`, borderRadius:'4px', padding:'2px 6px', cursor:'pointer' }}>
                      {allOn ? 'All on' : 'All off'}
                    </button>
                    <span style={{fontSize:'10px', color:textMuted}}>{isCollapsed ? '▶' : '▼'}</span>
                  </div>
                </div>
                {!isCollapsed && (
                  <div style={{paddingBottom:'6px'}}>
                    {signals.map(signal => {
                      const isOn = activeList.includes(signal);
                      const isLive = signal === 'Live News';
                      return (
                        <div key={signal} onClick={() => toggleSignal(topic, signal)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 12px 5px 24px', cursor:'pointer', opacity: isOn ? 1 : 0.35, transition:'all 0.15s' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverBg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <div style={{ width:'12px', height:'12px', borderRadius:'3px', flexShrink:0, border:`1.5px solid ${isOn ? c(topic) : 'rgba(128,128,128,0.3)'}`, backgroundColor: isOn ? `${c(topic)}33` : 'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {isOn && <span style={{fontSize:'8px', color:c(topic), fontWeight:700}}>✓</span>}
                          </div>
                          {isLive
                            ? <div style={{width:'7px', height:'7px', borderRadius:'50%', backgroundColor:c(topic), boxShadow:`0 0 4px ${c(topic)}`, flexShrink:0}} />
                            : <div style={{width:'7px', height:'7px', borderRadius:'50%', border:`2px solid ${c(topic)}`, backgroundColor:`${c(topic)}22`, flexShrink:0}} />
                          }
                          <span style={{fontSize:'10px', color:textPrimary, whiteSpace:'nowrap'}}>{signal}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP CENTER */}
      <div style={{position:'absolute', top:'12px', left:'50%', transform:'translateX(-50%)', zIndex:1000, display:'flex', gap:'6px', alignItems:'center'}}>
        <div style={{display:'flex', gap:'2px', backgroundColor:bg, border:`1px solid ${border}`, borderRadius:'8px', padding:'3px'}}>
          {(['1h','24h','7d','all'] as const).map(t => (
            <button key={t} onClick={() => setTimeFilter(t)} style={{backgroundColor: timeFilter===t ? 'rgba(0,201,167,0.2)' : 'transparent', color: timeFilter===t ? '#00C9A7' : textMuted, border: timeFilter===t ? '1px solid rgba(0,201,167,0.4)' : '1px solid transparent', borderRadius:'5px', padding:'3px 10px', fontSize:'11px', fontWeight:600, cursor:'pointer', transition:'all 0.15s'}}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{display:'flex', gap:'2px', backgroundColor:bg, border:`1px solid ${border}`, borderRadius:'8px', padding:'3px'}}>
          {([['both','Both'],['live','● Live'],['directory','○ Dir']] as const).map(([mode,label]) => (
            <button key={mode} onClick={() => setMapMode(mode as 'both'|'live'|'directory')} style={{backgroundColor: mapMode===mode ? (isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)') : 'transparent', color: mapMode===mode ? textPrimary : textMuted, border:'1px solid transparent', borderRadius:'5px', padding:'3px 9px', fontSize:'11px', fontWeight:600, cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap'}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* LEGEND */}
      <div style={{position:'absolute', bottom:'20px', left:'12px', zIndex:1000, backgroundColor:bg, border:`1px solid ${border}`, borderRadius:'8px', padding:'7px 12px', display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap'}}>
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
          <div style={{width:'9px', height:'9px', borderRadius:'50%', border:`2px solid ${isDark?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.4)'}`, backgroundColor:'transparent'}} />
          <span style={{fontSize:'9px', color:textMuted}}>Directory ({counts.static})</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
          <div style={{width:'9px', height:'9px', borderRadius:'50%', backgroundColor: isDark?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.5)', boxShadow:'0 0 5px rgba(128,128,128,0.4)'}} />
          <span style={{fontSize:'9px', color:textMuted}}>Live ({counts.live})</span>
        </div>
        <div style={{width:'1px', height:'12px', backgroundColor:border}} />
        {Object.entries(TOPIC_COLORS).map(([topic, color]) => (
          <div key={topic} style={{display:'flex', alignItems:'center', gap:'4px', opacity: activeVariants.length===0 ? 0.2 : activeVariants.includes(topic) ? 1 : 0.2, transition:'opacity 0.2s'}}>
            <div style={{width:'6px', height:'6px', borderRadius:'50%', backgroundColor:color}} />
            <span style={{fontSize:'9px', color:textMuted, whiteSpace:'nowrap'}}>{topic==='MENTAL HEALTH' ? 'MENTAL' : topic}</span>
          </div>
        ))}
      </div>

      <div style={{position:'absolute', bottom:'20px', right:'12px', zIndex:1000, fontSize:'9px', color:textMuted}}>© OpenStreetMap © CartoDB</div>

      {/* DRAG HANDLE */}
      <div onMouseDown={onDragStart} style={{position:'absolute', bottom:0, left:0, right:0, height:'10px', cursor:'ns-resize', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1001}}>
        <div style={{width:'40px', height:'3px', borderRadius:'2px', backgroundColor: isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.15)'}} />
      </div>

      {/* MODAL */}
      {modal && <ModalPanel modal={modal} color={c(modal.topic)} onClose={() => setModal(null)} isDark={isDark} />}

      <style>{`
        @keyframes mapPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
