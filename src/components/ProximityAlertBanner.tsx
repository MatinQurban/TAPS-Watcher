import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReports } from '@/context/ReportsContext';
import { formatDistanceToNow } from 'date-fns';

const ProximityAlertBanner = () => {
  const { proximityAlert, dismissAlert } = useReports();

  if (!proximityAlert) return null;

  return (
    <div className="absolute bottom-6 left-4 right-4 z-[1000] animate-pulse-alert">
      <div className="bg-destructive/95 backdrop-blur-md rounded-xl p-4 glow-red border border-destructive/50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-destructive-foreground shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-destructive-foreground">
              ⚠️ Parking Officer Near Your Car!
            </p>
            <p className="text-xs text-destructive-foreground/80 mt-1">
              Reported {formatDistanceToNow(proximityAlert.timestamp, { addSuffix: true })}
              {proximityAlert.direction && ` · Heading ${proximityAlert.direction}`}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive-foreground/80 hover:text-destructive-foreground h-7 w-7"
            onClick={dismissAlert}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProximityAlertBanner;
