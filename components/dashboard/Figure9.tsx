import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export const Figure9 = () => {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const accuracyData = days.map(day => {
    const accuracy = 70 + 25 * (1 - Math.exp(-day/10)) + (Math.random() - 0.5) * 6;
    return { day, accuracy: Math.max(0, Math.min(100, accuracy)) };
  });

  const satisfactionData = [
    { name: 'Very Satisfied', count: 45 },
    { name: 'Satisfied', count: 32 },
    { name: 'Neutral', count: 12 },
    { name: 'Unsatisfied', count: 8 },
    { name: 'Very Unsatisfied', count: 3 },
  ];

  const queryData = [
    { name: 'Parameter Recommendation', value: 280 },
    { name: 'Explanation Request', value: 195 },
    { name: 'What-if Analysis', value: 120 },
    { name: 'Performance Report', value: 85 },
    { name: 'Troubleshooting', value: 45 },
  ];
  const COLORS = ['#2E86AB', '#A23B72', '#F18F01', '#28A745', '#DC143C'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(a) Assistant Response Accuracy Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={accuracyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Days of Deployment', position: 'insideBottom', offset: -10 }} />
              <YAxis domain={[60, 100]} label={{ value: 'Response Accuracy (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="accuracy" stroke="blue" name="Daily accuracy" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(b) User Satisfaction Survey Results (n=100)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={satisfactionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{fontSize: 10}} />
              <YAxis label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#28A745" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(c) Distribution of User Queries</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={queryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {queryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
