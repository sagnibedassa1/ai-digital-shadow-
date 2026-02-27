
import { RSMCoefficients, OptimizationConstraints, OptimizationResult } from '../types';

/**
 * Calculates the response value (Y) for a second-order polynomial model.
 * Model: Y = b0 + b1*A + b2*B + b12*A*B + b11*A^2 + b22*B^2
 * 
 * @param omega - Rotary speed (Factor A)
 * @param depth - Tillage depth (Factor B)
 * @param coeffs - The regression coefficients (β or γ)
 */
export const calculateQuadraticResponse = (
  omega: number, 
  depth: number, 
  coeffs: RSMCoefficients
): number => {
  // Normalize inputs for better numerical stability in the demo
  // Assuming generic normalization ranges: Omega [180-350], Depth [8-20]
  // In a real app, we would use strict Coding of Factors (-1 to +1)
  const A = (omega - 265) / 85; 
  const B = (depth - 14) / 6;

  return (
    coeffs.b0 +
    coeffs.b1 * A +
    coeffs.b2 * B +
    coeffs.b12 * A * B +
    coeffs.b11 * (A * A) +
    coeffs.b22 * (B * B)
  );
};

/**
 * Solves the constrained optimization problem:
 * Maximize eta_b(omega, depth)
 * Subject to P_c(omega, depth) <= P_max
 * 
 * Uses Grid Search method (robust for low-dimension non-convex problems).
 */
export const solveOptimization = (
  burialCoeffs: RSMCoefficients,
  powerCoeffs: RSMCoefficients,
  constraints: OptimizationConstraints
): { result: OptimizationResult, paretoPoints: any[] } => {
  
  let bestResult: OptimizationResult | null = null;
  let maxBurial = -Infinity;
  const paretoPoints = [];

  // Grid Search Range
  const omegaStart = 180, omegaEnd = 350, omegaStep = 5;
  const depthStart = 8, depthEnd = 20, depthStep = 0.5;

  for (let w = omegaStart; w <= omegaEnd; w += omegaStep) {
    for (let d = depthStart; d <= depthEnd; d += depthStep) {
      
      const eta_b = calculateQuadraticResponse(w, d, burialCoeffs);
      const P_c = calculateQuadraticResponse(w, d, powerCoeffs);

      // Pareto Data Collection (Unconstrained)
      paretoPoints.push({ omega: w, depth: d, burial: eta_b, power: P_c });

      // Constraint Check
      if (P_c <= constraints.maxPower) {
        if (eta_b > maxBurial) {
          maxBurial = eta_b;
          bestResult = {
            optimalVector: { omega: w, depth: d },
            predicted: { burialRate: Math.min(100, eta_b), power: P_c },
            isFeasible: true
          };
        }
      }
    }
  }

  // Fallback if no feasible solution found
  if (!bestResult) {
    return {
      result: {
        optimalVector: { omega: 0, depth: 0 },
        predicted: { burialRate: 0, power: 0 },
        isFeasible: false
      },
      paretoPoints
    };
  }

  return { result: bestResult, paretoPoints };
};

/**
 * Generates mesh data for 3D Surface Visualization
 */
export const generateSurfaceData = (
  coeffs: RSMCoefficients, 
  resolution: number = 20
) => {
  const data = [];
  const omegaRange = { min: 180, max: 350 };
  const depthRange = { min: 8, max: 20 };
  
  const stepW = (omegaRange.max - omegaRange.min) / resolution;
  const stepD = (depthRange.max - depthRange.min) / resolution;

  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const w = omegaRange.min + i * stepW;
      const d = depthRange.min + j * stepD;
      const val = calculateQuadraticResponse(w, d, coeffs);
      
      // Normalize X, Z coordinates to typical 3D scene scale (-10 to 10)
      const x = ((i / resolution) * 20) - 10;
      const z = ((j / resolution) * 20) - 10;
      
      // Y is the value (height)
      data.push({ x, y: val, z, realW: w, realD: d });
    }
  }
  return { data, stepW, stepD, resolution };
};
