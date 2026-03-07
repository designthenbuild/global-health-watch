'use client';
import { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import MapView from './components/MapView';
import AIBrief from './components/AIBrief';
import BottomPanels from './components/BottomPanels';
import MyHealthModal from './components/MyHealthModal';

interface Threat {
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

interface PulseData {
  score: number;
  label: string;
  color: string;
  reason: string;
}

function calculatePulse(threats: Threat[]): PulseData {
  if (threats.length === 0) return { score: 2, label: 'PULSE 2', color: '#FFD166', reason: 'Baseline monitoring — no live data loaded.' };
  const highAlert = threats.filter(t => t.severity === 'HIGH ALERT').length;
  const elevated = threats.filter(t => t.severity === 'ELEVATED').length;
  const total = threats.length;
  let score = 1;
  score += Math.min(3, Math.floor(total / 3));
  score += highAlert * 1.5;
  score += elevated * 0.5;
  score = Math.min(10, Math.round(score));
  const color = score >= 8 ? '#E63946' : score >= 6 ? '#FFB347' : score >= 4 ? '#FFD166' : '#00C9A7';
  return { score, label: `PULSE ${score}`, color, reason: `${total} active signals · ${highAlert} high alert · ${elevated} elevated` };
}

export default function Home() {
  const [activeVariants, setActiveVariants] = useState<string[]>([]);
  const [region, setRegion] = useState('Global');
  const [showMyHealth, setShowMyHealth] = useState(false);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    fetch('/api/threats')
      .then(r => r.json())
      .then(data => { if (data.threats?.length > 0) setThreats(data.threats); })
      .catch(() => {});
  }, []);

  const toggleVariant = (v: string) => {
    setActiveVariants(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
    );
  };

  const handleShare = () => {
    const text = `🌐 Global Health Watch\nPulse Score: ${pulse.score}/10\n${pulse.reason}\nhttps://global-health-watch.vercel.app`;
    if (navigator.share) {
      navigator.share({ title: 'Global Health Watch', text, url: 'https://global-health-watch.vercel.app' });
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
    }
  };

  const pulse = calculatePulse(threats);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <TopBar
        activeVariants={activeVariants}
        toggleVariant={toggleVariant}
        region={region}
        setRegion={setRegion}
        onMyHealth={() => setShowMyHealth(true)}
        pulse={pulse}
        onShare={handleShare}
        isDark={isDark}
        onThemeChange={setIsDark}
      />
      <MapView activeVariants={activeVariants} region={region} threats={threats} isDark={isDark} />
      <AIBrief />
      <BottomPanels />
      {showMyHealth && <MyHealthModal onClose={() => setShowMyHealth(false)} />}
    </main>
  );
}
