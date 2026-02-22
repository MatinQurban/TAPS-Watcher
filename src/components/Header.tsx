import { Shield, Plus, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReports } from '@/context/ReportsContext';
import { useIdentity } from '@/context/IdentityContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onOpenReport: () => void;
  onOpenSettings: () => void;
}

const Header = ({ onOpenReport, onOpenSettings }: HeaderProps) => {
  const { reports, proximitySettings } = useReports();
  const { identity, trustLevel } = useIdentity();
  const activeCount = reports.filter((r) => r.expiresAt > Date.now()).length;

  return (
    <header className="absolute top-0 left-0 right-0 z-[1000] bg-card/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">ParkWatch</h1>
            <p className="text-[10px] text-muted-foreground">Crowdsourced Alerts</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {identity && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
              <User className="w-3.5 h-3.5" />
              <span>{identity.nickname}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                {trustLevel}
              </Badge>
            </div>
          )}
          {activeCount > 0 && (
            <Badge variant="secondary" className="bg-primary/15 text-primary text-xs">
              {activeCount} active
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="relative text-muted-foreground hover:text-foreground"
            onClick={onOpenSettings}
          >
            <Bell className="w-5 h-5" />
            {proximitySettings.enabled && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-success" />
            )}
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1 font-semibold"
            onClick={onOpenReport}
          >
            <Plus className="w-4 h-4" />
            Report
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
