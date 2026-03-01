'use client';

import { useCallback, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'WeirHereStaffing/1.0 (map location picker)';

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const params = new URLSearchParams({
    format: 'json',
    lat: String(lat),
    lon: String(lon),
    zoom: '18',
    addressdetails: '1',
  });
  const res = await fetch(`${NOMINATIM_REVERSE}?${params.toString()}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) return '';
  const data = await res.json();
  return data.display_name ?? '';
}

function MapClickHandler({
  onSelect,
  setLoading,
}: {
  onSelect: (address: string) => void;
  setLoading: (v: boolean) => void;
}) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setLoading(true);
      try {
        const address = await reverseGeocode(lat, lng);
        if (address) onSelect(address);
      } finally {
        setLoading(false);
      }
    },
  });
  return null;
}

const DEFAULT_CENTER: [number, number] = [18.0, -77.0]; // Jamaica
const DEFAULT_ZOOM = 8;

export interface LocationMapPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (address: string) => void;
}

export default function LocationMapPicker({ open, onClose, onSelect }: LocationMapPickerProps) {
  const [loading, setLoading] = useState(false);

  const handleSelect = useCallback(
    (address: string) => {
      onSelect(address);
      onClose();
    },
    [onSelect, onClose],
  );

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={{
          background: 'white',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: 24,
          width: '100%',
          maxWidth: 800,
          height: 520,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Pick location on map"
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            Pick a location on the map
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#666' }}>
            Click anywhere on the map to set the job location. The address will be filled automatically.
          </p>
        </div>
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              <span>Getting address…</span>
            </div>
          )}
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onSelect={handleSelect} setLoading={setLoading} />
          </MapContainer>
        </div>
        <div style={{ padding: 12, borderTop: '1px solid #eee', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              fontSize: 14,
              cursor: 'pointer',
              background: '#f5f5f5',
              border: '1px solid #ccc',
              borderRadius: 4,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
