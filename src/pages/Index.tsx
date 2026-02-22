import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import MapView from '@/components/MapView';
import ReportForm from '@/components/ReportForm';
import ProximitySettings from '@/components/ProximitySettings';
import ProximityAlertBanner from '@/components/ProximityAlertBanner';
import NicknamePrompt from '@/components/NicknamePrompt';
import { ReportsProvider } from '@/context/ReportsContext';
import { IdentityProvider, useIdentity } from '@/context/IdentityContext';

const IndexContent = () => {
  const [reportOpen, setReportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [prefillLat, setPrefillLat] = useState<number | undefined>();
  const [prefillLng, setPrefillLng] = useState<number | undefined>();
  const { identity } = useIdentity();

  const openReport = useCallback((lat?: number, lng?: number) => {
    setPrefillLat(lat);
    setPrefillLng(lng);
    if (!identity) {
      setNicknameOpen(true);
    } else {
      setReportOpen(true);
    }
  }, [identity]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    openReport(lat, lng);
  }, [openReport]);

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <Header onOpenReport={() => openReport()} onOpenSettings={() => setSettingsOpen(true)} />
      <div className="absolute top-[52px] left-0 right-0 bottom-0">
        <MapView onMapClick={handleMapClick} />
      </div>
      <ProximityAlertBanner />
      <ReportForm open={reportOpen} onOpenChange={setReportOpen} prefillLat={prefillLat} prefillLng={prefillLng} />
      <ProximitySettings open={settingsOpen} onOpenChange={setSettingsOpen} />
      <NicknamePrompt open={nicknameOpen} onOpenChange={setNicknameOpen} onComplete={() => setReportOpen(true)} />
    </div>
  );
};

const Index = () => (
  <IdentityProvider>
    <ReportsProvider>
      <IndexContent />
    </ReportsProvider>
  </IdentityProvider>
);

export default Index;
