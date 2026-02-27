
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import SimulationWrapper from './components/SimulationWrapper';
import AdvisoryPanel from './components/DecisionSupportPanel';
import ChatBotPanel from './components/ChatBotPanel';
import SettingsPanel from './components/SettingsPanel';
import DocumentationPanel from './components/DocumentationPanel';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import ProjectManager from './components/ProjectManager';
import PromptGenerator from './components/PromptGenerator';
import TillageLab from './components/TillageLab';
import { SimulationParams, ToolType, UserSettings } from './types';
import { 
  Sprout, 
  Menu,
  X,
  LayoutGrid,
  PlayCircle,
  BarChart2,
  Book,
  MessageSquare,
  Settings,
  Folder,
  BrainCircuit,
  Activity,
  Tractor
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'tillage' | 'simulation' | 'dashboard' | 'analytics' | 'advisory' | 'projects' | 'settings' | 'docs'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Lifted User Settings State
  const [userSettings, setUserSettings] = useState<UserSettings>({
    profile: {
      name: 'Sagni B. Miressa',
      role: 'PhD Researcher & Full Stack Developer',
      organization: 'Nanjing Agricultural University, China',
      bio: 'Specialized researcher in agricultural mechanization and DEM-based simulation systems. Expert in soil-tool interaction modeling and AI-driven agricultural optimization.'
    },
    preferences: {
      units: 'Metric (SI)',
      language: 'English (US)',
      theme: 'Light'
    },
    defaults: {
      soilType: 'Clay Loam',
      simulationQuality: 'Medium'
    },
    notifications: {
      batchComplete: true,
      calibrationAlerts: true,
      systemUpdates: false,
      emailDigest: true
    }
  });

  // Lifted Simulation State
  const [simParams, setSimParams] = useState<SimulationParams>({
    retentionModel: 'conv_std', 
    toolType: ToolType.ROTARY_TILLER,
    depth: 15, 
    forwardSpeed: 1.38, 
    rotarySpeed: 255, 
    strawDensity: 240,
    soilMoisture: 20,
    soilType: 'Clay Loam',
    strawType: 'Rice', // Default to Rice for paddy focus
    colorMap: 'Velocity',
    isRunning: true,
    simulationEngine: 'DEM', // Default
    
    // Rotovator specific defaults
    rotorRadius: 245,
    bladeCount: 6,
    bladeAngle: 45,
    bladeClearance: 10,
    bladeShape: 'C-shaped',

    // Advanced Defaults
    particleShape: 'Multi-Sphere Clump',
    contactModel: 'JKR (Cohesive)',
    interParticleFriction: 0.6,
    
    // Real Environment Default Props (Clay Loam)
    soilProps: { poissonRatio: 0.38, shearModulus: 6e7, density: 1280 },
    strawProps: { poissonRatio: 0.35, shearModulus: 5e6, density: 250 }, // Rice Straw preset
    interactions: { restitutionCoeff: 0.25, staticFrictionSoilStraw: 0.55, staticFrictionSoilTool: 0.45, rollingFrictionStrawTool: 0.05 },

    // Soil Mechanics Defaults
    enableBreakage: true,
    cohesionStrength: 15,
    internalFrictionAngle: 25,
    breakageThreshold: 60,
    
    // Cloud/AI
    useCloudCompute: false
  });

  const handlePromptGeneration = (newParams: Partial<SimulationParams>) => {
    setSimParams(prev => ({ ...prev, ...newParams }));
    setActiveTab('simulation');
  };

  const handleTillageLaunch = (newParams: Partial<SimulationParams>) => {
    setSimParams(prev => ({ ...prev, ...newParams }));
    setActiveTab('simulation');
  };

  const NavLink = ({ id, label, icon }: { id: typeof activeTab, label: string, icon?: React.ReactNode }) => (
    <button
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full ${
        activeTab === id 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
      title={!isSidebarOpen ? label : undefined}
    >
      <div className="shrink-0">{icon}</div>
      {isSidebarOpen && <span className="truncate">{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-16'} shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-20`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
          <div className={`flex items-center gap-2 overflow-hidden ${!isSidebarOpen && 'hidden'}`}>
             <div className="bg-gradient-to-tr from-agri-600 to-emerald-500 p-1.5 rounded-lg text-white shadow-sm shrink-0">
                <Sprout size={20} />
             </div>
             <span className="font-bold text-lg tracking-tight truncate">AgriDEM<span className="text-slate-400 font-normal">.ai</span></span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
            <NavLink id="dashboard" label="Dashboard" icon={<Activity size={18}/>} />
            <NavLink id="home" label="Generator" icon={<PlayCircle size={18}/>} />
            <NavLink id="tillage" label="Tillage Lab" icon={<Tractor size={18}/>} />
            <NavLink id="simulation" label="3D Sim" icon={<LayoutGrid size={18}/>} />
            <NavLink id="advisory" label="Advisory" icon={<BrainCircuit size={18}/>} />
            <NavLink id="analytics" label="Analytics" icon={<BarChart2 size={18}/>} />
            <NavLink id="projects" label="Projects" icon={<Folder size={18}/>} />
            <NavLink id="docs" label="Docs" icon={<Book size={18}/>} />
        </nav>

        <div className="p-2 border-t border-gray-100 shrink-0">
            <NavLink id="settings" label="Settings" icon={<Settings size={18}/>} />
            
            {isSidebarOpen && (
              <div className="mt-4 px-3 py-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">SB</div>
                  <div className="overflow-hidden">
                      <div className="text-sm font-bold text-slate-900 truncate">Sagni B.</div>
                      <div className="text-xs text-slate-500 truncate">Researcher</div>
                  </div>
              </div>
            )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header (only visible on small screens) */}
        <header className="md:hidden h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
             <div className="bg-gradient-to-tr from-agri-600 to-emerald-500 p-1.5 rounded-lg text-white shadow-sm">
                <Sprout size={18} />
             </div>
             <span className="font-bold text-lg tracking-tight">AgriDEM</span>
          </div>
          <button className="p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-14 bg-white z-40 flex flex-col p-4 gap-1 md:hidden overflow-y-auto">
              <NavLink id="dashboard" label="Dashboard" icon={<Activity size={18}/>} />
              <NavLink id="home" label="Generator" icon={<PlayCircle size={18}/>} />
              <NavLink id="tillage" label="Tillage Lab" icon={<Tractor size={18}/>} />
              <NavLink id="simulation" label="3D Simulation" icon={<LayoutGrid size={18}/>} />
              <NavLink id="advisory" label="Advisory Panel" icon={<BrainCircuit size={18}/>} />
              <NavLink id="analytics" label="Advanced Analytics" icon={<BarChart2 size={18}/>} />
              <NavLink id="projects" label="Project Hub" icon={<Folder size={18}/>} />
              <NavLink id="docs" label="Documentation" icon={<Book size={18}/>} />
              <hr className="my-2 border-gray-100" />
              <NavLink id="settings" label="Settings" icon={<Settings size={18}/>} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto scroll-smooth">
            {activeTab === 'home' && <PromptGenerator onGenerate={handlePromptGeneration} />}
            
            {activeTab === 'tillage' && (
                <div className="h-full w-full animate-in fade-in">
                    <TillageLab onLaunch={handleTillageLaunch} />
                </div>
            )}
            
            {activeTab === 'simulation' && (
                <div className="h-full w-full animate-in fade-in zoom-in-95 duration-500">
                    <SimulationWrapper params={simParams} setParams={setSimParams} />
                </div>
            )}
            
            {activeTab === 'dashboard' && (
                <div className="h-full p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in">
                    <Dashboard />
                </div>
            )}

            {activeTab === 'advisory' && (
                <div className="h-full p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in">
                    <AdvisoryPanel />
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="h-full p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in">
                    <AdvancedAnalytics />
                </div>
            )}

            {activeTab === 'projects' && (
                <div className="h-full p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in">
                    <ProjectManager />
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="h-full p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in">
                    <SettingsPanel settings={userSettings} onSettingsChange={setUserSettings} />
                </div>
            )}

            {activeTab === 'docs' && (
                <div className="h-full p-4 lg:p-8 max-w-7xl mx-auto animate-in fade-in">
                    <DocumentationPanel />
                </div>
            )}
        </div>
      </main>

      {/* Chat Bot Overlay */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] max-w-[calc(100vw-3rem)] max-h-[60vh] shadow-2xl rounded-2xl animate-in slide-in-from-bottom-10 fade-in border border-gray-200">
            <ChatBotPanel />
        </div>
      )}

      {/* Global Chat Bot Trigger */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-14 h-14 rounded-full text-white shadow-xl hover:scale-110 transition-all flex items-center justify-center ${
                isChatOpen ? 'bg-red-500 rotate-90' : 'bg-slate-900'
            }`}
        >
            {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>

    </div>
  );
}
