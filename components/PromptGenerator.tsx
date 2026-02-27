
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Wand2, Search, Cpu, Sprout } from 'lucide-react';
import { SimulationParams, ToolType, SoilType } from '../types';

interface Props {
  onGenerate: (params: Partial<SimulationParams>) => void;
}

const PromptGenerator: React.FC<Props> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = [
    "Rotary tillage in wet clay loam at 15cm depth for rice straw",
    "Deep moldboard ploughing in sandy soil to bury heavy residue",
    "High-speed shallow incorporation optimized for fuel efficiency",
    "Energy saving mode for trenching in dry silt"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError(null);
    setIsGenerating(true);

    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simple mock parsing based on keywords
        const lowerPrompt = prompt.toLowerCase();
        
        let toolType = ToolType.ROTARY_TILLER;
        if (lowerPrompt.includes('moldboard')) toolType = ToolType.MOLDBOARD_PLOUGH;
        if (lowerPrompt.includes('chisel')) toolType = ToolType.CHISEL_PLOUGH;
        if (lowerPrompt.includes('trench')) toolType = ToolType.TRENCHING_DEVICE;

        let soilType: SoilType = 'Clay Loam';
        if (lowerPrompt.includes('sandy')) soilType = 'Sandy Loam';
        if (lowerPrompt.includes('silt')) soilType = 'Silt';
        if (lowerPrompt.includes('heavy')) soilType = 'Heavy Clay';

        let depth = 15;
        if (lowerPrompt.includes('deep')) depth = 25;
        if (lowerPrompt.includes('shallow')) depth = 10;

        let forwardSpeed = 1.38;
        if (lowerPrompt.includes('fast') || lowerPrompt.includes('high-speed')) forwardSpeed = 2.5;
        if (lowerPrompt.includes('slow')) forwardSpeed = 0.8;

        let rotarySpeed = 255;
        if (lowerPrompt.includes('efficiency') || lowerPrompt.includes('saving')) rotarySpeed = 180;
        if (lowerPrompt.includes('quality') || lowerPrompt.includes('incorporation')) rotarySpeed = 350;

        const generatedParams = {
            toolType,
            soilType,
            depth,
            forwardSpeed,
            rotarySpeed,
            soilMoisture: lowerPrompt.includes('wet') ? 35 : lowerPrompt.includes('dry') ? 15 : 20,
            strawDensity: lowerPrompt.includes('heavy') ? 400 : 240
        };
        
        // Pass params up to App
        onGenerate({
            ...generatedParams,
            isRunning: true // Auto-start
        });

    } catch (err: any) {
        console.error("Failed to generate params", err);
        setError(err.message || "Could not generate simulation. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Hero Section */}
      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} /> AI-Powered DEM Physics
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
          Generate realistic <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">tillage simulations</span> in seconds.
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Describe your field conditions and goals (e.g., 'Optimize for efficiency'). Our AI configures the physics engine, material properties, and kinematics instantly.
        </p>
      </div>

      {/* Input Area */}
      <div className="w-full relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
        <div className="relative bg-white rounded-2xl shadow-xl p-2 flex flex-col md:flex-row gap-2 items-center">
            <div className="flex-1 w-full md:w-auto">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your scenario, e.g., 'Rotary tillage in wet clay loam at 15cm depth...'"
                    className="w-full p-4 text-lg text-slate-800 placeholder:text-slate-300 bg-transparent border-none focus:ring-0 resize-none h-20 md:h-16 flex items-center pt-4"
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleGenerate();
                        }
                    }}
                />
            </div>
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={`
                    h-14 px-8 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 whitespace-nowrap
                    ${isGenerating || !prompt.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'}
                `}
            >
                {isGenerating ? (
                    <><Wand2 className="animate-spin" /> Generating...</>
                ) : (
                    <><Sparkles size={20} /> Generate Simulation</>
                )}
            </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm max-w-2xl text-center">
          <p className="font-semibold">Error generating simulation</p>
          <p>{error}</p>
        </div>
      )}

      {/* Suggestions */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {suggestions.map((s, i) => (
            <button 
                key={i}
                onClick={() => handleSuggestionClick(s)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors shadow-sm"
            >
                {s}
            </button>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <Cpu size={20} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Physics-Informed</h3>
            <p className="text-sm text-slate-500">
                Calculates interaction forces using Hertz-Mindlin & JKR Cohesion models calibrated for agriculture.
            </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                <Sprout size={20} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Straw & Soil</h3>
            <p className="text-sm text-slate-500">
                Simulates multi-sphere clumps for soil aggregates and bonded particle chains for flexible straw.
            </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                <Search size={20} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">RSM Optimization</h3>
            <p className="text-sm text-slate-500">
                AI finds optimal tillage parameters to maximize burial rate while minimizing power consumption.
            </p>
        </div>
      </div>

    </div>
  );
};

export default PromptGenerator;
