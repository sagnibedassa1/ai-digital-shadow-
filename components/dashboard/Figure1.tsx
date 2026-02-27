import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, ZAxis, Cell, ComposedChart, Area, ErrorBar } from 'recharts';

export const Figure1 = () => {
  // Simulated training history
  const epochs = Array.from({ length: 200 }, (_, i) => i + 1);
  const data = epochs.map(epoch => {
    const train_loss = 0.18 * Math.exp(-0.022 * epoch) + 0.038 + 0.008 * Math.sin(epoch) * 0.02;
    const val_loss = 0.18 * Math.exp(-0.02 * epoch) + 0.052 + 0.01 * Math.cos(epoch) * 0.02;
    return { epoch, train_loss, val_loss };
  });

  const cvData = [
    { name: 'Fold 1', train: 0.938, val: 0.912 },
    { name: 'Fold 2', train: 0.932, val: 0.908 },
    { name: 'Fold 3', train: 0.941, val: 0.916 },
    { name: 'Fold 4', train: 0.929, val: 0.905 },
    { name: 'Fold 5', train: 0.935, val: 0.911 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(a) DNO Training Convergence</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="epoch" label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="train_loss" stroke="#3b82f6" name="Training loss" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="val_loss" stroke="#ef4444" name="Validation loss" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(b) 5-Fold Cross-Validation Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cvData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0.85, 1.0]} label={{ value: 'R² Score', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="train" fill="#4682B4" name="Training R²" />
              <Bar dataKey="val" fill="#F08080" name="Validation R²" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
