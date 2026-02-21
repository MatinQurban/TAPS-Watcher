import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ParkingReport, ProximitySettings, UserLocation } from '@/types/report';

interface ReportsContextType {
  reports: ParkingReport[];
  addReport: (report: Omit<ParkingReport, 'id' | 'expiresAt'>) => void;
  proximitySettings: ProximitySettings;
  setProximitySettings: React.Dispatch<React.SetStateAction<ProximitySettings>>;
  userLocation: UserLocation | null;
  setUserLocation: (loc: UserLocation | null) => void;
  proximityAlert: ParkingReport | null;
  dismissAlert: () => void;
}

const ReportsContext = createContext<ReportsContextType | null>(null);

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const REPORT_DURATION_MS = 90 * 60 * 1000; // 1.5 hours

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<ParkingReport[]>(() => {
    const saved = localStorage.getItem('parking-reports');
    if (saved) {
      const parsed: ParkingReport[] = JSON.parse(saved);
      return parsed.filter((r) => r.expiresAt > Date.now());
    }
    return [];
  });

  const [proximitySettings, setProximitySettings] = useState<ProximitySettings>(() => {
    const saved = localStorage.getItem('proximity-settings');
    return saved ? JSON.parse(saved) : { enabled: false, carLocation: null, radiusMiles: 0.5 };
  });

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [proximityAlert, setProximityAlert] = useState<ParkingReport | null>(null);
  const alertedReportsRef = useRef<Set<string>>(new Set());

  // Persist reports
  useEffect(() => {
    localStorage.setItem('parking-reports', JSON.stringify(reports));
  }, [reports]);

  // Persist proximity settings
  useEffect(() => {
    localStorage.setItem('proximity-settings', JSON.stringify(proximitySettings));
  }, [proximitySettings]);

  // Clean expired reports
  useEffect(() => {
    const interval = setInterval(() => {
      setReports((prev) => prev.filter((r) => r.expiresAt > Date.now()));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check proximity alerts
  useEffect(() => {
    if (!proximitySettings.enabled || !proximitySettings.carLocation) return;

    const { carLocation, radiusMiles } = proximitySettings;
    for (const report of reports) {
      if (alertedReportsRef.current.has(report.id)) continue;
      const dist = haversineDistance(carLocation.lat, carLocation.lng, report.lat, report.lng);
      if (dist <= radiusMiles) {
        setProximityAlert(report);
        alertedReportsRef.current.add(report.id);

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🚨 Parking Officer Nearby!', {
            body: `A parking officer was reported ${dist.toFixed(2)} miles from your car.`,
          });
        }
        break;
      }
    }
  }, [reports, proximitySettings]);

  const addReport = useCallback((report: Omit<ParkingReport, 'id' | 'expiresAt'>) => {
    const newReport: ParkingReport = {
      ...report,
      id: crypto.randomUUID(),
      expiresAt: Date.now() + REPORT_DURATION_MS,
    };
    setReports((prev) => [newReport, ...prev]);
  }, []);

  const dismissAlert = useCallback(() => setProximityAlert(null), []);

  return (
    <ReportsContext.Provider
      value={{
        reports,
        addReport,
        proximitySettings,
        setProximitySettings,
        userLocation,
        setUserLocation,
        proximityAlert,
        dismissAlert,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used within ReportsProvider');
  return ctx;
}
