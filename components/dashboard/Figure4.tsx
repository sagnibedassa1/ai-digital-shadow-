import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ErrorBar } from 'recharts';

export const Figure4 = () => {
  const data = [
    { name: 'Straw Incorp. (η)', 'Tillage Depth': 0.48, 'Forward Speed': 0.35, 'Rotary Speed': 0.17, 'Soil Moisture': 0.28, 'Straw Density': 0.22 },
    { name: 'Carbon Sequest. (ΔSOC)', 'Tillage Depth': 0.62, 'Forward Speed': 0.18, 'Rotary Speed': 0.20, 'Soil Moisture': 0.24, 'Straw Density': 0.16 },
    { name: 'Energy Consumption', 'Tillage Depth': 0.44, 'Forward Speed': 0.38, 'Rotary Speed': 0.18, 'Soil Moisture': 0.08, 'Straw Density': 0.04 },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-4 text-center">Parameter Sensitivity by Output</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Sensitivity Coefficient', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend verticalAlign="top" height={36}/>
            <Bar dataKey="Tillage Depth" fill="#2E86AB" />
            <Bar dataKey="Forward Speed" fill="#A23B72" />
            <Bar dataKey="Rotary Speed" fill="#F18F01" />
            <Bar dataKey="Soil Moisture" fill="#28A745" />
            <Bar dataKey="Straw Density" fill="#DC143C" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
