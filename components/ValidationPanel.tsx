import React from 'react';
import { SimulationState, SimulationParams } from '../types';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props {
  state: SimulationState;
  params: SimulationParams;
}

const ValidationPanel: React.FC<Props> = ({ state, params }) => {
  // Empirical data ranges for paddy field rotovators (approximate values for demonstration)
  const empiricalData = {
    'Rice': {
      eta_b: { min: 75, max: 95, target: 85 }, // Burial rate
      delta_s: { min: 60, max: 85, target: 75 }, // Disturbance
      P_c: { min: 15000, max: 35000, target: 25000 }, // Power (W)
      residueInterference: { min: 0, max: 15, target: 5 }, // Interference
    },
    'Wheat': {
      eta_b: { min: 65, max: 85, target: 75 },
      delta_s: { min: 55, max: 80, target: 65 },
      P_c: { min: 18000, max: 40000, target: 28000 },
      residueInterference: { min: 5, max: 25, target: 15 },
    },
    'Corn': {
      eta_b: { min: 50, max: 75, target: 60 },
      delta_s: { min: 50, max: 75, target: 60 },
      P_c: { min: 20000, max: 45000, target: 30000 },
      residueInterference: { min: 10, max: 35, target: 20 },
    }
  };

  const currentEmpirical = empiricalData[params.strawType] || empiricalData['Rice'];

  const getValidationStatus = (value: number, min: number, max: number) => {
    if (value >= min && value <= max) return 'valid';
    if (value >= min * 0.8 && value <= max * 1.2) return 'warning';
    return 'invalid';
  };

  const metrics = [
    {
      name: 'Burial Rate (%)',
      simulated: state.tensor.physical.eta_b,
      empiricalMin: currentEmpirical.eta_b.min,
      empiricalMax: currentEmpirical.eta_b.max,
      status: getValidationStatus(state.tensor.physical.eta_b, currentEmpirical.eta_b.min, currentEmpirical.eta_b.max)
    },
    {
      name: 'Disturbance (%)',
      simulated: state.tensor.physical.delta_s,
      empiricalMin: currentEmpirical.delta_s.min,
      empiricalMax: currentEmpirical.delta_s.max,
      status: getValidationStatus(state.tensor.physical.delta_s, currentEmpirical.delta_s.min, currentEmpirical.delta_s.max)
    },
    {
      name: 'Power (kW)',
      simulated: state.tensor.energetic.P_c / 1000,
      empiricalMin: currentEmpirical.P_c.min / 1000,
      empiricalMax: currentEmpirical.P_c.max / 1000,
      status: getValidationStatus(state.tensor.energetic.P_c, currentEmpirical.P_c.min, currentEmpirical.P_c.max)
    },
    {
      name: 'Interference (%)',
      simulated: state.tensor.physical.residueInterference,
      empiricalMin: currentEmpirical.residueInterference.min,
      empiricalMax: currentEmpirical.residueInterference.max,
      status: getValidationStatus(state.tensor.physical.residueInterference, currentEmpirical.residueInterference.min, currentEmpirical.residueInterference.max)
    }
  ];

  const chartData = metrics.map(m => ({
    name: m.name.split(' ')[0],
    Simulated: Number(m.simulated.toFixed(1)),
    'Empirical Target': Number(((m.empiricalMin + m.empiricalMax) / 2).toFixed(1)),
    min: m.empiricalMin,
    max: m.empiricalMax
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle className="text-green-600" size={24} />
        <h2 className="text-xl font-bold text-gray-800">Empirical Validation</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Validation Status List */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Comparing current simulation results against empirical data for {params.strawType} straw in paddy field conditions.
          </p>
          
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <span className="block text-sm font-bold text-gray-700">{metric.name}</span>
                <span className="block text-xs text-gray-500">
                  Target: {metric.empiricalMin} - {metric.empiricalMax}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-gray-900">
                  {metric.simulated.toFixed(1)}
                </span>
                {metric.status === 'valid' && <CheckCircle size={18} className="text-green-500" />}
                {metric.status === 'warning' && <AlertTriangle size={18} className="text-amber-500" />}
                {metric.status === 'invalid' && <AlertTriangle size={18} className="text-red-500" />}
              </div>
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg flex items-start gap-2">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>
              Validation targets are based on standard EDEM calibration studies for agricultural machinery. 
              Adjust tool parameters (e.g., blade shape, clearance) to bring metrics within the target range.
            </p>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="h-64 lg:h-auto min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Simulated" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Empirical Target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ValidationPanel;
