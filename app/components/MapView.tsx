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
  lat: number; lng: number; topic: string; age: number;
}

interface ModalInfo {
  title: string; subtitle: string; description?: string;
  link: string; topic: string; isLive: boolean; signal?: string;
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
  // layers panel always visible
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string,boolean>>({});
  const [mapReady, setMapReady] = useState(false);
  const [counts, setCounts] = useState({static:0,live:0});
  const [mapHeight, setMapHeight] = useState(500);
  const dragRef = useRef<{startY:number;startH:number}|null>(null);

  const activeTopic = activeVariants.length===1 ? activeVariants[0] : null;

  const bg = isDark ? 'rgba(10,10,20,0.92)' : 'rgba(255,255,255,0.95)';
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const textPrimary = isDark ? '#fff' : '#111';
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)';
  const textSecondary = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  // Init signals for all active topics
  useEffect(() => {
    setActiveSignals(prev => {
      const next = {...prev};
      activeVariants.forEach(topic => {
        if (!next[topic]) {
          next[topic] = [...(TOPIC_SIGNALS[topic] ?? [])];
        }
      });
      return next;
    });
  }, [activeVariants]);

  const toggleSignal = useCallback((topic: string, signal: string) => {
    setActiveSignals(prev => {
      const current = prev[topic] ?? TOPIC_SIGNALS[topic] ?? [];
      const updated = current.includes(signal)
        ? current.filter(s => s !== signal)
        : [...current, signal];
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
          (result.items ?? []).forEach((item: {headline:string;source:string;time:string;link:string}) => {
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
              topic: topics[i], age,
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
            title: loc.name,
            subtitle: loc.region ?? '',
            description: SIGNAL_DESCRIPTIONS[sigName] ?? sigName,
            link: loc.url,
            topic: loc.topic,
            isLive: false,
            signal: sigName,
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
            title: dot.headline,
            subtitle: `${dot.source} · ${dot.time}`,
            link: dot.link,
            topic: dot.topic,
            isLive: true,
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

  // Active topics in display order
  const activeTopicsOrdered = TOPIC_ORDER.filter(t => activeVariants.includes(t));

  return (
    <div style={{position:'relative', width:'100%', backgroundColor:'#0a0a0f'}}>
      <div ref={mapRef} style={{width:'100%', height:`${mapHeight}px`}} />

      {/* LAYERS PANEL — always visible top left */}
      <div style={{position:'absolute', top:'12px', left:'12px', zIndex:1000}}>
        <div style={{
            backgroundColor: bg,
            border: `1px solid ${border}`,
            borderRadius:'10px', minWidth:'200px', maxWidth:'220px', overflow:'hidden',
            boxShadow:'0 8px 32px rgba(0,0,0,0.35)',
            maxHeight:'380px', overflowY:'auto',
          }}>
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
            ) : (
              activeTopicsOrdered.map(topic => {
                const signals = TOPIC_SIGNALS[topic] ?? [];
                const activeList = activeSignals[topic] ?? signals;
                const allOn = signals.every(s => activeList.includes(s));
                const isCollapsed = collapsedTopics[topic];
                return (
                  <div key={topic} style={{borderBottom:`1px solid ${border}`}}>
                    {/* Topic header */}
                    <div
                      style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'8px 12px', cursor:'pointer',
                      }}
                      onClick={() => setCollapsedTopics(p => ({...p, [topic]: !p[topic]}))}
                    >
                      <div style={{display:'flex', alignItems:'center', gap:'7px'}}>
                        <div style={{width:'8px', height:'8px', borderRadius:'50%', backgroundColor:c(topic), boxShadow:`0 0 5px ${c(topic)}`}} />
                        <span style={{fontSize:'10px', fontWeight:800, color:c(topic), letterSpacing:'0.07em'}}>{topic}</span>
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <button
                          onClick={e => { e.stopPropagation(); toggleAllSignals(topic); }}
                          style={{
                            fontSize:'9px', color: allOn ? c(topic) : textMuted,
                            background:'none', border:`1px solid ${allOn ? c(topic)+'44' : border}`,
                            borderRadius:'4px', padding:'2px 6px', cursor:'pointer',
                          }}
                        >
                          {allOn ? 'All on' : 'All off'}
                        </button>
                        <span style={{fontSize:'10px', color:textMuted}}>{isCollapsed ? '▶' : '▼'}</span>
                      </div>
                    </div>

                    {/* Signal checkboxes */}
                    {!isCollapsed && (
                      <div style={{paddingBottom:'6px'}}>
                        {signals.map(signal => {
                          const isOn = activeList.includes(signal);
                          const isLive = signal === 'Live News';
                          return (
                            <div
                              key={signal}
                              onClick={() => toggleSignal(topic, signal)}
                              style={{
                                display:'flex', alignItems:'center', gap:'8px',
                                padding:'5px 12px 5px 24px', cursor:'pointer',
                                opacity: isOn ? 1 : 0.35, transition:'all 0.15s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverBg)}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <div style={{
                                width:'12px', height:'12px', borderRadius:'3px', flexShrink:0,
                                border:`1.5px solid ${isOn ? c(topic) : 'rgba(128,128,128,0.3)'}`,
                                backgroundColor: isOn ? `${c(topic)}33` : 'transparent',
                                display:'flex', alignItems:'center', justifyContent:'center',
                              }}>
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
              })
            )}
          </div>
      </div>

      {/* TOP CENTER — time filter + mode toggle */}
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

      {/* BOTTOM LEFT — legend */}
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

      {/* Attribution */}
      <div style={{position:'absolute', bottom:'20px', right:'12px', zIndex:1000, fontSize:'9px', color:textMuted}}>
        © OpenStreetMap © CartoDB
      </div>

      {/* DRAG HANDLE to resize map */}
      <div
        onMouseDown={onDragStart}
        style={{position:'absolute', bottom:0, left:0, right:0, height:'10px', cursor:'ns-resize', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1001}}
      >
        <div style={{width:'40px', height:'3px', borderRadius:'2px', backgroundColor: isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.15)'}} />
      </div>

      {/* MODAL */}
      {modal && (
        <div
          style={{position:'fixed', inset:0, zIndex:2000, backgroundColor:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px'}}
          onClick={() => setModal(null)}
        >
          <div
            style={{backgroundColor:'var(--modal-bg)', border:`1px solid ${c(modal.topic)}33`, borderRadius:'14px', maxWidth:'420px', width:'100%', padding:'24px', boxShadow:`0 24px 80px rgba(0,0,0,0.4), 0 0 40px ${c(modal.topic)}22`, position:'relative'}}
            onClick={e => e.stopPropagation()}
          >
            {/* ✕ close */}
            <button onClick={() => setModal(null)} style={{position:'absolute', top:'14px', right:'14px', background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:'18px', lineHeight:1, padding:'2px 6px'}}>✕</button>

            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px', paddingRight:'24px'}}>
              <div style={{width:'8px', height:'8px', borderRadius:'50%', backgroundColor:c(modal.topic), boxShadow:`0 0 6px ${c(modal.topic)}`}} />
              <span style={{fontSize:'10px', fontWeight:700, color:c(modal.topic), letterSpacing:'0.1em'}}>{modal.topic}</span>
              {modal.signal && <span style={{fontSize:'10px', color:'var(--text-secondary)'}}>· {modal.signal}</span>}
              {modal.isLive && <span style={{fontSize:'10px', color:'var(--text-secondary)', marginLeft:'4px'}}>● LIVE NEWS</span>}
            </div>
            <div style={{fontSize:'15px', fontWeight:700, color:'var(--text-primary)', lineHeight:1.45, marginBottom:'6px'}}>
              {modal.title}
            </div>
            {modal.description && (
              <div style={{fontSize:'12px', color:c(modal.topic), marginBottom:'4px', fontWeight:500}}>
                {modal.description}
              </div>
            )}
            <div style={{fontSize:'11px', color:'var(--text-secondary)', marginBottom:'20px'}}>
              {modal.subtitle}
            </div>
            {modal.isLive ? (
              <a href={modal.link} target="_blank" rel="noopener noreferrer"
                style={{backgroundColor:c(modal.topic), color:'#fff', padding:'9px 18px', borderRadius:'8px', fontSize:'12px', fontWeight:700, textDecoration:'none', display:'inline-block'}}>
                Read article ↗
              </a>
            ) : (
              <a href={modal.link} target="_blank" rel="noopener noreferrer"
                style={{backgroundColor:'transparent', color:c(modal.topic), padding:'9px 18px', borderRadius:'8px', fontSize:'12px', fontWeight:600, textDecoration:'none', border:`1px solid ${c(modal.topic)}55`, display:'inline-block'}}>
                View profile ↗
              </a>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes mapPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}