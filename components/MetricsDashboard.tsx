
import React from 'react';
import { SimulationState, HistoricalDataPoint } from '../types';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine, BarChart, Bar } from 'recharts';
import { Activity, Zap, Leaf, Layers, Scale, Gauge, BarChart as BarIcon } from 'lucide-react';

interface Props {
  currentState: SimulationState;
  history: HistoricalDataPoint[];
}

const MetricsDashboard: React.FC<Props> = ({ currentState, history }) => {
  const { macro, tensor, sectionStats } = currentState;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-slate-50 p-4 rounded-xl border border-gray-200">
      
      {/* Column 1: Macroscopic State Vector (x_M) */}
      <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
            <Layers size={14} /> State Vector (x_M)
        </h3>
        <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-gray-600">θ (Moisture)</span>
                <span className="font-bold text-blue-700">{macro.theta.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
                <span className="text-gray-600">ρ_b (Density)</span>
                <span className="font-bold text-amber-700">{macro.rho_b.toFixed(2)} kg/m³</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <span className="text-gray-600">σ_s (Straw)</span>
                <span className="font-bold text-yellow-700">{macro.sigma_s.toFixed(2)} kg/m²</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-600">G_eff (Shear)</span>
                <span className="font-bold text-gray-700">{macro.G_eff.toFixed(1)} MPa</span>
            </div>
        </div>
        <div className="mt-4 text-[10px] text-gray-400">
            x_M(t) = [θ, ρ_b, σ_s, G_eff]ᵀ
        </div>
      </div>

      {/* Column 2: Output Tensor Visualization */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* y_physical */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <h4 className="text-xs font-bold text-green-700 uppercase mb-3 flex items-center gap-2">
                <Activity size={14} /> y_physical
            </h4>
            <div className="space-y-2 flex-1">
                <MetricRow label="η_b (Burial)" value={tensor.physical.eta_b} unit="%" color="text-green-600" />
                <MetricRow label="δ_s (Disturb)" value={tensor.physical.delta_s} unit="%" color="text-gray-600" />
                <MetricRow label="τ_max (Shear)" value={tensor.physical.tau_max} unit="kPa" color="text-red-600" />
                <MetricRow label="Compaction Index" value={tensor.physical.compaction} unit="%" color="text-blue-600" />
                <MetricRow label="Residue Interference" value={tensor.physical.residueInterference} unit="%" color="text-purple-600" />
            </div>
        </div>

        {/* y_energetic */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <h4 className="text-xs font-bold text-orange-700 uppercase mb-3 flex items-center gap-2">
                <Zap size={14} /> y_energetic
            </h4>
            <div className="space-y-2 flex-1">
                <MetricRow label="P_c (Power)" value={tensor.energetic.P_c} unit="W" color="text-orange-600" />
                <MetricRow label="E_spec" value={tensor.energetic.E_spec} unit="J/m³" color="text-gray-600" />
            </div>
        </div>

        {/* Vertical Distribution Chart (New) */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <h4 className="text-xs font-bold text-indigo-700 uppercase mb-2 flex items-center gap-2">
                <BarIcon size={14} /> Mixing Index
            </h4>
            <div className="flex-1 w-full h-24">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectionStats} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="id" type="category" width={10} tick={{fontSize: 8}} hide />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '10px'}} />
                        <Bar dataKey="strawCount" stackId="a" fill="#eab308" radius={[0, 4, 4, 0]} name="Straw" />
                        <Bar dataKey="soilCount" stackId="a" fill="#75513f" radius={[4, 0, 0, 4]} name="Soil" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="text-[9px] text-gray-400 text-center mt-1">S5 (Bottom) → S1 (Top)</div>
        </div>

        {/* Real-time Graph (Spanning columns) */}
        <div className="md:col-span-3 h-48 bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history.slice(-50)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 100]} tick={{fontSize: 10}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                    <ReferenceLine y={90} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "Target η_b", fill: "#22c55e", fontSize: 10 }} />
                    
                    <Line type="monotone" dataKey="incorporation" stroke="#16a34a" strokeWidth={2} dot={false} name="η_b (Burial)" />
                    <Line type="monotone" dataKey="disturbance" stroke="#f59e0b" strokeWidth={2} dot={false} name="δ_s (Disturb)" />
                    <Line type="monotone" dataKey="compaction" stroke="#2563eb" strokeWidth={2} dot={false} name="Compaction" />
                    {/* Scale Power to fit on 0-100 chart for trend visualization */}
                    <Line type="monotone" dataKey="power" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} name="P_c (Scaled)" />
                </LineChart>
            </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

const MetricRow = ({ label, value, unit, color }: { label: string, value: number, unit: string, color: string }) => (
    <div className="flex justify-between items-end border-b border-gray-50 pb-1 last:border-0">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="text-right">
            <span className={`text-lg font-bold ${color}`}>{value.toFixed(1)}</span>
            <span className="text-xs text-gray-400 ml-1">{unit}</span>
        </div>
    </div>
);

export default MetricsDashboard;
