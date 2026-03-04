'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const SAMPLE_DOTS = [
  {
    id: 1,
    name: 'Nipah Virus',
    severity: 'HIGH ALERT',
    location: 'Kerala, India',
    keyStat: '14 confirmed cases, 40-75% fatality rate',
    ageContext: 'Adults 20-50 most affected',
    whyHere: 'Fruit bat reservoir common in this region',
    timeline: '12 days active · First detected Feb 20 · Updated today',
    source: 'WHO Disease Outbreak News',
    color: '#FF4D6D',
    coordinates: [76.2711, 10.8505] as [number, number],
  },
  {
    id: 2,
    name: 'H5N1 Avian Flu',
    severity: 'ELEVATED',
    location: 'Texas, USA',
    keyStat: '3 human cases linked to cattle',
    ageContext: 'Farmworkers primary risk group',
    whyHere: 'Active cattle outbreak in dairy farms',
    timeline: '45 days active · First detected Jan 18 · Updated today',
    source: 'CDC Health Alerts',
    color: '#FFB347',
    coordinates: [-99.9018, 31.9686] as [number, number],
  },
  {
    id: 3,
    name: 'Dengue Fever',
    severity: 'ELEVATED',
    location: 'São Paulo, Brazil',
    keyStat: '480,000 cases this year — record high',
    ageContext: 'Children under 15 at highest risk',
    whyHere: 'Aedes mosquito thrives in urban heat',
    timeline: '60 days active · Seasonal surge · Updated today',
    source: 'PAHO',
    color: '#FFB347',
    coordinates: [-46.6333, -23.5505] as [number, number],
  },
  {
    id: 4,
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
    id: 5,
    name: 'MERS-CoV',
    severity: 'MONITORING',
    location: 'Riyadh, Saudi Arabia',
    keyStat: '2 new cases, 37% historical fatality rate',
    ageContext: 'Adults over 60 with comorbidities',
    whyHere: 'Camel exposure — endemic transmission route',
    timeline: '5 days active · First detected Mar 1 · Updated today',
    source: 'Saudi MOH',
    color: '#FFD166',
    coordinates: [46.7219, 24.6877] as [number, number],
  },
];

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20, 20],
      zoom: 1.8,
    });

    map.current.on('load', () => {
      SAMPLE_DOTS.forEach(dot => {
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
          className: 'ghw-popup',
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

        new mapboxgl.Marker({ element: el })
          .setLngLat(dot.coordinates)
          .setPopup(popup)
          .addTo(map.current!);
      });
    });
  }, []);

  return (
    <div style={{ width: '100%' }}>
      {/* Time filter bar */}
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

      {/* Map */}
      <div ref={mapContainer} style={{ width: '100%', height: '55vh' }} />
    </div>
  );
}