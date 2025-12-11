import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoData } from '../types';
import greenPinIcon from '../assets/green-pin.svg';

// Custom Green Pin Icon with Label
const createCustomIcon = (label: string) => {
  return L.divIcon({
    className: 'custom-pin-icon',
    html: `
      <div style="position: relative; width: 48px; height: 40px;">
        <img src="${greenPinIcon}" style="width: 100%; height: 100%; display: block;" />
        <span style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold; font-size: 14px; line-height: 1;">${label}</span>
      </div>
    `,
    iconSize: [48, 40],
    iconAnchor: [24, 40],
    popupAnchor: [0, -40]
  });
};

interface MapProps {
  geoData: GeoData | null;
  label?: string;
}

// Component to handle map movement when coordinates change
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 });
  }, [center, map]);
  return null;
};

export const Map: React.FC<MapProps> = ({ geoData, label = '★' }) => {
  if (!geoData) return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">Loading Map...</div>;

  const [lat, lng] = geoData.loc.split(',').map(Number);
  const position: [number, number] = [lat, lng];

  return (
    <div className="w-full h-full relative z-0">
       <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false} // We can hide default zoom control for cleaner look or keep it
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Using Carto Light for that clean "Lamar" look
        />
        <Marker position={position} icon={createCustomIcon(label)}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-lamar-green">{geoData.city}</h3>
              <p>{geoData.org}</p>
              <p className="text-xs text-gray-500">{geoData.ip}</p>
            </div>
          </Popup>
        </Marker>
        <MapController center={position} />
      </MapContainer>
    </div>
  );
};