import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Send, Loader2 } from 'lucide-react';
import { useReports } from '@/context/ReportsContext';
import { useIdentity } from '@/context/IdentityContext';
import { VEHICLE_TYPES, DIRECTIONS } from '@/types/report';
import { toast } from 'sonner';

interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillLat?: number;
  prefillLng?: number;
}

const ReportForm = ({ open, onOpenChange, prefillLat, prefillLng }: ReportFormProps) => {
  const { addReport, userLocation } = useReports();
  const { identity, incrementReportCount } = useIdentity();
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [officerCount, setOfficerCount] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [direction, setDirection] = useState('');
  const [details, setDetails] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (open) {
      if (prefillLat !== undefined && prefillLng !== undefined) {
        setLat(prefillLat.toFixed(6));
        setLng(prefillLng.toFixed(6));
      } else if (userLocation) {
        setLat(userLocation.lat.toFixed(6));
        setLng(userLocation.lng.toFixed(6));
      }
    }
  }, [open, userLocation, prefillLat, prefillLng]);

  const handleUseMyLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        toast.error('Could not get your location');
        setLocating(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error('Please provide a valid location');
      return;
    }

    addReport({
      lat: latNum,
      lng: lngNum,
      timestamp: Date.now(),
      officerCount: officerCount ? parseInt(officerCount) : undefined,
      vehicleType: vehicleType || undefined,
      direction: direction || undefined,
      details: details || undefined,
      reportedBy: identity?.nickname ?? 'anonymous',
    });

    incrementReportCount();
    toast.success('Report submitted! Thank you for helping the community.');
    onOpenChange(false);
    setOfficerCount('');
    setVehicleType('');
    setDirection('');
    setDetails('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-card border-border rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-foreground flex items-center gap-2">
            <span className="text-xl">🚨</span> Report Parking Officer
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Help others avoid tickets. Your report will be visible for ~1.5 hours.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location */}
          <div className="space-y-2">
            <Label className="text-foreground">Location *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Latitude"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
              <Input
                placeholder="Longitude"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseMyLocation}
              disabled={locating}
              className="w-full border-border text-muted-foreground hover:text-foreground"
            >
              {locating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 mr-2" />
              )}
              Use my current location
            </Button>
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Officer Count</Label>
              <Input
                type="number"
                min="1"
                max="20"
                placeholder="e.g. 2"
                value={officerCount}
                onChange={(e) => setOfficerCount(e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {VEHICLE_TYPES.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Direction of Travel</Label>
            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {DIRECTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Additional Details</Label>
            <Textarea
              placeholder="e.g. Chalking tires on Main St near the coffee shop"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              className="bg-secondary border-border text-foreground resize-none"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Report
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ReportForm;
