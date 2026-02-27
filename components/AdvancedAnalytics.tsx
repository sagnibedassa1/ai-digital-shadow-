
import React, { useState, useMemo } from 'react';
import { AnalyticReport, SimulationParams, HistoricalDataPoint } from '../types';
import { generateAnalyticReport, predictOutcome, generateParetoFrontier, generateWhatIfAnalysis, ParetoPoint, WhatIfScenario } from '../services/analyticsEngine';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { FileText, TrendingUp, Search, Download, BrainCircuit, Box, User, Settings, Zap, Layers, ArrowRight, GitCompare, RefreshCw, Copy, Sliders, CheckSquare, Grid } from 'lucide-react';
import RSMOptimizer from './RSMOptimizer';
import SpatialHeatmap from './SpatialHeatmap';

const AdvancedAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'compare' | 'optimize'>('report');
  
  // Mock Data for History
  const mockHistory = Array.from({length: 20}, (_, i) => ({
    id: i + 1,
    incorporation: 60 + Math.random() * 35,
    power: 40 + Math.random() * 50,
    disturbance: 30 + Math.random() * 40,
    compaction: 20 + Math.random() * 30
  }));

  // Baseline for comparison in Report tab
  const mockBaseline = Array.from({length: 20}, (_, i) => ({
    id: i + 1,
    incorporation: 50 + Math.random() * 20, 
    power: 30 + Math.random() * 40
  }));

  const [report, setReport] = useState<AnalyticReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userRole, setUserRole] = useState<'Researcher' | 'Farmer' | 'Policy Maker'>('Researcher');
  const [compareMode, setCompareMode] = useState(false);

  // Comparison Tab State
  const [runA, setRunA] = useState<number>(1);
  const [runB, setRunB] = useState<number>(2);
  const [heatmapMetric, setHeatmapMetric] = useState<'compaction' | 'straw'>('compaction');

  // Helper to get run data
  const getRunData = (id: number) => mockHistory.find(h => h.id === id) || mockHistory[0];

  const comparisonData = useMemo(() => {
      const a = getRunData(runA);
      const b = getRunData(runB);
      
      // Normalize for Radar Chart (0-100 scale approximately)
      return [
          { subject: 'Burial %', A: a.incorporation, B: b.incorporation, fullMark: 100 },
          { subject: 'Power (kW)', A: a.power, B: b.power, fullMark: 100 },
          { subject: 'Disturbance', A: a.disturbance, B: b.disturbance, fullMark: 100 },
          { subject: 'Compaction', A: a.compaction, B: b.compaction, fullMark: 100 }, // Lower is better usually, but visualized raw
      ];
  }, [runA, runB]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    // Fallback to heuristic
    setTimeout(() => {
        const newReport = generateAnalyticReport(mockHistory);
        setReport(newReport);
        setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden rounded-xl border border-gray-200">
      
      {/* Header & Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm shrink-0 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" /> Advanced Analytics
            </h1>
            <p className="text-gray-500 text-sm mt-1">AI-driven insights & multi-objective optimization.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
            <button 
                onClick={() => setActiveTab('report')}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'report' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
            >
                <FileText size={14} /> AI Intelligence Report
            </button>
            <button 
                onClick={() => setActiveTab('compare')}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'compare' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
            >
                <GitCompare size={14} /> Run Comparison
            </button>
            <button 
                onClick={() => setActiveTab('optimize')}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'optimize' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
            >
                <Sliders size={14} /> RSM Optimizer
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        
        {/* REPORT TAB */}
        {activeTab === 'report' && (
            <div className="grid grid-cols-12 gap-6 animate-in fade-in">
                <div className="col-span-12 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-200 gap-4">
                     <div className="flex items-center gap-4 w-full sm:w-auto">
                         <label className="text-sm font-bold text-gray-700 flex items-center gap-2 whitespace-nowrap"><User size={16}/> Analysis Perspective:</label>
                         <select 
                            value={userRole} 
                            onChange={(e) => setUserRole(e.target.value as any)}
                            className="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2 w-full"
                         >
                             <option value="Researcher">Researcher (Technical)</option>
                             <option value="Farmer">Farmer (Practical)</option>
                             <option value="Policy Maker">Policy Maker (Environmental)</option>
                         </select>
                     </div>
                     <button 
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {isGenerating ? <BrainCircuit className="animate-spin" size={18} /> : <FileText size={18} />}
                        Generate AI Report
                    </button>
                </div>
                
                {report ? (
                     <div className="col-span-12 bg-white rounded-xl border border-indigo-100 shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-50 to-white p-6 border-b border-indigo-100">
                             <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-indigo-900 text-lg flex items-center gap-2">
                                        <BrainCircuit size={20} /> Executive Summary ({userRole} View)
                                    </h3>
                                    <p className="text-indigo-600 text-sm mt-1">Generated {new Date(report.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold uppercase text-gray-400">Model Confidence</div>
                                    <div className="text-2xl font-bold text-gray-800">{(report.predictionAccuracy * 100).toFixed(0)}%</div>
                                </div>
                             </div>
                             <div className="mt-4 text-gray-800 leading-relaxed max-w-none prose-sm whitespace-pre-wrap font-medium">
                                 {report.summary}
                             </div>
                        </div>

                        <div className="p-6">
                            <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Key Insights</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {report.keyInsights.map((insight, i) => (
                                    <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                                        <p className="text-sm text-gray-700">{insight}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <h4 className="text-sm font-bold text-gray-500 uppercase mb-4">Strategic Recommendations</h4>
                            <div className="flex flex-wrap gap-2">
                                {report.recommendations.map((rec, i) => (
                                    <div key={i} className="bg-green-50 text-green-800 px-3 py-1.5 rounded-full border border-green-100 text-sm font-medium flex items-center gap-2">
                                        <ArrowRight size={14} /> {rec}
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>
                ) : (
                    <div className="col-span-12 h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <FileText size={48} className="mb-4 text-gray-300" />
                        <p>No report generated yet. Click the button to analyze recent simulations.</p>
                    </div>
                )}

                <div className="col-span-12 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Simulation Performance Analysis</h3>
                        <button 
                            onClick={() => setCompareMode(!compareMode)} 
                            className={`text-xs px-3 py-1.5 rounded border flex items-center gap-1 ${compareMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-gray-600'}`}
                        >
                            <GitCompare size={14} /> {compareMode ? 'Comparison Mode On' : 'Compare with Baseline'}
                        </button>
                    </div>
                    
                    <ResponsiveContainer width="100%" height="100%">
                        {compareMode ? (
                            <LineChart data={mockHistory.map((h, i) => ({ ...h, baseInc: mockBaseline[i].incorporation, basePow: mockBaseline[i].power }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="id" hide />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="incorporation" stroke="#16a34a" name="Current Burial %" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="baseInc" stroke="#9ca3af" name="Baseline Burial %" strokeDasharray="5 5" dot={false} />
                                <Line type="monotone" dataKey="power" stroke="#ef4444" name="Current Power" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="basePow" stroke="#fca5a5" name="Baseline Power" strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        ) : (
                            <BarChart data={mockHistory}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="id" hide />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="incorporation" fill="#16a34a" name="Burial %" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="power" fill="#ef4444" name="Power" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {/* COMPARISON TAB */}
        {activeTab === 'compare' && (
            <div className="grid grid-cols-12 gap-6 animate-in fade-in h-full">
                {/* Controls */}
                <div className="col-span-12 bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 uppercase">Run A</span>
                            <select value={runA} onChange={(e) => setRunA(Number(e.target.value))} className="bg-gray-100 border border-gray-300 rounded text-sm p-1.5">
                                {mockHistory.map(h => <option key={h.id} value={h.id}>Batch #{h.id}</option>)}
                            </select>
                        </div>
                        <div className="text-gray-300">vs</div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-purple-600 uppercase">Run B</span>
                            <select value={runB} onChange={(e) => setRunB(Number(e.target.value))} className="bg-gray-100 border border-gray-300 rounded text-sm p-1.5">
                                {mockHistory.map(h => <option key={h.id} value={h.id}>Batch #{h.id}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">Spatial View:</span>
                        <div className="flex bg-gray-100 rounded p-1">
                            <button 
                                onClick={() => setHeatmapMetric('compaction')}
                                className={`px-3 py-1 text-xs rounded transition-colors ${heatmapMetric === 'compaction' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                            >
                                Compaction
                            </button>
                            <button 
                                onClick={() => setHeatmapMetric('straw')}
                                className={`px-3 py-1 text-xs rounded transition-colors ${heatmapMetric === 'straw' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                            >
                                Straw Dist
                            </button>
                        </div>
                    </div>
                </div>

                {/* Radar Chart Comparison */}
                <div className="col-span-12 lg:col-span-4 bg-white p-4 rounded-xl border border-gray-200 flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <GitCompare size={18} /> Performance Delta
                    </h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius="80%" data={comparisonData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name={`Run ${runA}`} dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                                <Radar name={`Run ${runB}`} dataKey="B" stroke="#9333ea" fill="#9333ea" fillOpacity={0.3} />
                                <Legend />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Stats Table */}
                    <div className="mt-4 border-t border-gray-100 pt-4 text-sm">
                        <div className="grid grid-cols-3 gap-2 font-medium text-xs text-gray-500 mb-2">
                            <span>Metric</span>
                            <span className="text-indigo-600">Run {runA}</span>
                            <span className="text-purple-600">Run {runB}</span>
                        </div>
                        {comparisonData.map((d, i) => (
                            <div key={i} className="grid grid-cols-3 gap-2 text-xs py-1 border-b border-gray-50 last:border-0">
                                <span>{d.subject}</span>
                                <span className="font-bold text-gray-800">{d.A.toFixed(1)}</span>
                                <span className="font-bold text-gray-800">{d.B.toFixed(1)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3D Heatmaps Side-by-Side */}
                <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-4 h-[500px]">
                    <div className="bg-white p-2 rounded-xl border border-gray-200 flex flex-col relative overflow-hidden group">
                        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-indigo-700 shadow-sm pointer-events-none">
                            Run #{runA}
                        </div>
                        <SpatialHeatmap metric={heatmapMetric} runId={runA} />
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-gray-200 flex flex-col relative overflow-hidden group">
                        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-purple-700 shadow-sm pointer-events-none">
                            Run #{runB}
                        </div>
                        <SpatialHeatmap metric={heatmapMetric} runId={runB} />
                    </div>
                </div>
            </div>
        )}

        {/* OPTIMIZE TAB (RSM) */}
        {activeTab === 'optimize' && (
            <div className="h-[calc(100vh-200px)] min-h-[600px] animate-in fade-in">
                <RSMOptimizer />
            </div>
        )}

      </div>
    </div>
  );
};

export default AdvancedAnalytics;
