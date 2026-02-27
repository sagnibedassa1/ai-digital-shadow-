import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BrainCircuit } from 'lucide-react';

// Mock data for DRL Learning Curve
const drlData = Array.from({ length: 50 }, (_, i) => {
  const episode = i * 10;
  // Reward increases and plateaus
  const reward = -100 + 150 * (1 - Math.exp(-i / 10)) + (Math.random() * 10 - 5);
  // Parameter convergence (e.g., rotary speed action)
  const actionOmega = 250 + 50 * Math.exp(-i / 15) * Math.sin(i) + (Math.random() * 5 - 2.5);
  // Parameter convergence (e.g., forward speed action)
  const actionV = 1.5 + 0.5 * Math.exp(-i / 10) * Math.cos(i) + (Math.random() * 0.1 - 0.05);

  return {
    episode,
    reward,
    actionOmega,
    actionV
  };
});

export const DRLLearningCurve: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <BrainCircuit className="text-indigo-600" size={24} />
        <h3 className="text-lg font-bold text-gray-800">DRL Agent Learning Curve</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reward Plot */}
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-gray-600 mb-4 text-center">Reward per Episode</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={drlData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="episode" 
                  tick={{fontSize: 12}} 
                  tickMargin={10}
                  label={{ value: 'Episodes', position: 'bottom', offset: 0, style: {fontSize: 12} }}
                />
                <YAxis 
                  tick={{fontSize: 12}} 
                  label={{ value: 'Cumulative Reward', angle: -90, position: 'insideLeft', style: {fontSize: 12} }}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="reward" 
                  stroke="#8b5cf6" 
                  strokeWidth={2} 
                  dot={false}
                  name="Reward" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Parameter Convergence Plot */}
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-gray-600 mb-4 text-center">Parameter Convergence</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={drlData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="episode" 
                  tick={{fontSize: 12}} 
                  tickMargin={10}
                  label={{ value: 'Episodes', position: 'bottom', offset: 0, style: {fontSize: 12} }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{fontSize: 12}} 
                  label={{ value: 'Rotary Speed (rpm)', angle: -90, position: 'insideLeft', style: {fontSize: 12} }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{fontSize: 12}} 
                  label={{ value: 'Forward Speed (m/s)', angle: 90, position: 'insideRight', style: {fontSize: 12} }}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}
                />
                <Legend verticalAlign="top" height={36} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="actionOmega" 
                  stroke="#ec4899" 
                  strokeWidth={2} 
                  dot={false}
                  name="Rotary Speed (rpm)" 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="actionV" 
                  stroke="#14b8a6" 
                  strokeWidth={2} 
                  dot={false}
                  name="Forward Speed (m/s)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <p><strong>Learning Dynamics:</strong> The agent explores the parameter space (rotary speed and forward speed) to maximize the reward function, which balances straw burial rate and power consumption. Notice how the reward plateaus as the parameters converge to optimal values.</p>
      </div>
    </div>
  );
};
