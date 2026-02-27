
import React, { useEffect, useState } from 'react';
import { LiveMetrics, MonitoringAlert, CloudJob } from '../types';
import { Activity, Cpu, Layers, AlertCircle, PlayCircle, StopCircle, Zap, Clock, ShieldCheck, CheckCircle, Cloud } from 'lucide-react';

interface Props {
  metrics: LiveMetrics;
  onToggle: () => void;
  minimized?: boolean;
  cloudJobs?: CloudJob[]; // New prop for cloud monitoring
}

const LiveMonitor: React.FC<Props> = ({ metrics, onToggle, minimized = false, cloudJobs = [] }) => {
  const [prediction, setPrediction] = useState("Calculating...");
  const [resolvedAlerts, setResolvedAlerts] = useState<string[]>([]);
  const [view, setView] = useState<'local' | 'cloud'>('local');

  useEffect(() => {
    // Mock Predictive AI update
    if (metrics.status === 'RUNNING') {
        const remaining = metrics.totalBatchItems - metrics.currentBatchItem;
        const mins = (remaining * 1.5).toFixed(0);
        setPrediction(`~${mins}m 30s remaining`);
    } else {
        setPrediction("Simulation Idle");
    }
  }, [metrics.currentBatchItem, metrics.status]);

  const handleResolve = (id: string) => {
    setResolvedAlerts(prev => [...prev, id]);
  };

  const activeAlerts = metrics.anomalies.filter(a => !resolvedAlerts.includes(a.id));

  if (minimized) {
    return (
      <button 
        onClick={onToggle}
        className="fixed bottom-4 left-4 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-slate-800 transition-all z-50 flex items-center gap-2 group"
      >
        <div className="relative">
            <Activity size={20} className={metrics.status === 'RUNNING' ? 'text-green-400 animate-pulse' : 'text-gray-400'} />
            {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-900"></span>
            )}
        </div>
        <div className="flex flex-col items-start leading-none">
            <span className="text-xs font-bold">Live Monitor</span>
            {metrics.status === 'RUNNING' && <span className="text-[9px] text-gray-400 font-mono mt-0.5">{prediction}</span>}
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white/95 backdrop-blur rounded-xl shadow-2xl border border-gray-200 z-50 w-80 overflow-hidden transition-all animate-in slide-in-from-left-4 fade-in">
      {/* Header */}
      <div className="bg-slate-900 text-white p-3 flex justify-between items-center cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-2">
            <Activity size={16} className={metrics.status === 'RUNNING' ? 'text-green-400' : 'text-gray-400'} />
            <span className="font-bold text-sm">Simulation Monitor</span>
        </div>
        <div className="flex gap-1">
             <button onClick={(e) => { e.stopPropagation(); setView('local'); }} className={`text-[10px] font-mono px-2 py-0.5 rounded border ${view === 'local' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-transparent border-transparent text-slate-400'}`}>Local</button>
             <button onClick={(e) => { e.stopPropagation(); setView('cloud'); }} className={`text-[10px] font-mono px-2 py-0.5 rounded border ${view === 'cloud' ? 'bg-blue-900 border-blue-800 text-blue-200' : 'bg-transparent border-transparent text-slate-400'}`}>Cloud</button>
        </div>
      </div>

      {view === 'local' ? (
      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        
        {/* Prediction Block */}
        <div className="flex items-center justify-between bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-800">
                <Clock size={14} />
                <span className="text-xs font-bold uppercase">Est. Completion</span>
            </div>
            <span className="text-sm font-mono font-bold text-indigo-600">{prediction}</span>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <div className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                    <Zap size={10} /> TPS
                </div>
                <div className="text-xl font-mono font-bold text-gray-800">{metrics.tps.toFixed(1)}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <div className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                    <ShieldCheck size={10} /> Stability
                </div>
                <div className={`text-xl font-mono font-bold ${metrics.stabilityIndex > 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {metrics.stabilityIndex}%
                </div>
            </div>
        </div>

        {/* Compute Load */}
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 flex items-center gap-1"><Cpu size={12} /> Compute Load</span>
                <span className={`font-bold ${metrics.computeLoad > 90 ? 'text-red-600' : 'text-gray-700'}`}>{metrics.computeLoad}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-300 ${metrics.computeLoad > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${metrics.computeLoad}%` }}
                />
            </div>
        </div>

        {/* Batch Progress */}
        {metrics.totalBatchItems > 1 && (
             <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Batch Progress ({metrics.currentBatchItem}/{metrics.totalBatchItems})</span>
                    <span className="font-bold text-indigo-600">{metrics.batchProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                        style={{ width: `${metrics.batchProgress}%` }}
                    />
                </div>
            </div>
        )}

        {/* Active Alerts */}
        {activeAlerts.length > 0 ? (
            <div className="space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase">Active Alerts</div>
                {activeAlerts.map((alert) => (
                    <div key={alert.id} className="bg-red-50 border border-red-100 rounded-lg p-3 animate-pulse">
                        <div className="flex items-start gap-2 mb-1">
                            <AlertCircle size={14} className="text-red-600 mt-0.5" />
                            <div className="text-xs font-bold text-red-800">{alert.message}</div>
                        </div>
                        {alert.suggestedAction && (
                            <div className="ml-5 text-[10px] text-red-600 mb-2">
                                Suggestion: {alert.suggestedAction}
                            </div>
                        )}
                        <button 
                            onClick={() => handleResolve(alert.id)}
                            className="w-full py-1 bg-white border border-red-200 text-red-700 text-[10px] font-bold rounded hover:bg-red-100 transition-colors"
                        >
                            Apply Corrective Action
                        </button>
                    </div>
                ))}
            </div>
        ) : (
             <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
                <CheckCircle size={14} /> System Healthy. No anomalies.
             </div>
        )}
      </div>
      ) : (
          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto bg-slate-50 min-h-[300px]">
              {cloudJobs.length === 0 ? (
                  <div className="text-center text-gray-400 py-10 flex flex-col items-center gap-2">
                      <Cloud size={24} />
                      <span className="text-xs">No active cloud jobs.</span>
                  </div>
              ) : (
                  <div className="space-y-3">
                      {cloudJobs.map(job => (
                          <div key={job.id} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                  <div>
                                      <div className="font-bold text-xs text-blue-900">{job.name}</div>
                                      <div className="text-[10px] text-gray-500">{job.type}</div>
                                  </div>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      job.status === 'Running' ? 'bg-blue-100 text-blue-700 animate-pulse' : 
                                      job.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                  }`}>{job.status}</span>
                              </div>
                              
                              <div className="space-y-1 mb-2">
                                  <div className="flex justify-between text-[10px] text-gray-500">
                                      <span>Progress</span>
                                      <span>{job.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${job.progress}%` }}></div>
                                  </div>
                              </div>
                              
                              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                                  <span>{job.resources}</span>
                                  <span>{job.estimatedCompletion}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default LiveMonitor;
