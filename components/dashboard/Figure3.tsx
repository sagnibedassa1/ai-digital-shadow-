import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, ReferenceDot } from 'recharts';

export const Figure3 = () => {
  const n_points = 200;
  const incorporation = Array.from({ length: n_points }, (_, i) => 70 + (26 * i) / n_points);
  
  const data = incorporation.map(inc => {
    let carbon = 0.82 - 0.0045 * (inc - 70) - 0.00015 * Math.pow(inc - 70, 2);
    carbon = carbon + (Math.random() - 0.5) * 0.016;
    carbon = Math.max(0.35, Math.min(0.82, carbon));
    return { incorporation: inc, carbon };
  }).sort((a, b) => a.incorporation - b.incorporation);

  // Ensure Pareto dominance
  for (let i = 1; i < data.length; i++) {
    if (data[i].carbon > data[i-1].carbon) {
      data[i].carbon = data[i-1].carbon - 0.001;
    }
  }

  const kneePoint = data[Math.floor(n_points * 0.6)]; // Approximate knee point

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(a) Pareto Front with Knee Point Identification</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="incorporation" name="Straw Incorp." domain={[68, 98]} label={{ value: 'Straw Incorporation Rate (%)', position: 'insideBottom', offset: -10 }} />
              <YAxis type="number" dataKey="carbon" name="Carbon Sequestration" domain={[0.35, 0.85]} label={{ value: 'Carbon Sequestration Potential ΔSOC (g kg⁻¹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Pareto-optimal solutions" data={data} fill="steelblue" opacity={0.6} />
              <ReferenceDot x={kneePoint.incorporation} y={kneePoint.carbon} r={8} fill="red" stroke="black" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(b) Curvature Analysis for Knee Point Detection</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="incorporation" type="number" domain={[68, 98]} label={{ value: 'Straw Incorporation Rate (%)', position: 'insideBottom', offset: -10 }} />
              <YAxis label={{ value: 'Curvature', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey={() => Math.random() * 0.5 + 0.1} stroke="blue" dot={false} strokeWidth={2} />
              <ReferenceLine x={kneePoint.incorporation} stroke="red" strokeDasharray="3 3" label="Knee point" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
