
import React from 'react';
import { BookOpen, Cpu, Layers, Activity, Zap, TrendingUp, Anchor, FileText } from 'lucide-react';

const DocumentationPanel: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 h-full overflow-y-auto">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-8 sm:p-12">
        <div className="flex items-center gap-3 mb-4 text-agri-400 font-mono text-xs uppercase tracking-widest">
            <BookOpen size={16} />
            <span>Research Report</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
          Advancements in Discrete Element Method (DEM) for Agricultural Engineering
        </h1>
        <p className="text-slate-400 max-w-2xl text-lg">
          A comprehensive analysis of Altair® EDEM™ 2026 capabilities, tillage implement mechanics, and the physics-informed simulation framework.
        </p>
      </div>

      <div className="p-8 sm:p-12 space-y-12">

        {/* Section 1: EDEM 2026 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
            <Cpu className="text-indigo-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">1. Overview of Altair® EDEM™ 2026</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800">Key Enhancements</h3>
              <p className="text-gray-600 leading-relaxed">
                The 2026 release of Altair® EDEM™ represents a paradigm shift in granular material simulation. Key features include:
              </p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                    <span><strong>Advanced Particle Shapes:</strong> Native support for complex polyhedral and multi-sphere clump generation, allowing for realistic representation of irregular soil aggregates and straw residues.</span>
                </li>
                <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                    <span><strong>Python Coupling:</strong> Enhanced 'edempy' library integration allows for dynamic parameter control, custom physics models (like the Mohr-Coulomb implementation in this app), and automated post-processing pipelines.</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Zap size={18} className="text-yellow-600" /> GPU Acceleration
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Leveraging multi-GPU CUDA architecture, EDEM 2026 enables the simulation of millions of particles in clinically relevant timeframes. This allows for full-scale field simulations rather than just single-furrow tests.
              </p>
              <div className="flex justify-between items-center text-xs font-mono text-slate-500 border-t border-slate-200 pt-3">
                <span>CPU Solver</span>
                <span className="text-red-500">1x Speed</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-slate-500 mt-1">
                <span>Multi-GPU (2026)</span>
                <span className="text-green-600 font-bold">50x Speed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Tillage Implements */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
            <Layers className="text-agri-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">2. DEM in Tillage Implements</h2>
          </div>
          <p className="text-gray-600">
            DEM simulations provide particle-level resolution of soil-tool interactions, revealing mechanisms invisible to macroscopic observation.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImplementCard 
                title="Rotary Tiller" 
                desc="Simulates high-speed cutting and throwing. DEM reveals the 'chopping' mechanism where straw is forced into the soil matrix by the blade tip velocity vector."
                metrics={["Burial: High", "Disturbance: High", "Power: Med-High"]}
            />
            <ImplementCard 
                title="Moldboard Plough" 
                desc="Models complete soil inversion. Simulation domains typically show a continuous soil slab being lifted, sheared, and inverted, burying surface residue deep (20cm+)."
                metrics={["Burial: Very High", "Disturbance: High", "Power: High"]}
            />
            <ImplementCard 
                title="Chisel Plough" 
                desc="Focuses on deep loosening without inversion. DEM visualizes the 'critical depth' where soil failure transitions from brittle fracture to plastic flow."
                metrics={["Burial: Low", "Disturbance: Low", "Power: Med"]}
            />
            <ImplementCard 
                title="Trenching Device" 
                desc="Used for localized disturbance. DEM helps optimize the helix angle of the cutter to maximize soil evacuation speed while minimizing torque."
                metrics={["Burial: N/A", "Disturbance: Localized", "Power: Low"]}
            />
          </div>
        </section>

        {/* Section 3: Methodology */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
            <Activity className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">3. Validated Methodology</h2>
          </div>
          <div className="prose prose-slate max-w-none text-gray-600">
            <p>
                The <strong>Hybrid AI-DEM-RSM Framework</strong> utilized in this platform integrates three distinct domains:
            </p>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
                <li>
                    <strong>Physics-Informed DEM:</strong> The core engine uses the Hertz-Mindlin with JKR Cohesion contact model. Soil particles are calibrated using the <em>Angle of Repose</em> test to match macroscopic friction angle ($\phi$) and cohesion ($c$).
                </li>
                <li>
                    <strong>Response Surface Methodology (RSM):</strong> A Box-Behnken Design (BBD) is used to generate a quadratic surrogate model. This approximates the expensive DEM simulations ($O(hours)$) with a mathematical function ($O(ms)$), enabling real-time optimization.
                </li>
                <li>
                    <strong>Ensemble Learning:</strong> An XGBoost-Random Forest meta-learner predicts environmental outcomes (GHG emissions) based on the physical states output by the DEM engine.
                </li>
            </ol>
          </div>
        </section>

        {/* Section 4: Future Directions */}
        <section className="bg-gradient-to-br from-slate-50 to-indigo-50/50 p-8 rounded-2xl border border-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">4. Future Directions</h2>
          </div>
          <p className="text-gray-700 mb-4">
            The convergence of <strong>Digital Twins</strong> and <strong>Real-Time DEM</strong> is the next frontier. Future iterations will likely feature:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                <strong className="block text-indigo-900 mb-1">Cyber-Physical Systems</strong>
                <p className="text-slate-600">Real-time control of tractor speed based on live DEM predictions of soil failure.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                <strong className="block text-indigo-900 mb-1">Root-Soil Interaction</strong>
                <p className="text-slate-600">Modeling the biological growth of roots within the DEM soil matrix.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                <strong className="block text-indigo-900 mb-1">Cloud-Native Solving</strong>
                <p className="text-slate-600">Offloading heavy particle computation to edge clusters (as simulated in this app).</p>
            </div>
          </div>
        </section>

        <div className="text-center text-slate-400 text-sm pt-8 border-t border-gray-100">
            <p>Report generated by AgriDEM AI • Based on EDEM™ 2026 Documentation & Recent Literature</p>
        </div>

      </div>
    </div>
  );
};

const ImplementCard = ({ title, desc, metrics }: { title: string, desc: string, metrics: string[] }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4 h-20 overflow-hidden">{desc}</p>
        <div className="flex flex-wrap gap-2">
            {metrics.map((m, i) => (
                <span key={i} className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {m}
                </span>
            ))}
        </div>
    </div>
);

export default DocumentationPanel;
