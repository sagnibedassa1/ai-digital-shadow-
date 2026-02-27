
import React, { useState } from 'react';
import { ToolType, SimulationParams, SoilType } from '../types';
import { Play, Settings2, Info, ArrowRight, Disc, Layers, Pickaxe, Tractor } from 'lucide-react';

interface Props {
  onLaunch: (params: Partial<SimulationParams>) => void;
}

const TillageLab: React.FC<Props> = ({ onLaunch }) => {
  
  const implementsList = [
    {
      type: ToolType.ROTARY_TILLER,
      title: "Rotary Tiller",
      icon: <Disc className="text-orange-500" size={32} />,
      desc: "Active tillage implement using rotating blades to cut, lift, and mix soil. Highly effective for straw incorporation and seedbed preparation.",
      mech: "Chopping & Mixing",
      study: "Du et al., 2022",
      defaultDepth: 15,
      defaultSpeed: 1.38
    },
    {
      type: ToolType.MOLDBOARD_PLOUGH,
      title: "Moldboard Plough",
      icon: <Layers className="text-blue-500" size={32} />,
      desc: "Primary tillage tool that lifts, shears, and inverts the soil layer. Excellent for deep burial of heavy residue and weed control.",
      mech: "Inversion & Burial",
      study: "Makange et al., 2020",
      defaultDepth: 25,
      defaultSpeed: 1.0
    },
    {
      type: ToolType.TRENCHING_DEVICE,
      title: "Trenching Device",
      icon: <Settings2 className="text-purple-500" size={32} />,
      desc: "Specialized implement for creating channels. Used in rice straw burial to concentrate residue in deep zones.",
      mech: "Excavation & Raking",
      study: "Wang et al., 2023",
      defaultDepth: 20,
      defaultSpeed: 0.8
    },
    {
      type: ToolType.CHISEL_PLOUGH,
      title: "Chisel Plough",
      icon: <Pickaxe className="text-green-500" size={32} />,
      desc: "Deep tillage without inversion. Loosens hardpan layers while leaving residue on the surface for erosion control.",
      mech: "Loosening & fracture",
      study: "Zeng et al., 2020",
      defaultDepth: 30,
      defaultSpeed: 2.0
    }
  ];

  // Local state for configuration before launch
  const [configs, setConfigs] = useState<Record<string, { depth: number, speed: number }>>(() => {
    const initial: any = {};
    implementsList.forEach(imp => {
        initial[imp.type] = { depth: imp.defaultDepth, speed: imp.defaultSpeed };
    });
    return initial;
  });

  const handleConfigChange = (type: string, field: 'depth' | 'speed', value: number) => {
      setConfigs(prev => ({
          ...prev,
          [type]: { ...prev[type], [field]: value }
      }));
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-8">
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-100 p-2 rounded-lg">
                    <Tractor className="text-indigo-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Virtual Tillage Laboratory</h2>
            </div>
            <p className="text-gray-600 max-w-2xl">
                Select an agricultural implement to simulate straw-soil interactions. 
                Configure operating parameters based on validated DEM studies to analyze burial efficiency and soil disturbance.
            </p>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {implementsList.map((tool) => (
                <div key={tool.type} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                    <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                                    {tool.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-700 transition-colors">{tool.title}</h3>
                                    <span className="text-xs font-mono text-gray-400">{tool.study}</span>
                                </div>
                            </div>
                            <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                                {tool.mech}
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            {tool.desc}
                        </p>

                        {/* Quick Config */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 uppercase">Tillage Depth (cm)</label>
                                <span className="text-xs font-mono font-bold text-indigo-600">{configs[tool.type].depth} cm</span>
                            </div>
                            <input 
                                type="range" 
                                min="5" max="40" step="1"
                                value={configs[tool.type].depth}
                                onChange={(e) => handleConfigChange(tool.type, 'depth', parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            
                            <div className="flex justify-between items-center mt-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Forward Speed (m/s)</label>
                                <span className="text-xs font-mono font-bold text-indigo-600">{configs[tool.type].speed} m/s</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.5" max="4.0" step="0.1"
                                value={configs[tool.type].speed}
                                onChange={(e) => handleConfigChange(tool.type, 'speed', parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Info size={14} />
                            <span>Ready to simulate</span>
                        </div>
                        <button 
                            onClick={() => onLaunch({
                                toolType: tool.type,
                                depth: configs[tool.type].depth,
                                forwardSpeed: configs[tool.type].speed,
                                isRunning: true
                            })}
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-600 transition-colors shadow-sm"
                        >
                            Launch Simulation <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TillageLab;
