'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function LeafletMap({ coordinatesList }) {
  useEffect(() => {
    const map = L.map('map').setView([38.726684, -9.157748], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    coordinatesList.forEach(({ code, lat, lng }) => {
      if (lat && lng) {
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`Postal Code: ${code}`);
      }
    });

    return () => {
      map.remove(); // Cleanup the map on unmount
    };
  }, [coordinatesList]);

  return <div id="map" className="w-full max-w-4xl h-[500px] border rounded-md shadow-md"></div>;
}
