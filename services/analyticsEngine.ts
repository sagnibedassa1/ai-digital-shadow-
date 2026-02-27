import { SimulationParams, AnalyticReport, ScenarioSuggestion, ToolType } from '../types';
import { calculateResponseSurface } from './advisoryEngine';

// Mock Predictive Model (Surrogate)
export const predictOutcome = (params: SimulationParams) => {
  const { burialRate, power } = calculateResponseSurface({
    v: params.forwardSpeed,
    omega: params.rotarySpeed,
    d: params.depth
  });
  
  // Add some noise/variance based on soil type
  let soilFactor = 1.0;
  if (params.soilType === 'Heavy Clay') soilFactor = 0.85; // Harder to work
  if (params.soilType === 'Sandy Loam') soilFactor = 1.1; // Easier

  const adjustedBurial = Math.min(100, burialRate * soilFactor);
  const adjustedPower = power * (1/soilFactor);

  return {
    burialRate: adjustedBurial,
    power: adjustedPower,
    efficiencyIndex: (adjustedBurial) / (adjustedPower) * 10
  };
};

export const generateAnalyticReport = (history: any[]): AnalyticReport => {
  const avgBurial = history.reduce((acc, curr) => acc + curr.incorporation, 0) / history.length;
  const avgPower = history.reduce((acc, curr) => acc + curr.power, 0) / history.length;
  
  const insights = [];
  if (avgBurial > 90) insights.push("High burial efficiency achieved consistently.");
  else if (avgBurial < 60) insights.push("Burial rates are suboptimal; consider increasing depth or rotary speed.");
  
  if (avgPower > 80) insights.push("Power consumption is high. Optimization recommended for fuel economy.");

  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    summary: `Simulation run analysis shows an average burial rate of ${avgBurial.toFixed(1)}% with power usage scaling around ${avgPower.toFixed(0)} units.`,
    keyInsights: insights,
    recommendations: [
      "Run RSM optimization to fine-tune rotary speed.",
      "Evaluate soil moisture impact on draft force."
    ],
    predictionAccuracy: 0.94
  };
};

export const generateScenarios = (objective: 'efficiency' | 'quality' | 'speed'): ScenarioSuggestion[] => {
  const suggestions: ScenarioSuggestion[] = [];

  if (objective === 'efficiency') {
    suggestions.push({
      id: 'sc_eff_1',
      name: 'Eco-Tillage Mode',
      description: 'Optimized for minimum fuel consumption while maintaining acceptable burial.',
      params: {
        forwardSpeed: 1.2,
        rotarySpeed: 210,
        depth: 12,
        toolType: ToolType.ROTARY_TILLER
      },
      predictedOutcome: 'Burial: ~85%, Power: Low'
    });
    suggestions.push({
      id: 'sc_eff_2',
      name: 'Shallow High-Speed',
      description: 'Fast surface incorporation for cover crops.',
      params: {
        forwardSpeed: 2.5,
        rotarySpeed: 280,
        depth: 8,
        toolType: ToolType.ROTARY_TILLER
      },
      predictedOutcome: 'Burial: ~70%, Speed: High'
    });
  } else if (objective === 'quality') {
    suggestions.push({
        id: 'sc_qual_1',
        name: 'Deep Inversion Plough',
        description: 'Maximum soil disturbance and burial for heavy residue.',
        params: {
          forwardSpeed: 1.0,
          depth: 25,
          toolType: ToolType.MOLDBOARD_PLOUGH
        },
        predictedOutcome: 'Burial: >95%, Disturbance: Max'
    });
  }

  return suggestions;
};

// --- NEW MULTI-OBJECTIVE FUNCTIONS ---

export interface ParetoPoint {
    power: number;
    burial: number;
    params: { v: number, omega: number, d: number };
    isFrontier: boolean;
}

/**
 * Generates a dataset representing the trade-off space between Power (Minimize) and Burial (Maximize).
 * It marks points that lie on the approximate Pareto Frontier.
 */
