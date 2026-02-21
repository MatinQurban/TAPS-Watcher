import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { MapPin, Bell, Loader2 } from 'lucide-react';
import { useReports } from '@/context/ReportsContext';
import { toast } from 'sonner';
import { useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProximitySettings = ({ open, onOpenChange }: Props) => {
  const { proximitySettings, setProximitySettings } = useReports();
  const [locating, setLocating] = useState(false);

  const handleToggle = (enabled: boolean) => {
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setProximitySettings((prev) => ({ ...prev, enabled }));
  };

  const handleSetCarLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProximitySettings((prev) => ({
          ...prev,
          carLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        }));
        toast.success('Car location saved!');
        setLocating(false);
      },
      () => {
        toast.error('Could not get your location');
        setLocating(false);
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-card border-border w-[340px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Proximity Alerts
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Get notified when parking officers are spotted near your parked car.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Enable/disable */}
          <div className="flex items-center justify-between">
            <Label className="text-foreground">Enable alerts</Label>
            <Switch checked={proximitySettings.enabled} onCheckedChange={handleToggle} />
          </div>

          {/* Car location */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Your Car Location</Label>
            {proximitySettings.carLocation ? (
              <div className="text-xs text-foreground bg-secondary rounded-lg p-3">
                <p>📍 {proximitySettings.carLocation.lat.toFixed(5)}, {proximitySettings.carLocation.lng.toFixed(5)}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No car location set.</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetCarLocation}
              disabled={locating}
              className="w-full border-border text-muted-foreground hover:text-foreground"
            >
              {locating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 mr-2" />
              )}
              {proximitySettings.carLocation ? 'Update car location' : 'Set car location'}
            </Button>
          </div>

          {/* Radius */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground text-xs">Alert Radius</Label>
              <span className="text-xs text-primary font-semibold">
                {proximitySettings.radiusMiles} mi
              </span>
            </div>
            <Slider
              min={0.5}
              max={1}
              step={0.1}
              value={[proximitySettings.radiusMiles]}
              onValueChange={([val]) =>
                setProximitySettings((prev) => ({ ...prev, radiusMiles: val }))
              }
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0.5 mi</span>
              <span>1.0 mi</span>
            </div>
          </div>

          {/* Status */}
          <div className={`rounded-lg p-3 text-xs ${
            proximitySettings.enabled && proximitySettings.carLocation
              ? 'bg-success/10 text-success'
              : 'bg-secondary text-muted-foreground'
          }`}>
            {proximitySettings.enabled && proximitySettings.carLocation
              ? '✅ Alerts are active. You\'ll be notified when officers are nearby.'
              : '⚠️ Set your car location and enable alerts to get started.'}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProximitySettings;
