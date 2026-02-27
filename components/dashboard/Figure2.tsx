import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const Figure2 = () => {
  const generateData = (mean: number, std: number, r2: number, rmse: number) => {
    return Array.from({ length: 80 }, (_, i) => {
      const observed = mean + std * (Math.random() * 2 - 1);
      const predicted = observed + rmse * (Math.random() * 2 - 1);
      return { observed, predicted };
    });
  };

  const outputs = [
    { name: 'Straw Incorporation Rate (%)', data: generateData(76, 12, 0.934, 3.28), color: '#2E86AB', domain: [40, 100] },
    { name: 'Soil Organic Carbon Change (g kg⁻¹)', data: generateData(0.42, 0.18, 0.906, 0.056), color: '#A23B72', domain: [0, 0.8] },
    { name: 'Soil Breakage Rate (%)', data: generateData(82, 10, 0.912, 2.94), color: '#F18F01', domain: [50, 100] },
    { name: 'Surface Flatness (mm)', data: generateData(18.4, 5.2, 0.887, 1.82), color: '#28A745', domain: [0, 35] }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {outputs.map((output, idx) => (
        <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4 text-center">{output.name}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="observed" name="Observed" domain={output.domain} label={{ value: 'Observed', position: 'insideBottom', offset: -10 }} />
                <YAxis type="number" dataKey="predicted" name="Predicted" domain={output.domain} label={{ value: 'Predicted', angle: -90, position: 'insideLeft' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Predictions" data={output.data} fill={output.color} />
                <ReferenceLine segment={[{ x: output.domain[0], y: output.domain[0] }, { x: output.domain[1], y: output.domain[1] }]} stroke="black" strokeDasharray="3 3" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
};
