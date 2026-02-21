import { useState } from 'react';
import Header from '@/components/Header';
import MapView from '@/components/MapView';
import ReportForm from '@/components/ReportForm';
import ProximitySettings from '@/components/ProximitySettings';
import ProximityAlertBanner from '@/components/ProximityAlertBanner';
import { ReportsProvider } from '@/context/ReportsContext';

const Index = () => {
  const [reportOpen, setReportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <ReportsProvider>
      <div className="h-screen w-screen relative overflow-hidden">
        <Header onOpenReport={() => setReportOpen(true)} onOpenSettings={() => setSettingsOpen(true)} />
        <div className="absolute top-[52px] left-0 right-0 bottom-0">
          <MapView />
        </div>
        <ProximityAlertBanner />
        <ReportForm open={reportOpen} onOpenChange={setReportOpen} />
        <ProximitySettings open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </ReportsProvider>
  );
};

export default Index;
