'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic'; // Dynamically load Leaflet
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet to ensure it's only used in the client
const LeafletMap = dynamic(() => import('../components/LeafletMap'), { ssr: false });

export default function Page() {
  const [coordinatesList, setCoordinatesList] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const postalCodes = results.data.map((row) => row['PostalCode']);
          const coordinates = await getCoordinates(postalCodes);
          setCoordinatesList(coordinates);
        },
      });
    }
  };

  const getCoordinates = async (postalCodes) => {
    const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

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

  const downloadCSV = () => {
    const csvData = [
      ['PostalCode', 'Coordinates'],
      ...coordinatesList.map(({ code, lat, lng }) => [code, `${lat}, ${lng}`]),
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
      <LeafletMap coordinatesList={coordinatesList} />
    </main>
  );
}
