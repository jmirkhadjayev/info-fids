import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet with React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom plane icon for FlightRadar style
const planeIcon = L.divIcon({
  html: `<div style="transform: rotate(45deg);"><svg width="24" height="24" viewBox="0 0 24 24" fill="#ffde00" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"/></svg></div>`,
  className: 'custom-plane-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MapProps {
  center: [number, number];
  zoom: number;
  flights: any[];
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ center, zoom, flights }: MapProps) {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
      zoomControl={false}
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {/* Airport Marker */}
      <Marker position={center}>
        <Popup>
          <div className="text-black font-bold">Tashkent International Airport (TAS)</div>
        </Popup>
      </Marker>

      {/* Simulated Flight Markers around the airport */}
      {flights.slice(0, 10).map((flight, idx) => {
        // Just simulate some positions for visual effect since we don't have real GPS
        const lat = center[0] + (Math.random() - 0.5) * 0.1;
        const lng = center[1] + (Math.random() - 0.5) * 0.1;
        
        return (
          <Marker 
            key={`${flight.flight_number}-${idx}`} 
            position={[lat, lng]} 
            icon={planeIcon}
          >
            <Popup>
              <div className="text-black">
                <div className="font-bold">{flight.flight_number}</div>
                <div className="text-xs">{flight.airline_name}</div>
                <div className="text-xs text-blue-600 font-bold">{flight.status}</div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
