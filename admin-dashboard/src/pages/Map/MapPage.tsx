import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup } from 'react-leaflet';
import {
  THODDOO_CENTER,
  THODDOO_BOUNDARY,
  THODDOO_GUESTHOUSES,
  THODDOO_BEACHES,
  THODDOO_KEY_LOCATIONS,
  THODDOO_VENUES,
} from '@shared/constants/thoddoo-locations';

const C = {
  guesthouse: '#FF7A59',
  beach:      '#1CC7C1',
  key:        '#0E7490',
  venue:      '#7C3AED',
  boundary:   '#1CC7C1',
};

const LAYERS = [
  { id: 'guesthouses', label: 'Guesthouses', color: C.guesthouse, count: THODDOO_GUESTHOUSES.length },
  { id: 'beaches',     label: 'Beaches',     color: C.beach,      count: THODDOO_BEACHES.length },
  { id: 'locations',   label: 'Key Places',  color: C.key,        count: THODDOO_KEY_LOCATIONS.length },
  { id: 'venues',      label: 'Venues',      color: C.venue,      count: THODDOO_VENUES.length },
] as const;

type LayerId = typeof LAYERS[number]['id'];

export default function MapPage() {
  const [visible, setVisible] = useState<Record<LayerId, boolean>>({
    guesthouses: true,
    beaches: true,
    locations: true,
    venues: true,
  });

  const toggle = (id: LayerId) =>
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));

  const boundary = THODDOO_BOUNDARY.map(
    (p) => [p.latitude, p.longitude] as [number, number]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 28, gap: 20, boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Island Map</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
            Thoddoo · North Ari Atoll · 4.1603°N 72.9949°E
          </p>
        </div>

        {/* Layer toggles */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { label: 'Guesthouses', val: THODDOO_GUESTHOUSES.length, color: C.guesthouse },
          { label: 'Beaches',     val: THODDOO_BEACHES.length,     color: C.beach },
          { label: 'Key Places',  val: THODDOO_KEY_LOCATIONS.length, color: C.key },
          { label: 'Venues',      val: THODDOO_VENUES.length,      color: C.venue },
          { label: 'Island size', val: '~1km²',                     color: '#64748b' },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: 12, padding: '10px 16px',
            borderLeft: `3px solid ${s.color}`,
            boxShadow: '0 1px 6px rgba(0,0,0,0.05)', flex: 1,
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{
        flex: 1, borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(14,116,144,0.12)',
        border: '1px solid rgba(28,199,193,0.15)',
        minHeight: 400,
      }}>
        <MapContainer
          center={[THODDOO_CENTER.latitude, THODDOO_CENTER.longitude]}
          zoom={16}
          minZoom={14}
          maxZoom={19}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          {/* OpenStreetMap base — completely free, no API key */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
            maxZoom={19}
          />

          {/* Island boundary polygon */}
          <Polygon
            positions={boundary}
            pathOptions={{
              color: C.boundary,
              fillColor: C.boundary,
              fillOpacity: 0.06,
              weight: 2,
              dashArray: '8 5',
            }}
          />

          {/* Guesthouses */}
          {visible.guesthouses && THODDOO_GUESTHOUSES.map((loc) => (
            <CircleMarker
              key={loc.id}
              center={[loc.coordinates.latitude, loc.coordinates.longitude]}
              radius={loc.isPopular ? 8 : 6}
              pathOptions={{
                color: '#fff',
                fillColor: C.guesthouse,
                fillOpacity: 0.95,
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ minWidth: 140 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                    🏠 {loc.nameEn}
                  </div>
                  {loc.nameDv && (
                    <div style={{ color: '#64748b', fontSize: 12 }}>{loc.nameDv}</div>
                  )}
                  {loc.isPopular && (
                    <span style={{
                      background: '#fff3cd', color: '#856404',
                      fontSize: 10, fontWeight: 700, padding: '1px 6px',
                      borderRadius: 8, marginTop: 4, display: 'inline-block',
                    }}>★ Popular</span>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Beaches */}
          {visible.beaches && THODDOO_BEACHES.map((loc) => (
            <CircleMarker
              key={loc.id}
              center={[loc.coordinates.latitude, loc.coordinates.longitude]}
              radius={10}
              pathOptions={{
                color: '#fff',
                fillColor: C.beach,
                fillOpacity: 0.95,
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ fontWeight: 700, fontSize: 14 }}>🏖 {loc.nameEn}</div>
                {loc.nameRu && <div style={{ color: '#64748b', fontSize: 12 }}>{loc.nameRu}</div>}
              </Popup>
            </CircleMarker>
          ))}

          {/* Key locations */}
          {visible.locations && THODDOO_KEY_LOCATIONS.map((loc) => (
            <CircleMarker
              key={loc.id}
              center={[loc.coordinates.latitude, loc.coordinates.longitude]}
              radius={8}
              pathOptions={{
                color: '#fff',
                fillColor: C.key,
                fillOpacity: 0.95,
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{loc.nameEn}</div>
                {loc.nameDv && <div style={{ color: '#64748b', fontSize: 12 }}>{loc.nameDv}</div>}
                <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2, textTransform: 'capitalize' }}>
                  {String(loc.category).replace(/_/g, ' ')}
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Venues */}
          {visible.venues && THODDOO_VENUES.map((loc) => (
            <CircleMarker
              key={loc.id}
              center={[loc.coordinates.latitude, loc.coordinates.longitude]}
              radius={9}
              pathOptions={{
                color: '#fff',
                fillColor: C.venue,
                fillOpacity: 0.95,
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ fontWeight: 700, fontSize: 14 }}>🎵 {loc.nameEn}</div>
                {loc.nameRu && <div style={{ color: '#64748b', fontSize: 12 }}>{loc.nameRu}</div>}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
