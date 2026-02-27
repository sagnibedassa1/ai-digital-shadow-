
import React, { useState } from 'react';
import { ScenarioSuggestion, SimulationParams, ToolType } from '../types';
import { generateScenarios } from '../services/analyticsEngine';
import { Sparkles, Play, Plus, Trash2, Edit3, Settings, CloudLightning } from 'lucide-react';

interface Props {
  onRunScenario: (params: Partial<SimulationParams>) => void;
}

const ScenarioBuilder: React.FC<Props> = ({ onRunScenario }) => {
  const [activeMode, setActiveMode] = useState<'manual' | 'ai'>('manual');
  const [scenarios, setScenarios] = useState<ScenarioSuggestion[]>([]);
  const [objective, setObjective] = useState<'efficiency' | 'quality'>('efficiency');

  const handleAiGenerate = () => {
    const newScenarios = generateScenarios(objective);
    setScenarios(newScenarios);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Settings className="text-agri-600" /> Scenario Builder
            </h2>
            <p className="text-sm text-gray-500">Create, manage, and auto-generate DEM simulation batches.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveMode('manual')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${activeMode === 'manual' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            >
                Manual
            </button>
            <button 
                onClick={() => setActiveMode('ai')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${activeMode === 'ai' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow' : 'text-gray-500'}`}
            >
                <Sparkles size={12} /> AI Auto-Generate
            </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        
        {/* MANUAL MODE PLACEHOLDER */}
        {activeMode === 'manual' && (
             <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                <Edit3 size={32} className="mx-auto mb-2 opacity-50" />
                <p>Manual scenario creation coming soon. Use AI mode to get started.</p>
             </div>
        )}

        {/* AI GENERATION MODE */}
        {activeMode === 'ai' && (
            <>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                            <Sparkles size={18} /> Quick Generate
                        </h3>
                    </div>
                    
                    <div className="flex gap-3 mb-4">
                        <button 
                            onClick={() => setObjective('efficiency')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg border ${objective === 'efficiency' ? 'bg-white border-indigo-300 text-indigo-700 shadow-sm' : 'border-transparent text-indigo-400 hover:bg-indigo-100'}`}
                        >
                            Max Efficiency
                        </button>
                        <button 
                            onClick={() => setObjective('quality')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg border ${objective === 'quality' ? 'bg-white border-indigo-300 text-indigo-700 shadow-sm' : 'border-transparent text-indigo-400 hover:bg-indigo-100'}`}
                        >
                            Max Quality
                        </button>
                    </div>

                    <button 
                        onClick={handleAiGenerate}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Sparkles size={16} /> Generate Suggestions
                    </button>
                </div>

                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase">Available Scenarios</h3>
                    {scenarios.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                            No scenarios generated yet.
                        </div>
                    ) : (
                        scenarios.map((sc) => (
                            <div key={sc.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800">{sc.name}</h4>
                                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-mono">
                                        {sc.predictedOutcome}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-3">{sc.description}</p>
                                
                                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-4">
                                    <div className="bg-gray-50 p-1 rounded">v: {sc.params.forwardSpeed}</div>
                                    <div className="bg-gray-50 p-1 rounded">ω: {sc.params.rotarySpeed}</div>
                                    <div className="bg-gray-50 p-1 rounded">d: {sc.params.depth}</div>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onRunScenario(sc.params)}
                                        className="flex-1 py-1.5 bg-gray-900 text-white rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-black"
                                    >
                                        <Play size={12} /> Run Local
                                    </button>
                                    <button 
                                        onClick={() => onRunScenario({...sc.params, useCloudCompute: true})}
                                        className="flex-1 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-100"
                                    >
                                        <CloudLightning size={12} /> Run on Cloud
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </>
        )}

      </div>
    </div>
  );
};

export default ScenarioBuilder;
