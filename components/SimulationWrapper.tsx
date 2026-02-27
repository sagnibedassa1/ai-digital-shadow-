
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SimulationParams, ToolType, SimulationState, HistoricalDataPoint, OutputTensor, MacroscopicState, CloudJob, SectionStat } from '../types';
import ControlPanel from './ControlPanel';
import SimulationCanvas from './SimulationCanvas';
import MetricsDashboard from './MetricsDashboard';
import ScenarioBuilder from './ScenarioBuilder';
import LiveMonitor from './LiveMonitor';
import SimulationHeader from './SimulationHeader';
import ValidationPanel from './ValidationPanel';
import { checkMechanicalFeasibility } from '../services/advisoryEngine';
import { getSurrogatePrediction } from '../services/surrogate';

interface Props {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
}

const SimulationWrapper: React.FC<Props> = ({ params, setParams }) => {
  // Simulation internal state (Physics results)
  const [simState, setSimState] = useState<SimulationState>({
    macro: { theta: 20, rho_b: 1.28, sigma_s: 0.4, G_eff: 60 },
    tensor: {
        physical: { eta_b: 0, delta_s: 0, tau_max: 0, draft_force: 0, compaction: 0, residueInterference: 0 },
        energetic: { P_c: 0, E_spec: 0, torque: 0 },
        environmental: { C_disturb: 0, E_vapor: 0 }
    },
    sectionStats: [], // Initial empty stats
    feasibility: { isFeasible: true }
  });

  const [history, setHistory] = useState<HistoricalDataPoint[]>([]);
  const [showScenarioBuilder, setShowScenarioBuilder] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showLiveMonitor, setShowLiveMonitor] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true); 

  // AI Surrogate Interval
  const surrogateInterval = useRef<any>(null);
  const simulationTime = useRef(0);

  // Cloud Jobs State
  const [cloudJobs, setCloudJobs] = useState<CloudJob[]>([]);

  // Effect: Handle AI Surrogate Mode
  useEffect(() => {
      if (params.isRunning && params.simulationEngine === 'AI_SURROGATE') {
          // In Surrogate mode, we drive metrics directly without Canvas physics
          simulationTime.current = 0;
          
          surrogateInterval.current = setInterval(() => {
              simulationTime.current += 0.05; // 20Hz update for UI smoothness
              
              const prediction = getSurrogatePrediction(simulationTime.current, params);
              
              const feasibility = checkMechanicalFeasibility({
                  v: params.forwardSpeed,
                  omega: params.rotarySpeed,
                  d: params.depth
              });

              setSimState({
                  macro: prediction.macro,
                  tensor: prediction.tensor,
                  sectionStats: prediction.sectionStats,
                  feasibility
              });

              setHistory(prev => {
                  const next = [...prev, {
                      time: new Date().toISOString(),
                      disturbance: prediction.tensor.physical.delta_s,
                      incorporation: prediction.tensor.physical.eta_b,
                      power: prediction.tensor.energetic.P_c / 5, // Scale down
                      compaction: prediction.tensor.physical.compaction
                  }];
                  return next.length > 50 ? next.slice(next.length - 50) : next;
              });

          }, 50); // 50ms interval
      } else {
          // Cleanup if paused or switched to DEM
          if (surrogateInterval.current) {
              clearInterval(surrogateInterval.current);
              surrogateInterval.current = null;
          }
      }

      return () => {
          if (surrogateInterval.current) {
              clearInterval(surrogateInterval.current);
          }
      };
  }, [params.isRunning, params.simulationEngine, params]);

  // Simulate Cloud Job spawning
  useEffect(() => {
      if (params.isRunning && params.useCloudCompute) {
          const activeJob = cloudJobs.find(j => j.status === 'Running' || j.status === 'Queued');
          if (!activeJob) {
              const newJob: CloudJob = {
                  id: Date.now().toString(),
                  name: `DEM-Cloud-${Math.floor(Math.random() * 1000)}`,
                  type: 'Batch Simulation',
                  status: 'Queued',
                  progress: 0,
                  submittedAt: new Date().toLocaleTimeString(),
                  estimatedCompletion: '~5m',
                  resources: 'g5.2xlarge'
              };
              setCloudJobs(prev => [newJob, ...prev]);

              let progress = 0;
              const interval = setInterval(() => {
                  progress += 5;
                  setCloudJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'Running', progress: Math.min(100, progress) } : j));
                  if (progress >= 100) {
                      setCloudJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'Completed' } : j));
                      clearInterval(interval);
                  }
              }, 1000);
          }
      }
  }, [params.isRunning, params.useCloudCompute]);

  const handleRunScenario = (newParams: Partial<SimulationParams>) => {
      setParams(prev => ({ ...prev, ...newParams, isRunning: true }));
      setShowScenarioBuilder(false);
  };

  const handleParamChange = (updates: Partial<SimulationParams>) => {
      setParams(prev => ({ ...prev, ...updates }));
  };

  // Callback for DEM engine (Visual Canvas)
  const handleMetricsUpdate = useCallback((tensor: OutputTensor, macro: MacroscopicState, stats: SectionStat[]) => {
    // Only update if in DEM mode. In AI mode, the interval above handles it.
    if (params.simulationEngine === 'AI_SURROGATE') return;

    const feasibility = checkMechanicalFeasibility({
        v: params.forwardSpeed,
        omega: params.rotarySpeed,
        d: params.depth
    });

    setSimState({
        macro,
        tensor,
        sectionStats: stats,
        feasibility
    });
    
    setHistory(prev => {
        const next = [...prev, {
            time: new Date().toISOString(),
            disturbance: tensor.physical.delta_s,
            incorporation: tensor.physical.eta_b,
            power: tensor.energetic.P_c / 5, // Scale down for shared chart
            compaction: tensor.physical.compaction
        }];
        return next.length > 50 ? next.slice(next.length - 50) : next;
    });

  }, [params]);

  // Mock Live Metrics for Monitor
  const liveMetrics = {
      status: params.isRunning ? 'RUNNING' : 'IDLE',
      totalBatchItems: 1, // Single run for now
      currentBatchItem: 1,
      batchProgress: params.useCloudCompute ? (cloudJobs.find(j => j.status === 'Running')?.progress || 0) : 100,
      tps: params.isRunning ? (params.simulationEngine === 'AI_SURROGATE' ? 1200 : 60) : 0, // AI is faster
      stabilityIndex: 98,
      computeLoad: params.simulationEngine === 'AI_SURROGATE' ? 2 : (params.useCloudCompute ? 5 : 45),
      anomalies: []
  };

  return (
    <div className="flex h-full gap-0 relative">
        {/* Live Monitor - Fixed Position (z-50 to stay above everything) */}
        {showLiveMonitor && (
            <LiveMonitor 
                metrics={liveMetrics as any} 
                onToggle={() => setShowLiveMonitor(false)} 
                minimized={false} 
                cloudJobs={cloudJobs}
            />
        )}
        {!showLiveMonitor && (
             <LiveMonitor 
                metrics={liveMetrics as any} 
                onToggle={() => setShowLiveMonitor(true)} 
                minimized={true}
                cloudJobs={cloudJobs}
            />
        )}

        {/* Left Sidebar: Controls & Scenario Button */}
        <div className={`
            absolute inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out shadow-2xl lg:relative lg:shadow-none lg:z-0
            ${showControls ? 'translate-x-0' : '-translate-x-full lg:hidden'}
        `}>
            <div className="h-full overflow-y-auto flex flex-col gap-4 p-4 pt-4">
                <ControlPanel params={params} setParams={setParams} />
                <button 
                    onClick={() => setShowScenarioBuilder(!showScenarioBuilder)}
                    className="w-full py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-bold hover:bg-indigo-100 transition-colors"
                >
                    {showScenarioBuilder ? "Back to Manual" : "Open Scenario Builder"}
                </button>
                <button 
                    onClick={() => setShowValidation(!showValidation)}
                    className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold hover:bg-emerald-100 transition-colors"
                >
                    {showValidation ? "Hide Validation" : "Empirical Validation"}
                </button>
                
                {showScenarioBuilder && (
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <ScenarioBuilder onRunScenario={handleRunScenario} />
                    </div>
                )}
            </div>
        </div>

        {/* Center: Header + Visualization + Metrics */}
        <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-50 overflow-hidden relative">
            
            {/* New Dedicated Header Component */}
            <SimulationHeader 
                showControls={showControls} 
                onToggleControls={() => setShowControls(!showControls)}
                showMetrics={showMetrics}
                onToggleMetrics={() => setShowMetrics(!showMetrics)}
                params={params}
                onParamChange={handleParamChange}
            />

            {/* Canvas Container */}
            <div className="flex-1 relative bg-slate-900">
                {/* 
                   If in AI Surrogate mode, we might want to hide the particle simulation or overlay "Simulation Mode" text.
                   For now, we keep the canvas mounted but the simulation will 'run' (animate tools) even if physics update is skipped in handleMetricsUpdate?
                   Actually, SimulationCanvas has its own loop in useFrame. We need to tell it to skip rigorous physics.
                   Ideally, we pass the 'engine' to SimulationCanvas.
                */}
                <SimulationCanvas 
                    params={params} 
                    onMetricsUpdate={handleMetricsUpdate} 
                    onParamChange={handleParamChange}
                />
                
                {params.simulationEngine === 'AI_SURROGATE' && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-600/90 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur flex items-center gap-2 z-20 animate-pulse pointer-events-none">
                        AI Surrogate Active • High-Speed Prediction
                    </div>
                )}
                
                {/* Floating Metrics Overlay - Conditionally Rendered */}
                {showMetrics && (
                    <div className="absolute bottom-0 left-0 right-0 pointer-events-none p-4 z-10 animate-in slide-in-from-bottom-5 fade-in duration-300">
                         <div className="pointer-events-auto bg-white/90 backdrop-blur rounded-xl border border-gray-200 shadow-lg p-2 max-w-5xl mx-auto">
                            <MetricsDashboard currentState={simState} history={history} />
                         </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default SimulationWrapper;
