import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export const Figure7 = () => {
  const episodes = Array.from({ length: 500 }, (_, i) => i + 1);
  const data = episodes.map(episode => {
    const base_reward = -15 + 0.15 * episode + 5 * Math.exp(-episode/100) * Math.sin(episode/30);
    const noise = (Math.random() - 0.5) * 6 * (0.5 + 0.5 * Math.exp(-episode/100));
    const reward = base_reward + noise;
    
    const depth = 12 + 3 * (1 - Math.exp(-episode/150)) + 1.5 * (Math.random() - 0.5) * Math.exp(-episode/200);
    const speed = 2.5 + 0.8 * (1 - Math.exp(-episode/150)) + 0.3 * (Math.random() - 0.5) * Math.exp(-episode/200);
    const rpm = 250 + 35 * (1 - Math.exp(-episode/150)) + 15 * (Math.random() - 0.5) * Math.exp(-episode/200);

    const epsilon = 1.0 * Math.exp(-episode/80) + 0.05;
    const action_noise = 0.5 * Math.exp(-episode/100) + 0.05;

    const q_value = 20 + 30 * (1 - Math.exp(-episode/150)) + 10 * (Math.random() - 0.5) * Math.exp(-episode/200);

    return { episode, reward, depth, speed, rpm: rpm / 10, epsilon, action_noise, q_value };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(a) DRL Agent Learning Curve</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="episode" label={{ value: 'Training Episode', position: 'insideBottom', offset: -10 }} />
              <YAxis domain={[-25, 45]} label={{ value: 'Reward', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="reward" stroke="blue" name="Reward" dot={false} strokeWidth={1} opacity={0.5} />
              <ReferenceLine x={200} stroke="green" strokeDasharray="3 3" label="Initial stabilization" />
              <ReferenceLine x={380} stroke="purple" strokeDasharray="3 3" label="Full convergence" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(b) Evolution of Selected Actions</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="episode" label={{ value: 'Training Episode', position: 'insideBottom', offset: -10 }} />
              <YAxis label={{ value: 'Parameter Value', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="depth" stroke="blue" name="Tillage depth (cm)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="speed" stroke="red" name="Forward speed (km/h)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="rpm" stroke="green" name="Rotary speed (×10 rpm)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(c) Exploration-Exploitation Trade-off</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="episode" label={{ value: 'Training Episode', position: 'insideBottom', offset: -10 }} />
              <YAxis domain={[0, 1.1]} label={{ value: 'Exploration Parameter', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="epsilon" stroke="blue" name="Exploration rate (ε)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="action_noise" stroke="red" name="Action noise σ" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4 text-center">(d) Q-Value Estimation Convergence</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="episode" label={{ value: 'Training Episode', position: 'insideBottom', offset: -10 }} />
              <YAxis label={{ value: 'Q-value', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="q_value" stroke="purple" name="Estimated Q-value" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
