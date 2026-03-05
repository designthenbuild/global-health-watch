'use client';

import { useState } from 'react';
import TopBar from './components/TopBar';
import MapView from './components/MapView';
import BottomPanels from './components/BottomPanels';
import CardGrid from './components/CardGrid';
import MyHealthModal from './components/MyHealthModal';

export default function Home() {
  const [variant, setVariant] = useState('THREATS');
  const [region, setRegion] = useState('Global');
  const [showMyHealth, setShowMyHealth] = useState(false);

  return (
    <main>
      <TopBar
        variant={variant}
        setVariant={setVariant}
        region={region}
        setRegion={setRegion}
        onMyHealth={() => setShowMyHealth(true)}
      />
      <MapView variant={variant} region={region} />
      <BottomPanels />
      <CardGrid />
      {showMyHealth && <MyHealthModal onClose={() => setShowMyHealth(false)} />}
    </main>
  );
}