
import React, { useState } from 'react';
import { fetchAIRecommendations } from '../services/advisoryEngine';
import { FieldState, DecisionMatrixItem } from '../types';
import { BrainCircuit, Zap, Wifi, RotateCw, Check, Lightbulb, Target, Sparkles, AlertCircle } from 'lucide-react';

const AdvisoryPanel: React.FC = () => {
  const [mode, setMode] = useState<'manual' | 'sensor'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [goal, setGoal] = useState<'Efficiency' | 'Quality' | 'Balanced'>('Balanced');
  
  const [fieldState, setFieldState] = useState<FieldState>({
    soilMoisture: 20,
    residueLoad: 400,
    residueDensity: 250,
    soilType: 'Clay Loam'
  });

  const [recommendations, setRecommendations] = useState<DecisionMatrixItem[]>([]);
  const [selectedRec, setSelectedRec] = useState<DecisionMatrixItem | null>(null);

  // Mock fetching sensor data
  const syncSensors = () => {
    setIsLoading(true);
    setTimeout(() => {
        setFieldState({
            soilMoisture: 28.4,
            residueLoad: 520,
            residueDensity: 280,
            soilType: 'Clay Loam'
        });
        setMode('sensor');
        setIsLoading(false);
    }, 800);
  };

  const generateAdvice = async () => {
    setIsLoading(true);
    // Call the AI Service
    const matrix = await fetchAIRecommendations(fieldState, goal, { maxPower: 200 });
    setRecommendations(matrix);
    if (matrix.length > 0) setSelectedRec(matrix[0]);
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full font-sans text-gray-800">
      
      {/* 1. INPUT CONFIGURATION */}
      <div className="col-span-12 lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-6">
        <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Advisory Configuration</h2>
            <p className="text-sm text-gray-500">Define field conditions and goals for the AI advisor.</p>
        </div>

        {/* Source Selection */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
                onClick={() => setMode('manual')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'manual' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
            >
                Manual Input
            </button>
            <button 
                onClick={syncSensors}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'sensor' ? 'bg-white shadow text-blue-700' : 'text-gray-500'}`}
            >
               {isLoading && mode === 'sensor' ? <RotateCw className="animate-spin" size={14} /> : <Wifi size={14} />} 
               Live Sensors
            </button>
        </div>

        {/* Goal Selection */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Target size={14} /> Optimization Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
                {['Efficiency', 'Balanced', 'Quality'].map(g => (
                    <button
                        key={g}
                        onClick={() => setGoal(g as any)}
                        className={`py-2 px-1 text-xs font-bold rounded border transition-colors ${
                            goal === g 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                        {g}
                    </button>
                ))}
            </div>
            <p className="text-[10px] text-gray-400">
                {goal === 'Efficiency' && 'Prioritizes low power consumption and fuel savings.'}
                {goal === 'Quality' && 'Prioritizes maximum straw burial and soil mixing.'}
                {goal === 'Balanced' && 'Optimal trade-off between power and performance.'}
            </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Soil Moisture (%)</label>
                <input 
                    type="range" min="10" max="50" step="0.1"
                    disabled={mode === 'sensor'}
                    value={fieldState.soilMoisture}
                    onChange={(e) => setFieldState({...fieldState, soilMoisture: Number(e.target.value)})}
                    className="w-full accent-blue-600 mb-1"
                />
                <div className="flex justify-between font-mono text-sm">
                    <span className="text-gray-400">10%</span>
                    <span className="font-bold text-blue-700">{fieldState.soilMoisture.toFixed(1)}%</span>
                    <span className="text-gray-400">50%</span>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Residue Load (kg/mu)</label>
                <input 
                    type="range" min="200" max="800" step="10"
                    disabled={mode === 'sensor'}
                    value={fieldState.residueLoad}
                    onChange={(e) => setFieldState({...fieldState, residueLoad: Number(e.target.value)})}
                    className="w-full accent-yellow-600 mb-1"
                />
                <div className="flex justify-between font-mono text-sm">
                    <span className="text-gray-400">200</span>
                    <span className="font-bold text-yellow-700">{fieldState.residueLoad}</span>
                    <span className="text-gray-400">800</span>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Residue Density (kg/m³)</label>
                <input 
                    type="range" min="100" max="500" step="10"
                    disabled={mode === 'sensor'}
                    value={fieldState.residueDensity}
                    onChange={(e) => setFieldState({...fieldState, residueDensity: Number(e.target.value)})}
                    className="w-full accent-orange-600 mb-1"
                />
                <div className="flex justify-between font-mono text-sm">
                    <span className="text-gray-400">100</span>
                    <span className="font-bold text-orange-700">{fieldState.residueDensity}</span>
                    <span className="text-gray-400">500</span>
                </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800">
                <strong className="block mb-1">Data Source:</strong>
                {mode === 'manual' ? 'User defined parameters.' : 'Real-time MQTT stream (Topic: sensors/field_04).'}
            </div>
        </div>

        <button 
            onClick={generateAdvice}
            disabled={isLoading}
            className="mt-auto bg-agri-700 text-white py-3 rounded-lg font-semibold shadow hover:bg-agri-800 transition-colors flex items-center justify-center gap-2"
        >
            {isLoading ? <RotateCw className="animate-spin" /> : <Sparkles />}
            Generate AI Advice
        </button>
      </div>

      {/* 2. RESULTS & EXPLAINABILITY */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        {recommendations.length === 0 ? (
            <div className="h-full bg-white rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 p-8">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <BrainCircuit size={32} className="text-gray-300" />
                </div>
                <p>Configure field state and click "Generate AI Advice".</p>
                <p className="text-xs mt-2 text-gray-300">Requires a valid API Key for AI features.</p>
            </div>
        ) : (
            <>
                {/* Top Recommendation Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-indigo-200 font-bold text-xs uppercase tracking-wider mb-1">AI Recommended Strategy</h3>
                                <h2 className="text-2xl font-bold">{selectedRec?.technique}</h2>
                            </div>
                            <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1">
                                <Sparkles size={10} /> AI Confidence: High
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-6">
                            <div>
                                <div className="text-indigo-200 text-xs">Projected Burial Rate</div>
                                <div className="text-2xl font-bold">{selectedRec?.burialRate.toFixed(1)}%</div>
                            </div>
                            <div>
                                <div className="text-indigo-200 text-xs">Emission Reduction</div>
                                <div className="text-2xl font-bold text-green-300">
                                    {selectedRec?.ghgEmissions ? `-${(100 - selectedRec.ghgEmissions).toFixed(1)}%` : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <div className="text-indigo-200 text-xs">Power Usage</div>
                                <div className="text-2xl font-bold">{selectedRec?.powerConsumption.toFixed(0)} W</div>
                            </div>
                        </div>
                        
                        {/* Explanation Section */}
                        <div className="bg-indigo-700/50 p-3 rounded-lg border border-indigo-400/30 mb-4 text-xs">
                             <div className="font-bold flex items-center gap-2 mb-1 text-indigo-100">
                                <Lightbulb size={12} className="text-yellow-400" /> Reasoning
                             </div>
                             <p className="text-indigo-100 opacity-90 leading-relaxed">
                                {selectedRec?.explanation}
                             </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/10 mb-4">
                            <h4 className="text-xs font-bold uppercase mb-2 text-indigo-200">Optimal Control Vector (u*)</h4>
                            <div className="flex justify-between font-mono text-sm">
                                <div>v = <strong>{selectedRec?.controlVector.v.toFixed(2)}</strong> m/s</div>
                                <div>ω = <strong>{selectedRec?.controlVector.omega}</strong> rpm</div>
                                <div>d = <strong>{selectedRec?.controlVector.d.toFixed(1)}</strong> cm</div>
                            </div>
                        </div>

                        {selectedRec?.advisory && (
                            <div className="bg-emerald-700/50 p-4 rounded-lg border border-emerald-400/30 text-xs">
                                <div className="font-bold flex items-center gap-2 mb-3 text-emerald-100 uppercase tracking-wider">
                                    <Sparkles size={14} className="text-emerald-400" /> Residue Management Advisory
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <div className="text-emerald-200/70 mb-1">Optimal Decomposition Time</div>
                                        <div className="font-bold text-emerald-50 text-sm">{selectedRec.advisory.optimalDecompositionTime}</div>
                                    </div>
                                    <div>
                                        <div className="text-emerald-200/70 mb-1">Incorporation Method</div>
                                        <div className="font-bold text-emerald-50 text-sm">{selectedRec.advisory.incorporationMethod}</div>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-emerald-500/30">
                                    <div className="text-emerald-200/70 mb-1">Actionable Advice</div>
                                    <p className="text-emerald-50 leading-relaxed">{selectedRec.advisory.actionableAdvice}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Decorator */}
                    <div className="absolute -right-10 -bottom-10 opacity-10">
                        <Zap size={200} />
                    </div>
                </div>

                {/* Ranked List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700 text-sm flex justify-between items-center">
                        <span>Alternative Strategies</span>
                        <span className="text-[10px] text-gray-400 font-normal">Ranked by {goal} score</span>
                    </div>
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white text-xs text-gray-400 uppercase sticky top-0">
                                <tr>
                                    <th className="p-4 font-medium">Rank</th>
                                    <th className="p-4 font-medium">Strategy</th>
                                    <th className="p-4 font-medium text-right">Burial %</th>
                                    <th className="p-4 font-medium text-right">Power (W)</th>
                                    <th className="p-4 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recommendations.map((rec, idx) => (
                                    <tr 
                                        key={idx} 
                                        className={`hover:bg-indigo-50 transition-colors cursor-pointer ${selectedRec?.id === rec.id ? 'bg-indigo-50' : ''}`}
                                        onClick={() => setSelectedRec(rec)}
                                    >
                                        <td className="p-4 font-mono text-gray-500">#{idx+1}</td>
                                        <td className="p-4 font-medium text-gray-900">
                                            {rec.technique}
                                            {idx === 0 && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Rec</span>}
                                        </td>
                                        <td className="p-4 text-right font-bold text-green-600">{rec.burialRate.toFixed(1)}%</td>
                                        <td className="p-4 text-right font-mono text-gray-600">{rec.powerConsumption.toFixed(0)}</td>
                                        <td className="p-4 text-right">
                                            {selectedRec?.id === rec.id && <Check size={16} className="text-indigo-600 inline" />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        )}
      </div>

    </div>
  );
};

export default AdvisoryPanel;
