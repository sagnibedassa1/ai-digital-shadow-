import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

export const Figure8 = () => {
  const n_scenarios = 100;
  const depthData = Array.from({ length: 15 }, (_, i) => ({ bin: 12 + i * 0.5, count: Math.random() * 20 }));
  const speedData = Array.from({ length: 15 }, (_, i) => ({ bin: 2.5 + i * 0.1, count: Math.random() * 20 }));
  const rpmData = Array.from({ length: 15 }, (_, i) => ({ bin: 240 + i * 5, count: Math.random() * 20 }));

  const scatterData = Array.from({ length: n_scenarios }, () => ({
    depth: 15.2 + (Math.random() - 0.5) * 2.4,
    speed: 3.14 + (Math.random() - 0.5) * 0.5,
    rpm: 284 + (Math.random() - 0.5) * 30,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(a) Optimal Tillage Depth Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={depthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bin" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="steelblue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(b) Optimal Forward Speed Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={speedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bin" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="lightcoral" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(c) Optimal Rotary Speed Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rpmData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bin" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="lightgreen" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(d) Parameter Interaction: Depth vs. Speed</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="depth" name="Depth" domain={[12, 19]} label={{ value: 'Tillage Depth (cm)', position: 'insideBottom', offset: -10 }} />
              <YAxis type="number" dataKey="speed" name="Speed" domain={[2.5, 3.8]} label={{ value: 'Forward Speed (km/h)', angle: -90, position: 'insideLeft' }} />
              <ZAxis type="number" dataKey="rpm" range={[50, 400]} name="RPM" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Parameters" data={scatterData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
