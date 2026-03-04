'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const DISCOVERIES_DOTS = [
  {
    id: 6,
    name: 'Psilocybin Trial Results',
    severity: 'BREAKTHROUGH',
    location: 'London, UK',
    keyStat: '67% remission rate in treatment-resistant depression',
    ageContext: 'Adults 25-65 with TRD',
    whyHere: 'Imperial College London Phase 3 trial',
    timeline: 'Results published today',
    source: 'The Lancet',
    color: '#00C9A7',
    coordinates: [-0.1276, 51.5074] as [number, number],
  },
  {
    id: 7,
    name: 'GLP-1 Cardiovascular Trial',
    severity: 'BREAKTHROUGH',
    location: 'Boston, USA',
    keyStat: '20% reduction in heart attack risk in non-diabetics',
    ageContext: 'Adults 45-75 with cardiovascular risk factors',
    whyHere: 'Harvard Medical School Phase 3 results',
    timeline: 'Published this week',
    source: 'NEJM',
    color: '#00C9A7',
    coordinates: [-71.0589, 42.3601] as [number, number],
  },
  {
    id: 8,
    name: 'mRNA Malaria Vaccine',
    severity: 'BREAKTHROUGH',
    location: 'Burkina Faso',
    keyStat: '77% efficacy in Phase 3 African trial',
    ageContext: 'Children 6 months to 5 years',
    whyHere: 'Phase 3 trial conducted across 4 African countries',
    timeline: 'Results published this week',
    source: 'The Lancet',
    color: '#00C9A7',
    coordinates: [-1.5616, 12.3642] as [number, number],
  },
  {
    id: 9,
    name: 'CAR-T Lymphoma Therapy',
    severity: 'BREAKTHROUGH',
    location: 'Houston, USA',
    keyStat: '54% complete remission in lymphoma patients',
    ageContext: 'Adults with relapsed/refractory lymphoma',
    whyHere: 'MD Anderson Cancer Center trial results',
    timeline: 'FDA approval granted this month',
    source: 'NEJM',
    color: '#00C9A7',
    coordinates: [-95.3698, 29.7604] as [number, number],
  },
  {
    id: 10,
    name: 'CRISPR Haemophilia B',
    severity: 'BREAKTHROUGH',
    location: 'London, UK',
    keyStat: 'Single infusion corrects haemophilia B — 89% success',
    ageContext: 'Males with severe haemophilia B',
    whyHere: 'UCL gene therapy trial — first in-vivo CRISPR approval',
    timeline: 'Published this week',
    source: 'NEJM',
    color: '#4CC9F0',
    coordinates: [-0.1276, 51.5074] as [number, number],
  },
];

interface MapViewProps {
  variant: string;
  region: string;
}

interface ThreatDot {
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
  coordinates: [number, number];
}

export default function MapView({ variant }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [threatDots, setThreatDots] = useState<ThreatDot[]>([]);

  useEffect(() => {
    fetch('/api/threats')
      .then(r => r.json())
      .then(data => {
        if (data.threats && data.threats.length > 0) {
          setThreatDots(data.threats);
        }
      })
      .catch(() => {});
  }, []);

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

    const addDots = () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const dots = variant === 'DISCOVERIES' ? DISCOVERIES_DOTS : threatDots;

      dots.forEach(dot => {
        const el = document.createElement('div');
        el.style.width = '14px';
        el.style.height = '14px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = dot.color;
        el.style.border = '2px solid rgba(255,255,255,0.4)';
        el.style.cursor = 'pointer';
        el.style.boxShadow = `0 0 8px ${dot.color}`;

        const popup = new mapboxgl.Popup({
          offset: 20,
          maxWidth: '320px',
        }).setHTML(`
          <div style="background:#1A2A3A;color:#fff;padding:16px;border-radius:8px;font-family:Inter,sans-serif;font-size:13px;line-height:1.5">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
              <strong style="font-size:15px;color:#fff">${dot.name}</strong>
              <span style="background:${dot.color};color:#000;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;margin-left:8px;white-space:nowrap">${dot.severity}</span>
            </div>
            <div style="color:#8892A4;margin-bottom:6px">📍 ${dot.location}</div>
            <div style="margin-bottom:6px"><strong style="color:#00C9A7">Key stat:</strong> ${dot.keyStat}</div>
            <div style="margin-bottom:6px"><strong style="color:#00C9A7">Who's affected:</strong> ${dot.ageContext}</div>
            <div style="margin-bottom:6px"><strong style="color:#00C9A7">Why here:</strong> ${dot.whyHere}</div>
            <div style="margin-bottom:6px;color:#8892A4;font-size:12px">${dot.timeline}</div>
            <div style="color:#8892A4;font-size:12px">Source: ${dot.source}</div>
          </div>
        `);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(dot.coordinates)
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    };

    if (map.current.isStyleLoaded()) {
      addDots();
    } else {
      map.current.on('load', addDots);
    }
  }, [variant, threatDots]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '8px 24px',
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {['24h', '7d', '30d', '1yr', 'All'].map(t => (
          <button key={t} style={{
            backgroundColor: t === '7d' ? 'var(--accent-teal)' : 'transparent',
            color: t === '7d' ? '#000' : 'var(--text-secondary)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px',
            padding: '4px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '600',
          }}>{t}</button>
        ))}
      </div>
      <div ref={mapContainer} style={{ width: '100%', height: '55vh' }} />
    </div>
  );
}