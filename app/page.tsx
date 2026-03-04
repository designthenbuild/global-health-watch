import TopBar from './components/TopBar';
import MapView from './components/MapView';
import BottomPanels from './components/BottomPanels';
import CardGrid from './components/CardGrid';

export default function Home() {
  return (
    <main>
      <TopBar />
      <MapView />
      <BottomPanels />
      <CardGrid />
    </main>
  );
}