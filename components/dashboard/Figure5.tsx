import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ErrorBar } from 'recharts';

export const Figure5 = () => {
  const metrics = [
    { name: 'Straw Incorp.', static: 78.4, operator: 74.6, ai: 85.8 },
    { name: 'Carbon Seq.', static: 0.44, operator: 0.38, ai: 0.56 },
    { name: 'Soil Breakage', static: 83.6, operator: 80.1, ai: 88.4 },
    { name: 'Surface Flatness', static: 17.8, operator: 19.6, ai: 14.2 },
    { name: 'Fuel Consump.', static: 18.4, operator: 19.8, ai: 16.2 },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-4 text-center">Engineering Performance Comparison: AI Digital Assistant vs. Baseline Approaches</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Value', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend verticalAlign="top" height={36}/>
            <Bar dataKey="static" fill="#2E86AB" name="Static Optimization" />
            <Bar dataKey="operator" fill="#A23B72" name="Operator Average" />
            <Bar dataKey="ai" fill="#F18F01" name="AI Digital Assistant" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
