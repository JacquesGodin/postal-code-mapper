'use client';

import { useEffect, useState } from 'react';
import L from 'leaflet';
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css';

// Fix broken markers by setting custom icon URLs
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function Home() {
  const [map, setMap] = useState(null);
  const [coordinatesList, setCoordinatesList] = useState([]); // To store postal codes and coordinates

  useEffect(() => {
    const leafletMap = L.map('map').setView([38.726684, -9.157748], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(leafletMap);

    setMap(leafletMap); // Store map instance
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const postalCodes = results.data.map((row) => row['PostalCode']);
          const coordinates = await getCoordinates(postalCodes);
          setCoordinatesList(coordinates); // Store for CSV download
          plotMarkers(coordinates);
        },
      });
    }
  };

  const getCoordinates = async (postalCodes) => {
    const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    const coordinates = [];
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY; // Fetch API key from env variable
  
    for (const code of postalCodes) {
      try {
        const response = await fetch(`${baseUrl}?address=${code},Portugal&key=${apiKey}`);
        const data = await response.json();
  
        if (data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          coordinates.push({ code, lat, lng });
        }
      } catch (error) {
        console.error(`Error fetching coordinates for ${code}:`, error);
      }
    }
  
    return coordinates;
  };
  

  const plotMarkers = (coordinates) => {
    if (!map) return;

    coordinates.forEach(({ code, lat, lng }) => {
      if (lat && lng) {
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`Postal Code: ${code}`);
      }
    });
  };

  const downloadCSV = () => {
    const csvData = [
      ['PostalCode', 'Coordinates'], // CSV Header
      ...coordinatesList.map(({ code, lat, lng }) => [code, `${lat}, ${lng}`]), // Data rows
    ];

    const csvContent = Papa.unparse(csvData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'converted_postal_codes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6">
      <h1 className="text-3xl font-bold mb-4">Postal Code Mapper</h1>
      <div className="flex items-center space-x-4 mb-4">
        <label
          htmlFor="csvFileInput"
          className="block text-sm font-medium text-gray-700"
        >
          Upload a CSV file:
        </label>
        <input
          id="csvFileInput"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={downloadCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium"
        >
          Download Converted List
        </button>
      </div>
      <div id="map" className="w-full max-w-4xl h-[500px] border rounded-md shadow-md"></div>
    </main>
  );
}
