import React, { useState, useCallback, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Polygon,
  OverlayView,
} from '@react-google-maps/api';
import {
  THODDOO_CENTER,
  THODDOO_BOUNDARY,
  THODDOO_GUESTHOUSES,
  THODDOO_BEACHES,
  THODDOO_KEY_LOCATIONS,
  THODDOO_MOSQUES,
} from '@shared/constants/thoddoo-locations';
import type { ThoddooLocation } from '@shared/types';

// ── colour palette ────────────────────────────────────────────
const C = {
  guesthouse: '#FF7A59',
  beach:      '#1CC7C1',
  key:        '#0E7490',
  mosque:     '#16A34A',
  boundary:   '#1CC7C1',
};

// ── helpers ───────────────────────────────────────────────────
function svgDot(fill: string, size = 14) {
  const half = size / 2;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<circle cx="${half}" cy="${half}" r="${half - 1.5}" fill="${fill}" stroke="white" stroke-width="2"/>` +
      `</svg>`
    )}`,
    anchor: { x: half, y: half } as google.maps.Point,
    scaledSize: { width: size, height: size } as google.maps.Size,
  };
}

const EMOJI: Record<string, string> = {
  guesthouse:  '🏠',
  ferry_jetty: '⛴️',
  beach:       '🏖',
  school:      '🏫',
  health:      '🏥',
  government:  '🏛',
  mosque:      '🕌',
  other:       '📍',
};

const MAP_TYPES = [
  { id: 'roadmap',   label: 'Map' },
  { id: 'satellite', label: 'Satellite' },
  { id: 'hybrid',    label: 'Hybrid' },
] as const;

type MapTypeId = typeof MAP_TYPES[number]['id'];

const LAYERS = [
  { id: 'guesthouses', label: 'Guesthouses', color: C.guesthouse, count: THODDOO_GUESTHOUSES.length },
  { id: 'beaches',     label: 'Beaches',     color: C.beach,      count: THODDOO_BEACHES.length },
  { id: 'locations',   label: 'Key Places',  color: C.key,        count: THODDOO_KEY_LOCATIONS.length },
  { id: 'mosques',     label: 'Mosques',     color: C.mosque,     count: THODDOO_MOSQUES.length },
] as const;

type LayerId = typeof LAYERS[number]['id'];

// ── island boundary as google.maps.LatLngLiteral[] ────────────
const boundaryPath = THODDOO_BOUNDARY.map((p) => ({
  lat: p.latitude,
  lng: p.longitude,
}));