export const generateParetoFrontier = (soilType: string): ParetoPoint[] => {
    const points: ParetoPoint[] = [];
    
    // Grid Search over the design space
    // V: 1.0 - 3.0 m/s
    // Omega: 180 - 320 rpm
    // Depth: 10 - 20 cm
    
    for(let v = 1.0; v <= 3.0; v += 0.5) {
        for(let omega = 180; omega <= 320; omega += 20) {
            for(let d = 10; d <= 20; d += 2) {
                const { burialRate, power } = calculateResponseSurface({ v, omega, d });
                
                // Adjust for soil type slightly to add realism
                let sFactor = soilType === 'Heavy Clay' ? 0.9 : 1.0;
                
                points.push({
                    power: power * (2 - sFactor),
                    burial: Math.min(100, burialRate * sFactor),
                    params: { v, omega, d },
                    isFrontier: false
                });
            }
        }
    }

    // Identify Pareto Frontier (Naive approach: for a given power, max burial)
    // Sort by Power
    points.sort((a, b) => a.power - b.power);
    
    let maxBurialSoFar = -Infinity;
    points.forEach(p => {
        if (p.burial > maxBurialSoFar) {
            p.isFrontier = true;
            maxBurialSoFar = p.burial;
        }
    });

    return points;
};

export interface WhatIfScenario {
    id: string;
    name: string;
    diffSummary: string;
    params: Partial<SimulationParams>;
    results: { burial: number; power: number; efficiency: number };
}

/**
 * Automatically generates "What-If" scenarios based on a user's baseline configuration.
 */
export const generateWhatIfAnalysis = (baseline: SimulationParams): WhatIfScenario[] => {
    const base = predictOutcome(baseline);
    
    // Scenario 1: High Efficiency (Reduce Depth slightly, Optimize Speed)
    const effParams = { ...baseline, depth: Math.max(8, baseline.depth * 0.8), rotarySpeed: Math.max(180, baseline.rotarySpeed * 0.9) };
    const effResult = predictOutcome(effParams);
    
    // Scenario 2: Max Quality (Increase Depth, Increase Rotary)
    const qualParams = { ...baseline, depth: Math.min(25, baseline.depth * 1.2), rotarySpeed: Math.min(350, baseline.rotarySpeed * 1.1) };
    const qualResult = predictOutcome(qualParams);
    
    // Scenario 3: High Speed (Max Forward Speed, adjusted depth)
    const speedParams = { ...baseline, forwardSpeed: Math.min(3.0, baseline.forwardSpeed * 1.5), depth: Math.max(10, baseline.depth * 0.9) };
    const speedResult = predictOutcome(speedParams);

    return [
        {
            id: 'baseline',
            name: 'Current Baseline',
            diffSummary: 'Reference Configuration',
            params: baseline,
            results: { burial: base.burialRate, power: base.power, efficiency: base.efficiencyIndex }
        },
        {
            id: 'efficiency',
            name: 'Energy Saver',
            diffSummary: `Depth -20% | Power ${((effResult.power - base.power)/base.power * 100).toFixed(0)}%`,
            params: effParams,
            results: { burial: effResult.burialRate, power: effResult.power, efficiency: effResult.efficiencyIndex }
        },
        {
            id: 'quality',
            name: 'Max Incorporation',
            diffSummary: `Depth +20% | Burial +${(qualResult.burialRate - base.burialRate).toFixed(1)}%`,
            params: qualParams,
            results: { burial: qualResult.burialRate, power: qualResult.power, efficiency: qualResult.efficiencyIndex }
        },
        {
            id: 'speed',
            name: 'High Capacity',
            diffSummary: `Speed +50% | Power ${((speedResult.power - base.power)/base.power * 100).toFixed(0)}%`,
            params: speedParams,
            results: { burial: speedResult.burialRate, power: speedResult.power, efficiency: speedResult.efficiencyIndex }
        }
    ];
};