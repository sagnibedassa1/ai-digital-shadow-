import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, ReferenceLine, ErrorBar } from 'recharts';

export const Figure6 = () => {
  const n_samples = 30;
  const samples = Array.from({ length: n_samples }, (_, i) => i + 1);
  const predictionData = samples.map(i => {
    const observed = 75 + 15 * Math.random() + 5 * Math.sin(i * 4 * Math.PI / n_samples);
    const predicted = observed + (Math.random() - 0.5) * 5;
    const ci_lower = predicted - (Math.random() * 4 + 2);
    const ci_upper = predicted + (Math.random() * 4 + 2);
    const high_uncertainty = (ci_upper - ci_lower) > 9;
    return { i, observed, predicted, ci_lower, ci_upper, high_uncertainty };
  });

  const calibrationData = Array.from({ length: 20 }, (_, i) => {
    const nominal = 50 + (49 * i) / 19;
    const actual = Math.max(45, Math.min(98, nominal * 0.95 + (Math.random() - 0.5) * 4));
    return { nominal, actual };
  });

  const rmseData = [
    { name: 'All Data', rmse: 4.12 },
    { name: 'Flag High Uncertainty Removed', rmse: 3.24 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(a) 95% Prediction Intervals with Uncertainty Flagging</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="i" name="Sample" domain={[0, n_samples + 1]} label={{ value: 'Test Sample Index', position: 'insideBottom', offset: -10 }} />
              <YAxis type="number" dataKey="predicted" name="Predicted" domain={[50, 105]} label={{ value: 'Straw Incorporation Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Predicted mean" data={predictionData} fill="blue" />
              <Scatter name="Observed" data={predictionData.map(d => ({ i: d.i, predicted: d.observed }))} fill="green" shape="square" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(b) Uncertainty Calibration Curve</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calibrationData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nominal" type="number" domain={[50, 100]} label={{ value: 'Nominal Confidence Level (%)', position: 'insideBottom', offset: -10 }} />
              <YAxis dataKey="actual" type="number" domain={[50, 100]} label={{ value: 'Actual Coverage Probability (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="actual" stroke="blue" name="DNO model" dot={{ r: 3 }} strokeWidth={2} />
              <ReferenceLine segment={[{ x: 50, y: 50 }, { x: 100, y: 100 }]} stroke="black" strokeDasharray="3 3" label="Perfect calibration" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(c) RMSE Reduction with Uncertainty Flagging</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rmseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} label={{ value: 'RMSE (Straw Incorporation %)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="rmse" fill="steelblue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
