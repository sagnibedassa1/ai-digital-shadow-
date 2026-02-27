
import React, { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, Settings, Sliders, Info, BarChart3, Eye, EyeOff } from 'lucide-react';
import { SimulationParams, ToolType } from '../types';

interface Props {
  showControls: boolean;
  onToggleControls: () => void;
  showMetrics: boolean;
  onToggleMetrics: () => void;
  params: SimulationParams;
  onParamChange: (updates: Partial<SimulationParams>) => void;
}

const SimulationHeader: React.FC<Props> = ({ 
    showControls, onToggleControls, 
    showMetrics, onToggleMetrics,
    params, onParamChange 
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-20 relative shadow-sm">
        {/* Left: Sidebar Toggle & Title */}
        <div className="flex items-center gap-4">
            <button 
                onClick={onToggleControls}
                className="p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                title={showControls ? "Hide Controls Sidebar" : "Show Controls Sidebar"}
                aria-label={showControls ? "Hide Controls" : "Show Controls"}
            >
                {showControls ? <PanelLeftClose size={22} /> : <PanelLeftOpen size={22} />}
            </button>
            
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex flex-col">
                <h1 className="text-gray-900 font-bold text-lg leading-tight flex items-center gap-2">
                    DEM Explore 
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold tracking-wide">
                        v3.4
                    </span>
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${params.isRunning ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`}></span>
                        {params.isRunning ? 'Running' : 'Paused'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>{params.toolType}</span>
                    <span className="text-gray-300">•</span>
                    <span>{params.soilType}</span>
                </div>
            </div>
        </div>

        {/* Right: Visualization Controls */}
        <div className="flex items-center gap-2">
             {/* Metrics Toggle */}
             <button
                onClick={onToggleMetrics}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showMetrics
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-500 hover:bg-gray-100 border border-transparent'
                }`}
                title={showMetrics ? "Hide Metrics Dashboard" : "Show Metrics Dashboard"}
             >
                <BarChart3 size={18} />
                <span className="hidden sm:inline">{showMetrics ? 'Hide Metrics' : 'Show Metrics'}</span>
             </button>
             
             <div className="h-6 w-px bg-gray-200 mx-1"></div>

             <div className="relative">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        showSettings 
                        ? 'bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20' 
                        : 'text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <Sliders size={18} />
                    <span className="hidden sm:inline">View Options</span>
                </button>

                {/* Dropdown Menu */}
                {showSettings && (
                    <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                            <h3 className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                                <Settings size={14} /> Visualization Settings
                            </h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Color Map (Field Attribute)</label>
                                <select 
                                    value={params.colorMap} 
                                    onChange={(e) => onParamChange({ colorMap: e.target.value as any })} 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Velocity">Velocity Vector</option>
                                    <option value="Force">Force Network (kN)</option>
                                    <option value="Type">Material Phase</option>
                                    <option value="Strain">Plastic Strain</option>
                                    <option value="Compaction">Compaction Index</option>
                                    <option value="BurialDepth">Straw Z-Depth</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Override Tool Model</label>
                                <select 
                                    value={params.toolType} 
                                    onChange={(e) => onParamChange({ toolType: e.target.value as any })} 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value={ToolType.ROTARY_TILLER}>Rotary Tiller</option>
                                    <option value={ToolType.MOLDBOARD_PLOUGH}>Moldboard Plough</option>
                                    <option value={ToolType.CHISEL_PLOUGH}>Chisel Plough</option>
                                    <option value={ToolType.TRENCHING_DEVICE}>Trenching Device</option>
                                    <option value={ToolType.CUSTOM}>Custom Import</option>
                                </select>
                            </div>
                            
                            <div className="pt-2">
                                <div className="flex items-start gap-2 p-2 bg-blue-50 text-blue-700 rounded text-xs leading-relaxed">
                                    <Info size={14} className="shrink-0 mt-0.5" />
                                    Changing visualization options does not restart the physics engine.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
             </div>
        </div>
    </div>
  );
};

export default SimulationHeader;
