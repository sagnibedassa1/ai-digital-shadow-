
import React from 'react';
import { SimulationParams, ToolType, StrawRetentionModel, SoilType, StrawType, ColorMapMode, ParticleShape, ContactModel, MaterialProperties, SimulationEngine } from '../types';
import { Play, Pause, RotateCcw, Activity, Settings2, Database, BrainCircuit, Cpu } from 'lucide-react';

interface Props {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
}

const ControlPanel: React.FC<Props> = ({ params, setParams }) => {
  const handleChange = (key: keyof SimulationParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleSoilPropChange = (key: keyof MaterialProperties, value: number) => {
    setParams(prev => ({
        ...prev,
        soilProps: { ...prev.soilProps, [key]: value }
    }));
  };

  const handleStrawPropChange = (key: keyof MaterialProperties, value: number) => {
    setParams(prev => ({
        ...prev,
        strawProps: { ...prev.strawProps, [key]: value }
    }));
  };

  return (
    <div className="flex flex-col gap-6">
        {/* Simulation Control */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
             <div className="flex items-center justify-between mb-4">
                 <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Activity className="text-agri-600" size={20} /> Controls
                 </h2>
                 <div className="flex gap-2">
                     <button 
                        onClick={() => handleChange('isRunning', !params.isRunning)}
                        className={`p-2 rounded-lg transition-colors ${params.isRunning ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        title={params.isRunning ? "Pause" : "Run"}
                     >
                         {params.isRunning ? <Pause size={20} /> : <Play size={20} />}
                     </button>
                     <button 
                         onClick={() => {
                             handleChange('isRunning', false);
                         }}
                         className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                         title="Stop/Reset"
                     >
                         <RotateCcw size={20} />
                     </button>
                 </div>
             </div>

             {/* Engine Selector */}
             <div className="mb-4 bg-slate-100 p-1 rounded-lg flex">
                 <button 
                    onClick={() => handleChange('simulationEngine', 'DEM')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                        params.simulationEngine === 'DEM' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
                    }`}
                 >
                     <Cpu size={14} /> DEM (Physics)
                 </button>
                 <button 
                    onClick={() => handleChange('simulationEngine', 'AI_SURROGATE')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
                        params.simulationEngine === 'AI_SURROGATE' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'
                    }`}
                 >
                     <BrainCircuit size={14} /> AI Surrogate
                 </button>
             </div>

             <div className="space-y-4">
                 <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tool Type</label>
                     <select 
                        value={params.toolType}
                        onChange={(e) => handleChange('toolType', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     >
                         <option value={ToolType.ROTARY_TILLER}>Rotary Tiller</option>
                         <option value={ToolType.MOLDBOARD_PLOUGH}>Moldboard Plough</option>
                         <option value={ToolType.CHISEL_PLOUGH}>Chisel Plough</option>
                         <option value={ToolType.TRENCHING_DEVICE}>Trenching Device</option>
                         <option value={ToolType.CUSTOM}>Custom Import</option>
                     </select>
                 </div>

                 {/* Kinematics */}
                 <div className="space-y-3">
                     <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-1">Kinematics</h3>
                     
                     <div>
                         <div className="flex justify-between text-xs mb-1">
                             <span className="text-gray-600">Forward Speed (v)</span>
                             <span className="font-mono font-bold">{params.forwardSpeed} m/s</span>
                         </div>
                         <input 
                            type="range" min="0.5" max="3.0" step="0.1"
                            value={params.forwardSpeed}
                            onChange={(e) => handleChange('forwardSpeed', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                         />
                     </div>

                     <div>
                         <div className="flex justify-between text-xs mb-1">
                             <span className="text-gray-600">Rotary Speed (ω)</span>
                             <span className="font-mono font-bold">{params.rotarySpeed} rpm</span>
                         </div>
                         <input 
                            type="range" min="150" max="450" step="5"
                            value={params.rotarySpeed}
                            onChange={(e) => handleChange('rotarySpeed', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                         />
                     </div>

                     <div>
                         <div className="flex justify-between text-xs mb-1">
                             <span className="text-gray-600">Tillage Depth (d)</span>
                             <span className="font-mono font-bold">{params.depth} cm</span>
                         </div>
                         <input 
                            type="range" min="5" max="25" step="0.5"
                            value={params.depth}
                            onChange={(e) => handleChange('depth', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                         />
                     </div>

                     {params.toolType === ToolType.ROTARY_TILLER && (
                         <>
                             <div>
                                 <div className="flex justify-between text-xs mb-1">
                                     <span className="text-gray-600">Rotor Radius</span>
                                     <span className="font-mono font-bold">{params.rotorRadius} mm</span>
                                 </div>
                                 <input 
                                    type="range" min="150" max="350" step="5"
                                    value={params.rotorRadius}
                                    onChange={(e) => handleChange('rotorRadius', parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                 />
                             </div>
                             <div>
                                 <div className="flex justify-between text-xs mb-1">
                                     <span className="text-gray-600">Blade Count</span>
                                     <span className="font-mono font-bold">{params.bladeCount}</span>
                                 </div>
                                 <input 
                                    type="range" min="2" max="12" step="1"
                                    value={params.bladeCount}
                                    onChange={(e) => handleChange('bladeCount', parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                 />
                             </div>
                             <div>
                                 <div className="flex justify-between text-xs mb-1">
                                     <span className="text-gray-600">Blade Angle</span>
                                     <span className="font-mono font-bold">{params.bladeAngle}°</span>
                                 </div>
                                 <input 
                                    type="range" min="15" max="75" step="5"
                                    value={params.bladeAngle}
                                    onChange={(e) => handleChange('bladeAngle', parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                 />
                             </div>
                             <div>
                                 <div className="flex justify-between text-xs mb-1">
                                     <span className="text-gray-600">Shield Clearance</span>
                                     <span className="font-mono font-bold">{params.bladeClearance} mm</span>
                                 </div>
                                 <input 
                                    type="range" min="20" max="150" step="5"
                                    value={params.bladeClearance}
                                    onChange={(e) => handleChange('bladeClearance', parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                 />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Blade Shape</label>
                                 <select 
                                    value={params.bladeShape}
                                    onChange={(e) => handleChange('bladeShape', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                 >
                                     <option value="C-shaped">C-shaped (Standard)</option>
                                     <option value="L-shaped">L-shaped (Heavy Residue)</option>
                                     <option value="J-shaped">J-shaped (Deep Tillage)</option>
                                 </select>
                             </div>
                         </>
                     )}
                 </div>

                 {/* Environment */}
                 <div className="space-y-3 pt-2">
                     <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-1">Environment</h3>
                     
                     <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Soil Type</label>
                         <select 
                            value={params.soilType}
                            onChange={(e) => handleChange('soilType', e.target.value as SoilType)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                         >
                             <option value="Clay Loam">Clay Loam</option>
                             <option value="Sandy Loam">Sandy Loam</option>
                             <option value="Silt">Silt</option>
                             <option value="Heavy Clay">Heavy Clay</option>
                         </select>
                     </div>
                     
                     <div>
                        <div className="flex justify-between text-xs mb-1">
                             <span className="text-gray-600">Moisture Content</span>
                             <span className="font-mono font-bold">{params.soilMoisture}%</span>
                         </div>
                         <input 
                            type="range" min="10" max="40" step="1"
                            value={params.soilMoisture}
                            onChange={(e) => handleChange('soilMoisture', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                         />
                     </div>
                     
                     <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Crop Residue</label>
                         <select 
                            value={params.strawType}
                            onChange={(e) => handleChange('strawType', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                         >
                             <option value="Rice">Rice Straw</option>
                             <option value="Wheat">Wheat Straw</option>
                             <option value="Corn">Corn Stalk</option>
                         </select>
                     </div>

                     <div>
                        <div className="flex justify-between text-xs mb-1">
                             <span className="text-gray-600">Straw Density (Bulk)</span>
                             <span className="font-mono font-bold">{params.strawDensity} kg/m³</span>
                         </div>
                         <input 
                            type="range" min="100" max="400" step="10"
                            value={params.strawDensity}
                            onChange={(e) => handleChange('strawDensity', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                         />
                     </div>
                 </div>

                 {/* Material Properties */}
                 <div className="space-y-4 pt-2">
                     <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-1 flex items-center gap-2">
                        <Settings2 size={12} /> Material Properties
                     </h3>
                     
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                         <label className="text-xs font-bold text-gray-800 mb-2 block flex items-center gap-1">
                             <Database size={10} /> Soil Physics
                         </label>
                         <div className="space-y-2">
                             <div>
                                 <label className="flex justify-between text-[10px] text-gray-500 uppercase mb-1">
                                     <span>Density (kg/m³)</span>
                                     <span className="font-mono">{params.soilProps.density}</span>
                                 </label>
                                 <input 
                                    type="number" step="10"
                                    value={params.soilProps.density}
                                    onChange={(e) => handleSoilPropChange('density', parseFloat(e.target.value))}
                                    className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                                 />
                             </div>
                             <div>
                                 <label className="flex justify-between text-[10px] text-gray-500 uppercase mb-1">
                                     <span>Shear Modulus (MPa)</span>
                                     <span className="font-mono">{(params.soilProps.shearModulus / 1e6).toFixed(1)}</span>
                                 </label>
                                 <input 
                                    type="number" step="0.5"
                                    value={params.soilProps.shearModulus / 1e6}
                                    onChange={(e) => handleSoilPropChange('shearModulus', parseFloat(e.target.value) * 1e6)}
                                    className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                                 />
                             </div>
                             <div>
                                 <label className="flex justify-between text-[10px] text-gray-500 uppercase mb-1">
                                     <span>Poisson Ratio</span>
                                     <span className="font-mono">{params.soilProps.poissonRatio}</span>
                                 </label>
                                 <input 
                                    type="number" step="0.01" max="0.5"
                                    value={params.soilProps.poissonRatio}
                                    onChange={(e) => handleSoilPropChange('poissonRatio', parseFloat(e.target.value))}
                                    className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                                 />
                             </div>
                         </div>
                     </div>

                     <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                         <label className="text-xs font-bold text-yellow-800 mb-2 block flex items-center gap-1">
                             <Database size={10} /> Straw Physics
                         </label>
                         <div className="space-y-2">
                             <div>
                                 <label className="flex justify-between text-[10px] text-gray-500 uppercase mb-1">
                                     <span>Density (kg/m³)</span>
                                     <span className="font-mono">{params.strawProps.density}</span>
                                 </label>
                                 <input 
                                    type="number" step="10"
                                    value={params.strawProps.density}
                                    onChange={(e) => handleStrawPropChange('density', parseFloat(e.target.value))}
                                    className="w-full text-xs border border-yellow-200 rounded px-2 py-1 bg-white"
                                 />
                             </div>
                             <div>
                                 <label className="flex justify-between text-[10px] text-gray-500 uppercase mb-1">
                                     <span>Shear Modulus (MPa)</span>
                                     <span className="font-mono">{(params.strawProps.shearModulus / 1e6).toFixed(1)}</span>
                                 </label>
                                 <input 
                                    type="number" step="0.5"
                                    value={params.strawProps.shearModulus / 1e6}
                                    onChange={(e) => handleStrawPropChange('shearModulus', parseFloat(e.target.value) * 1e6)}
                                    className="w-full text-xs border border-yellow-200 rounded px-2 py-1 bg-white"
                                 />
                             </div>
                         </div>
                     </div>
                 </div>
                 
                 {/* Visuals */}
                 <div className="space-y-3 pt-2">
                     <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-1">Visualization</h3>
                     
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Color Map</label>
                        <select 
                            value={params.colorMap} 
                            onChange={(e) => handleChange('colorMap', e.target.value as any)} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="VolumeFraction">Volume Fraction (Engineering)</option>
                            <option value="Velocity">Velocity Vector</option>
                            <option value="Force">Force Network (kN)</option>
                            <option value="Type">Material Phase</option>
                            <option value="Strain">Plastic Strain</option>
                            <option value="Compaction">Compaction Index</option>
                            <option value="BurialDepth">Straw Z-Depth</option>
                        </select>
                     </div>
                 </div>

                 {/* Advanced Toggle */}
                 <div className="pt-2 border-t border-gray-100">
                     <div className="flex items-center gap-2 mb-2">
                         <input 
                            type="checkbox" 
                            id="cloudCompute"
                            checked={params.useCloudCompute}
                            onChange={(e) => handleChange('useCloudCompute', e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                         />
                         <label htmlFor="cloudCompute" className="text-xs font-medium text-gray-700">Use Cloud Compute (Offload)</label>
                     </div>
                     <div className="flex items-center gap-2">
                         <input 
                            type="checkbox" 
                            id="breakage"
                            checked={params.enableBreakage}
                            onChange={(e) => handleChange('enableBreakage', e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                         />
                         <label htmlFor="breakage" className="text-xs font-medium text-gray-700">Enable Particle Breakage</label>
                     </div>
                 </div>

             </div>
        </div>
    </div>
  );
};

export default ControlPanel;