// ── component ─────────────────────────────────────────────────
export default function MapPage() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    id: 'google-map-script',
  });

  const [mapType, setMapType]         = useState<MapTypeId>('hybrid');
  const [selected, setSelected]       = useState<ThoddooLocation | null>(null);
  const [visible, setVisible]         = useState<Record<LayerId, boolean>>({
    guesthouses: true,
    beaches:     true,
    locations:   true,
    mosques:     true,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const onLoad = useCallback((map: google.maps.Map) => { mapRef.current = map; }, []);
  const toggle = (id: LayerId) => setVisible((p) => ({ ...p, [id]: !p[id] }));

  // ── guards ───────────────────────────────────────────────────
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div style={centerStyle}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
        <h2 style={{ margin: '0 0 8px', fontFamily: 'Sora, sans-serif', color: '#0f172a' }}>
          Google Maps API Key Required
        </h2>
        <p style={{ color: '#64748b', maxWidth: 460, textAlign: 'center', lineHeight: 1.6 }}>
          Add your key to <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
          admin-dashboard/.env.local</code>:
        </p>
        <code style={{
          display: 'block', marginTop: 12,
          background: '#0f172a', color: '#a3e635',
          padding: '12px 20px', borderRadius: 10, fontSize: 13,
        }}>
          VITE_GOOGLE_MAPS_KEY=AIza…
        </code>
        <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 16, textAlign: 'center' }}>
          Get a key at <strong>console.cloud.google.com</strong> → APIs &amp; Services → Enable "Maps JavaScript API"
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={centerStyle}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
        <p style={{ color: '#ef4444' }}>Failed to load Google Maps — check your API key.</p>
        <code style={{ fontSize: 12, color: '#94a3b8' }}>{loadError.message}</code>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={centerStyle}>
        <div style={spinnerStyle} />
        <p style={{ color: '#64748b', marginTop: 16 }}>Loading Google Maps…</p>
      </div>
    );
  }

  // ── render ───────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 28, gap: 20, boxSizing: 'border-box' }}>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Island Map</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
            Thoddoo · North Ari Atoll · 4.1603°N 72.9949°E &mdash; Council map merged with Google Maps
          </p>
        </div>

        {/* Map type toggle */}
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
          {MAP_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setMapType(t.id)}
              style={{
                padding: '6px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 13,
                background: mapType === t.id ? '#fff' : 'transparent',
                color: mapType === t.id ? '#0f172a' : '#94a3b8',
                boxShadow: mapType === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats + layer toggles */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Stats */}
        {[
          { label: 'Guesthouses', val: THODDOO_GUESTHOUSES.length, color: C.guesthouse },
          { label: 'Beaches',     val: THODDOO_BEACHES.length,     color: C.beach },
          { label: 'Key Places',  val: THODDOO_KEY_LOCATIONS.length, color: C.key },
          { label: 'Mosques',     val: THODDOO_MOSQUES.length,     color: C.mosque },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: 12, padding: '10px 16px',
            borderLeft: `3px solid ${s.color}`,
            boxShadow: '0 1px 6px rgba(0,0,0,0.05)', flex: 1, minWidth: 100,
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{s.label}</div>
          </div>
        ))}

        {/* Layer toggles */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => toggle(layer.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
                border: `2px solid ${layer.color}`,
                background: visible[layer.id] ? layer.color + '18' : '#fff',
                color: visible[layer.id] ? layer.color : '#94a3b8',
                fontWeight: 600, fontSize: 13,
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: visible[layer.id] ? layer.color : '#cbd5e1',
                flexShrink: 0,
              }} />
              {layer.label}
              <span style={{
                background: visible[layer.id] ? layer.color + '25' : '#f1f5f9',
                borderRadius: 10, padding: '1px 7px', fontSize: 11,
              }}>
                {layer.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{
        flex: 1, borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(14,116,144,0.12)',
        border: '1px solid rgba(28,199,193,0.15)',
        minHeight: 400,
      }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={{ lat: THODDOO_CENTER.latitude, lng: THODDOO_CENTER.longitude }}
          zoom={16}
          mapTypeId={mapType}
          onLoad={onLoad}
          options={{
            minZoom: 13,
            maxZoom: 20,
            mapTypeControl: false,
            fullscreenControl: true,
            streetViewControl: false,
            zoomControl: true,
          }}
        >
          {/* Island boundary outline */}
          <Polygon
            paths={boundaryPath}
            options={{
              strokeColor: C.boundary,
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: C.boundary,
              fillOpacity: 0.06,
              strokeDashArray: [8, 5],
            } as google.maps.PolygonOptions}
          />

          {/* Guesthouses */}
          {visible.guesthouses && THODDOO_GUESTHOUSES.map((loc) => (
            <Marker
              key={loc.id}
              position={{ lat: loc.coordinates.latitude, lng: loc.coordinates.longitude }}
              icon={svgDot(C.guesthouse, loc.isPopular ? 16 : 12)}
              title={loc.nameEn}
              onClick={() => setSelected(loc)}
            />
          ))}

          {/* Beaches */}
          {visible.beaches && THODDOO_BEACHES.map((loc) => (
            <Marker
              key={loc.id}
              position={{ lat: loc.coordinates.latitude, lng: loc.coordinates.longitude }}
              icon={svgDot(C.beach, 18)}
              title={loc.nameEn}
              onClick={() => setSelected(loc)}
            />
          ))}

          {/* Key locations */}
          {visible.locations && THODDOO_KEY_LOCATIONS.map((loc) => (
            <Marker
              key={loc.id}
              position={{ lat: loc.coordinates.latitude, lng: loc.coordinates.longitude }}
              icon={svgDot(C.key, loc.isPopular ? 16 : 13)}
              title={loc.nameEn}
              onClick={() => setSelected(loc)}
            />
          ))}

          {/* Mosques */}
          {visible.mosques && THODDOO_MOSQUES.map((loc) => (
            <Marker
              key={loc.id}
              position={{ lat: loc.coordinates.latitude, lng: loc.coordinates.longitude }}
              icon={svgDot(C.mosque, 15)}
              title={loc.nameEn}
              onClick={() => setSelected(loc)}
            />
          ))}

          {/* InfoWindow popup */}
          {selected && (
            <InfoWindow
              position={{ lat: selected.coordinates.latitude, lng: selected.coordinates.longitude }}
              onCloseClick={() => setSelected(null)}
            >
              <div style={{ minWidth: 160, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
                  {EMOJI[selected.category] ?? '📍'} {selected.nameEn}
                </div>
                {selected.nameDv && (
                  <div style={{ color: '#64748b', fontSize: 12, marginBottom: 2 }}>{selected.nameDv}</div>
                )}
                {selected.nameRu && (
                  <div style={{ color: '#94a3b8', fontSize: 11 }}>{selected.nameRu}</div>
                )}
                {selected.isPopular && (
                  <span style={{
                    background: '#fef9c3', color: '#854d0e',
                    fontSize: 10, fontWeight: 700, padding: '1px 7px',
                    borderRadius: 8, marginTop: 5, display: 'inline-block',
                  }}>★ Popular</span>
                )}
                <div style={{ color: '#cbd5e1', fontSize: 10, marginTop: 5, textTransform: 'capitalize' }}>
                  {String(selected.category).replace(/_/g, ' ')}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}

const centerStyle: React.CSSProperties = {
  height: '100vh', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', padding: 32,
};

const spinnerStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%',
  border: '3px solid #e2e8f0',
  borderTopColor: '#1CC7C1',
  animation: 'spin 0.7s linear infinite',
};
