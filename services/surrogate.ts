
import { SimulationParams, OutputTensor, MacroscopicState, SectionStat } from '../types';

/**
 * RNN-Based Surrogate Model (Simulated)
 * 
 * This service replicates the behavior of a recurrent neural network trained on DEM data.
 * It predicts temporal force profiles and interaction metrics in real-time.
 * 
 * Features:
 * - Time-dependent force prediction (Draft, Vertical, Lateral)
 * - Soil-Straw-Tool interaction effects
 * - Material property sensitivity
 */

export const getSurrogatePrediction = (
    time: number,
    params: SimulationParams
): { 
    tensor: OutputTensor, 
    macro: MacroscopicState, 
    sectionStats: SectionStat[],
    forces: { draft: number, vertical: number, lateral: number } 
} => {
    // 1. Extract Inputs
    const { forwardSpeed: v, depth: d_cm, rotarySpeed: omega_rpm, soilType, strawType, strawDensity } = params;
    const d_mm = d_cm * 10;
    
    // 2. Base Force Models (Empirical + RNN approximation)
    // Draft Force (Fx): Increases with speed^2 and depth
    let baseDraft = 0.5 * (v * v) + 0.02 * d_mm; 
    
    // Soil Factor
    let soilFactor = 1.0;
    if (soilType === 'Heavy Clay') soilFactor = 1.4; // Cohesive, sticky
    if (soilType === 'Clay Loam') soilFactor = 1.2;
    if (soilType === 'Sandy Loam') soilFactor = 0.8;
    if (soilType === 'Silt') soilFactor = 1.0;
    
    // Straw Factor
    let strawFactor = 1.0;
    if (strawType === 'Rice') strawFactor = 1.15; // Tough, wet
    if (strawType === 'Corn') strawFactor = 1.25; // Stiff stalks
    
    // Time-dependent components (simulating blade entry/exit)
    const freq = (omega_rpm / 60) * 2 * Math.PI; // rad/s
    // Simple harmonic for rotary tiller blades hitting soil
    const oscillation = Math.sin(freq * time) * 0.3 * baseDraft;
    
    const draftForce = (baseDraft * soilFactor * strawFactor) + oscillation;
    
    // Vertical Force (Fy): Dynamic lift + weight
    // Tiller pushes down on entry, lifts on exit
    const verticalForce = (0.2 * baseDraft) + (Math.cos(freq * time) * 0.4 * baseDraft);
    
    // Lateral Force (Fz): Random noise + slight asymmetry
    const lateralForce = (Math.random() - 0.5) * 0.1 * baseDraft;

    // 3. Output Tensor Calculation
    // Burial Rate (eta_b) - Non-linear sigmoid relationship with Energy Input
    const energyInput = (v * 100) + (omega_rpm * 0.5) + (d_mm * 2);
    // Ideal range for this surrogate around energyInput = 500-800
    const eta_b = 95 / (1 + Math.exp(-(energyInput - 600) / 100));
    
    // Soil Disturbance (delta_s)
    const delta_s = Math.min(100, (d_mm / 250) * 100 + (omega_rpm / 450) * 20);
    
    // Power (P_c)
    const torque = (draftForce * 0.2) * (d_mm / 1000); // approx moment arm
    const power = (draftForce * v) + (torque * freq);

    const tensor: OutputTensor = {
        physical: { 
            eta_b: Math.min(99.9, eta_b), 
            delta_s: delta_s, 
            tau_max: draftForce * 1.5, // kPa approx
            draft_force: draftForce, 
            compaction: (d_mm > 150 ? 30 : 15) + (v > 2 ? 10 : 0), // Heuristic
            residueInterference: 0
        },
        energetic: { 
            P_c: power, 
            E_spec: power / (d_mm * v * 100), // Energy per volume approx
            torque: torque 
        },
        environmental: { 
            C_disturb: delta_s * 0.05, 
            E_vapor: delta_s * 0.08 
        }
    };

    const macro: MacroscopicState = {
        theta: params.soilMoisture,
        rho_b: params.soilProps.density / 1000,
        sigma_s: strawDensity * 0.002, // kg/m2 approx
        G_eff: params.soilProps.shearModulus / 1e6
    };

    // Simulated Vertical Distribution (Section Stats)
    // In AI mode, we generate ideal distributions based on burial rate
    const totalParticles = 1000;
    const buriedStraw = totalParticles * (eta_b / 100);
    const surfaceStraw = totalParticles - buriedStraw;
    
    // Distribute buried straw into sections 2-5
    const s2 = buriedStraw * 0.3;
    const s3 = buriedStraw * 0.3;
    const s4 = buriedStraw * 0.2;
    const s5 = buriedStraw * 0.2;

    const sectionStats: SectionStat[] = [
        { id: 1, label: 'Top', soilCount: 200, strawCount: surfaceStraw, riceCount: 0, wheatCount: 0, avgDepth: 10 },
        { id: 2, label: 'S2', soilCount: 200, strawCount: s2, riceCount: 0, wheatCount: 0, avgDepth: 40 },
        { id: 3, label: 'S3', soilCount: 200, strawCount: s3, riceCount: 0, wheatCount: 0, avgDepth: 80 },
        { id: 4, label: 'S4', soilCount: 200, strawCount: s4, riceCount: 0, wheatCount: 0, avgDepth: 120 },
        { id: 5, label: 'Bottom', soilCount: 200, strawCount: s5, riceCount: 0, wheatCount: 0, avgDepth: 160 },
    ];

    return { tensor, macro, sectionStats, forces: { draft: draftForce, vertical: verticalForce, lateral: lateralForce } };
};
