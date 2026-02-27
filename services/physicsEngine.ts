
import { Particle, ToolType, SimulationParams, OutputTensor, MacroscopicState, SoilType, StrawType, SectionStat } from '../types';

// --- Deterministic RNG (Linear Congruential Generator) ---
class LCGRandom {
  seed: number;
  constructor(seed: number) { this.seed = seed; }
  
  // Returns float between 0 and 1
  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
}

// Global RNG Instance
const rng = new LCGRandom(12345);
let globalIdCounter = 100000; // Counter for dynamic particles (fragments)

export const resetRNG = () => {
    rng.seed = 12345;
    globalIdCounter = 100000;
};

// --- Field-Validated Material Presets (Calibrated for Paddy Soil Environment) ---
export const getMaterialPresets = (type: SoilType | StrawType) => {
    switch(type) {
        case 'Rice':
            // Rice Straw: Higher density due to moisture, lower shear modulus (flexible/tough), higher friction
            return {
                poissonRatio: 0.35, 
                shearModulus: 4.5e6,  // 4.5 MPa (Flexible)
                density: 280        // 280 kg/m3 (Wet residue)
            };
        case 'Wheat':
            // Wheat Straw: Stiffer, lighter, brittle
            return {
                poissonRatio: 0.30, 
                shearModulus: 9.0e6,  // 9.0 MPa (Stiff)
                density: 160        // 160 kg/m3 (Dry residue)
            };
        case 'Corn':
            return {
                poissonRatio: 0.32,
                shearModulus: 1.5e7, // Stalk is very stiff
                density: 300
            };
        case 'Clay Loam': // Typical Paddy Soil (Cohesive)
            return {
                poissonRatio: 0.40,
                shearModulus: 5e7,
                density: 1350
            };
        case 'Heavy Clay': // High cohesion, difficult to work
            return {
                poissonRatio: 0.45,
                shearModulus: 3.5e7,
                density: 1500
            };
        case 'Sandy Loam': // Non-cohesive
            return {
                poissonRatio: 0.28,
                shearModulus: 7e7,
                density: 1250
            };
        case 'Silt':
            return {
                poissonRatio: 0.35,
                shearModulus: 4e7,
                density: 1300
            };
        default:
            return { poissonRatio: 0.3, shearModulus: 1e7, density: 1000 };
    }
};

// Physical Constants & Spatial Config (Updated to match visual bin: mm)
const GRAVITY = 9.81 * 1000; // mm/s^2
const TIME_STEP = 0.0005; // s (finer step for mm scale)
const BOX_WIDTH = 1200;  // mm
const BOX_DEPTH = 600;   // mm
const BOX_HEIGHT = 250;  // mm
const STRAW_SEGMENT_LENGTH = 15; // mm (represented as ~1.5cm)

// Scale Shear Modulus for web stability
const STIFFNESS_SCALE = 1e-4; 

// --- Spatial Partitioning for Performance ---
class SpatialGrid {
  cellSize: number;
  buckets: Map<string, number[]>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.buckets = new Map();
  }

  clear() {
    for (const bucket of this.buckets.values()) {
      bucket.length = 0;
    }
  }

  getKey(x: number, y: number, z: number) {
    const kx = Math.floor(x / this.cellSize);
    const ky = Math.floor(y / this.cellSize);
    const kz = Math.floor(z / this.cellSize);
    return `${kx},${ky},${kz}`;
  }

  add(particleIndex: number, x: number, y: number, z: number) {
    const key = this.getKey(x, y, z);
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = [];
      this.buckets.set(key, bucket);
    }
    bucket.push(particleIndex);
  }

  getNeighbors(x: number, y: number, z: number, outNeighbors: number[]) {
    const kx = Math.floor(x / this.cellSize);
    const ky = Math.floor(y / this.cellSize);
    const kz = Math.floor(z / this.cellSize);
    outNeighbors.length = 0;
    
    // Check 3x3x3 neighborhood
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          const key = `${kx+i},${ky+j},${kz+k}`;
          const bucket = this.buckets.get(key);
          if (bucket) {
            for(let n = 0; n < bucket.length; n++) {
                outNeighbors.push(bucket[n]);
            }
          }
        }
      }
    }
    return outNeighbors;
  }
}

const globalGrid = new SpatialGrid(30);
const globalNeighbors: number[] = [];

export const initializeParticles = (count: number, strawRatio: number, soilType: SoilType, moisture: number, params?: SimulationParams): Particle[] => {
  const particles: Particle[] = [];
  
  // Real Environment Densities (from params if available, otherwise preset)
  // Ensure we use the latest params from ControlPanel
  const soilDensity = (params?.soilProps.density || 1280) / 1000; // g/cm3 (adjust for mm scale)
  const strawDensity = (params?.strawProps.density || 240) / 1000; // g/cm3

  // Straw Geometry Configuration based on Type (in mm)
  let minLength = 50; // mm
  let maxLength = 150; // mm
  let strawRadius = 4; // mm

  if (params?.strawType === 'Rice') {
      // Rice straw: shorter, thicker
      minLength = 80; maxLength = 180; strawRadius = 5.0;
  } else if (params?.strawType === 'Wheat') {
      // Wheat straw: longer, thinner
      minLength = 100; maxLength = 250; strawRadius = 3.5;
  }

  let idCounter = 0;

  // Initialize Soil (Fill 200mm depth)
  // Adjusted for strict bin filling
  const rows = 24; 
  const cols = 12;
  const layers = 6;
  
  const fillWidth = BOX_WIDTH * 0.95; // Slightly tighter fill
  const fillDepth = BOX_DEPTH * 0.95; 
  const fillHeight = 200; // 200mm

  const spacingX = fillWidth / rows;
  const spacingZ = fillDepth / cols;
  const spacingY = fillHeight / layers;

  for (let y = 0; y < layers; y++) {
    for (let x = 0; x < rows; x++) {
      for (let z = 0; z < cols; z++) {
        const jx = (rng.next() - 0.5) * spacingX * 0.5;
        const jz = (rng.next() - 0.5) * spacingZ * 0.5;
        const jy = (rng.next() - 0.5) * spacingY * 0.5;

        // Clod Generation
        const clodThreshold = (soilType === 'Clay Loam' || soilType === 'Heavy Clay') ? 0.6 : 0.8;
        const isAgglomerate = rng.next() > clodThreshold; 
        
        const radius = isAgglomerate ? 8 + rng.next() * 4 : 5 + rng.next() * 2; // mm
        const volume = (4/3) * Math.PI * Math.pow(radius, 3);
        const mass = volume * soilDensity * 0.001; // Scaled mass kg (since density is g/cm3 but we compute in mm^3, factor roughly)
        // Actually: radius mm. volume mm^3. density g/cm^3 = mg/mm^3. 
        // volume * density = mass in mg. 
        // Physics engine treats mass units relatively or we need to be consistent. 
        // Using mass ~ 1-10 range is good for stability.
        
        particles.push({
          id: idCounter++,
          x: (x * spacingX) - (fillWidth/2) + jx,
          y: -(y * spacingY) + jy - 20, // Start slightly below surface
          z: (z * spacingZ) - (fillDepth/2) + jz,
          vx: 0, vy: 0, vz: 0,
          type: 'soil',
          radius: radius,
          rotation: rng.next() * Math.PI,
          mass: mass,
          friction: 0.5,
          force: 0,
          density: 1.0,
          isAgglomerate,
          plasticStrain: 0
        });
      }
    }
  }

  // Initialize Straw (Bonded Particle Model)
  // Removed straw initialization to make the 3D visualization user-friendly
  const strawParticleCount = 0;
  let createdStraws = 0;

  while (createdStraws < strawParticleCount) {
    const startX = (rng.next() - 0.5) * fillWidth;
    const startZ = (rng.next() - 0.5) * fillDepth;
    const startY = 10 + rng.next() * 20; // Surface layer (positive Y initially then falls)
    const orientation = rng.next() * Math.PI * 2;
    
    const lengthMm = minLength + rng.next() * (maxLength - minLength); 
    const numSegments = Math.max(1, Math.floor(lengthMm / STRAW_SEGMENT_LENGTH));
    
    const dx = Math.cos(orientation) * STRAW_SEGMENT_LENGTH;
    const dz = Math.sin(orientation) * STRAW_SEGMENT_LENGTH;

    const segmentIds = [];
    const volume = (4/3) * Math.PI * Math.pow(strawRadius, 3);
    const mass = volume * strawDensity * 0.001;

    const subtype = params?.strawType === 'Rice' ? 'rice' : 'wheat';

    for(let k=0; k<numSegments; k++) {
        const pid = idCounter++;
        segmentIds.push(pid);
        particles.push({
            id: pid,
            x: startX + (k * dx),
            y: startY + (rng.next() * 2),
            z: startZ + (k * dz),
            vx: 0, vy: 0, vz: 0,
            type: 'straw',
            subtype: subtype,
            radius: strawRadius, 
            rotation: orientation,
            mass: mass,
            friction: 0.3,
            force: 0,
            density: 0.5,
            isAgglomerate: false,
            plasticStrain: 0,
            bonds: [] 
        });
        createdStraws++;
    }

    // Link segments
    for(let k=0; k < numSegments - 1; k++) {
        const idx = particles.length - numSegments + k;
        particles[idx].bonds = [segmentIds[k+1]];
        particles[idx + 1].bonds?.push(segmentIds[k]);
    }
  }

  // Initialize Dust
  const dustParticleCount = Math.floor(count * 0.1); // 10% of total particles as dust
  for (let i = 0; i < dustParticleCount; i++) {
    const startX = (rng.next() - 0.5) * fillWidth;
    const startZ = (rng.next() - 0.5) * fillDepth;
    const startY = 10 + rng.next() * 20; // Surface layer

    const radius = 2 + rng.next() * 2; // Smaller than soil
    const volume = (4/3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * soilDensity * 0.0005; // Lighter than soil

    particles.push({
      id: idCounter++,
      x: startX,
      y: startY,
      z: startZ,
      vx: 0, vy: 0, vz: 0,
      type: 'dust',
      radius: radius,
      rotation: rng.next() * Math.PI,
      mass: mass,
      friction: 0.2,
      force: 0,
      density: 0.2,
      isAgglomerate: false,
      plasticStrain: 0
    });
  }

  return particles;
};

// --- SIMULATION STATE ---
let timeAccumulator = 0;

export const resetSimulation = () => {
    timeAccumulator = 0;
};

const globalParticleMap = new Map<number, Particle>();

export const updatePhysics = (
  particles: Particle[], 
  params: SimulationParams,
  toolPos: {x: number, y: number, z: number}
): { particles: Particle[], tensor: OutputTensor, macro: MacroscopicState, sectionStats: SectionStat[] } => {
  
  timeAccumulator += TIME_STEP;
  let movedParticles = 0;
  let strawBuried = 0;
  let accumulatedForce = 0;
  let accumulatedDraft = 0; // Distinct draft force accumulator
  let accumulatedTorque = 0;
  let totalCompactionStrain = 0; 
  
  // Stats Buckets
  const stats: SectionStat[] = [
      { id: 1, label: 'Section 1 (Top)', soilCount: 0, strawCount: 0, riceCount: 0, wheatCount: 0, avgDepth: 0 },
      { id: 2, label: 'Section 2', soilCount: 0, strawCount: 0, riceCount: 0, wheatCount: 0, avgDepth: 0 },
      { id: 3, label: 'Section 3', soilCount: 0, strawCount: 0, riceCount: 0, wheatCount: 0, avgDepth: 0 },
      { id: 4, label: 'Section 4', soilCount: 0, strawCount: 0, riceCount: 0, wheatCount: 0, avgDepth: 0 },
      { id: 5, label: 'Section 5 (Bottom)', soilCount: 0, strawCount: 0, riceCount: 0, wheatCount: 0, avgDepth: 0 },
  ];

  // Boundaries for Sections (mm) based on 180mm analysis zone starting at -20mm
  const getSectionIndex = (y: number) => {
      if (y > -20) return 0; // Above zone
      if (y > -56) return 0; // S1
      if (y > -92) return 1; // S2
      if (y > -128) return 2; // S3
      if (y > -164) return 3; // S4
      if (y > -200) return 4; // S5
      return 4; // Below zone counts as S5 for now
  };

  // Real Environment Physics Parameters from ControlPanel inputs
  const soilG = params.soilProps.shearModulus * STIFFNESS_SCALE; 
  const soilNu = params.soilProps.poissonRatio;
  const strawG = params.strawProps.shearModulus * STIFFNESS_SCALE;
  const strawNu = params.strawProps.poissonRatio;

  const soilE = 2 * soilG * (1 + soilNu);
  const strawE = 2 * strawG * (1 + strawNu);
  
  const e_soil_soil = params.interactions.restitutionCoeff;
  // Damping coefficient calculation helper based on restitution (logarithmic decrement)
  const ln_e = Math.log(e_soil_soil);
  const dampFactor = -ln_e / Math.sqrt(ln_e*ln_e + Math.PI*Math.PI);

  let mu_soil_straw = params.interactions.staticFrictionSoilStraw;
  if (params.strawType === 'Rice') mu_soil_straw += 0.1;
  
  const mu_soil_tool = params.interactions.staticFrictionSoilTool;

  // Tool Physics (Adjusted for mm scale)
  const toolDepth = params.depth * 10; // cm -> mm
  const simDepth = toolDepth; 
  
  // Correct Omega calculation: RPM to Rad/s
  const omega = params.rotarySpeed * (2 * Math.PI) / 60; 

  globalGrid.clear();
  particles.forEach((p, idx) => globalGrid.add(idx, p.x, p.y, p.z));

  globalParticleMap.clear();
  particles.forEach(p => globalParticleMap.set(p.id, p));

  particles.forEach((p, idx) => {
    let { x, y, z, vx, vy, vz, type, mass, isAgglomerate, radius, bonds, plasticStrain } = p;
    let forceMag = 0;
    
    // --- 1. BOND FORCES (Elastic Beam Approximation) ---
    if (type === 'straw' && bonds && bonds.length > 0) {
        bonds.forEach(bondId => {
            const connected = globalParticleMap.get(bondId);
            if (connected) {
                const bdx = connected.x - x;
                const bdy = connected.y - y;
                const bdz = connected.z - z;
                const bDist = Math.sqrt(bdx*bdx + bdy*bdy + bdz*bdz);
                const stretch = bDist - (STRAW_SEGMENT_LENGTH * 0.9);
                
                if (Math.abs(stretch) > 0.5) {
                    const springK = strawE * radius * 10;
                    const springForce = stretch * springK;
                    const bnx = bdx / bDist;
                    const bny = bdy / bDist;
                    const bnz = bdz / bDist;
                    
                    vx += (bnx * springForce) / mass * TIME_STEP;
                    vy += (bny * springForce) / mass * TIME_STEP;
                    vz += (bnz * springForce) / mass * TIME_STEP;
                }
            }
        });
    }

    // --- 2. PARTICLE-PARTICLE (Hertz-Mindlin + JKR) ---
    const neighbors = globalGrid.getNeighbors(x, y, z, globalNeighbors);
    let fx_pp = 0, fy_pp = 0, fz_pp = 0;
    let localNeighborCount = 0;
    
    for (const nIdx of neighbors) {
        if (nIdx === idx) continue;
        const neighbor = particles[nIdx];
        if (bonds && bonds.includes(neighbor.id)) continue;
        
        const dx = x - neighbor.x;
        const dy = y - neighbor.y;
        const dz = z - neighbor.z;
        const distSq = dx*dx + dy*dy + dz*dz;
        const rSum = radius + neighbor.radius;
        
        // Interaction Range check (include Cohesion range buffer if JKR)
        const interactionRange = (params.contactModel === 'JKR (Cohesive)' && type === 'soil') ? rSum * 1.1 : rSum;

        if (distSq < interactionRange * interactionRange * 2.25) {
            localNeighborCount++;
        }

        if (distSq < interactionRange * interactionRange) { 
            const dist = Math.sqrt(distSq);
            if (dist < 0.001) continue;
            
            const overlap = rSum - dist;
            const nx = dx / dist; 
            const ny = dy / dist; 
            const nz = dz / dist;

            // Effective Properties
            const E1 = type === 'soil' ? soilE : strawE;
            const E2 = neighbor.type === 'soil' ? soilE : strawE;
            const E_star = (E1 * E2) / (E1 * (1 - 0.3*0.3) + E2 * (1 - 0.3*0.3)); 
            
            const R_eff = (radius * neighbor.radius) / (radius + neighbor.radius);
            const M_eff = (mass * neighbor.mass) / (mass + neighbor.mass);

            // Relative Velocity
            const dvx = vx - neighbor.vx;
            const dvy = vy - neighbor.vy;
            const dvz = vz - neighbor.vz;
            const vn = dvx * nx + dvy * ny + dvz * nz; 
            const vtx = dvx - vn * nx;
            const vty = dvy - vn * ny;
            const vtz = dvz - vn * nz;

            // Hertzian Normal Force
            let Fn = 0;
            if (overlap > 0) {
                const kn = 2 * E_star * Math.sqrt(R_eff * overlap);
                const cn = 2 * Math.sqrt(M_eff * kn) * dampFactor;
                Fn = (4/3) * E_star * Math.sqrt(R_eff) * Math.pow(overlap, 1.5) - (cn * vn);
            }

            // JKR Cohesion
            if (params.contactModel === 'JKR (Cohesive)' && type === 'soil' && neighbor.type === 'soil') {
                const surfaceEnergy = params.cohesionStrength * 0.2; 
                if (overlap > -radius * 0.1) {
                    const F_pull = -1.5 * Math.PI * R_eff * surfaceEnergy;
                    Fn += F_pull;
                }
            }

            // Tangential Force
            let Ft_x = 0, Ft_y = 0, Ft_z = 0;
            if (overlap > 0) {
                const kt = 8 * (E_star / (2 - 0.3)) * Math.sqrt(R_eff * overlap); 
                const F_t_trial = -kt * Math.sqrt(vtx*vtx + vty*vty + vtz*vtz) * TIME_STEP; 
                
                const mu = (type === 'straw' || neighbor.type === 'straw') ? mu_soil_straw : 0.5;
                const F_t_max = mu * Math.abs(Fn);
                const ratio = Math.abs(F_t_trial) > F_t_max ? F_t_max / Math.abs(F_t_trial) : 1;
                
                const vtMag = Math.sqrt(vtx*vtx + vty*vty + vtz*vtz);
                if (vtMag > 1e-6) {
                    Ft_x = -(vtx/vtMag) * Math.abs(F_t_trial) * ratio;
                    Ft_y = -(vty/vtMag) * Math.abs(F_t_trial) * ratio;
                    Ft_z = -(vtz/vtMag) * Math.abs(F_t_trial) * ratio;
                }
            }

            fx_pp += Fn * nx + Ft_x;
            fy_pp += Fn * ny + Ft_y;
            fz_pp += Fn * nz + Ft_z;
            
            if (Fn > 100) plasticStrain += Fn * 0.00001 * TIME_STEP;
        }
    }

    p.density = Math.min(1.0, localNeighborCount / 12);

    vx += (fx_pp / mass) * TIME_STEP;
    vy += (fy_pp / mass) * TIME_STEP;
    vz += (fz_pp / mass) * TIME_STEP;

    // --- 3. TOOL INTERACTION (REFINED) ---
    const dx = x - toolPos.x;
    const dz = z - toolPos.z;
    let hitTool = false;
    let toolFx = 0, toolFy = 0, toolFz = 0;
    
    // DIFFERENTIATE TOOL PHYSICS
    
    // A. Rotary Tiller (Refined Blade Logic)
    if (params.toolType === ToolType.ROTARY_TILLER) {
        // Use user-defined rotor radius
        const bladeRadius = params.rotorRadius || 245;
        const bladeCount = params.bladeCount || 6;
        const bladeAngle = params.bladeAngle || 45; // Currently unused in simplified 2D physics, but could affect side scatter
        
        // Check if particle is within the cutting cylinder
        if (Math.abs(dx) < bladeRadius && Math.abs(dz) < 300 && y < 200) {
             const distToAxis = Math.sqrt(dx*dx + (y - (150 - simDepth))**2);
             
             // Cutting edge check - simulate discrete blades
             // Calculate angle of particle relative to rotor axis
             const y_rel = y - (150 - simDepth);
             const x_rel = dx;
             const theta = Math.atan2(y_rel, x_rel);
             
             // Determine if a blade is currently at this angle
             // Rotor angle = omega * timeAccumulator
             const currentRotorAngle = (omega * timeAccumulator) % (2 * Math.PI);
             const angleBetweenBlades = (2 * Math.PI) / bladeCount;
             
             // Find the closest blade angle
             let minAngleDiff = Math.PI;
             for (let i = 0; i < bladeCount; i++) {
                 const bladeTheta = (currentRotorAngle + i * angleBetweenBlades) % (2 * Math.PI);
                 // Normalize angles to -PI to PI for comparison
                 let diff = Math.abs(theta - bladeTheta);
                 if (diff > Math.PI) diff = 2 * Math.PI - diff;
                 minAngleDiff = Math.min(minAngleDiff, diff);
             }
             
             // If particle is close to the outer radius AND close to a blade angle
             const bladeThicknessAngle = 0.15; // radians (~8.5 degrees)
             if (distToAxis < bladeRadius && distToAxis > bladeRadius - 30 && minAngleDiff < bladeThicknessAngle) {
                 hitTool = true;
                 
                 // Blade velocity vector at contact point
                 // V_blade = V_forward + V_rot
                 // Tangential velocity of blade tip: Vt = omega * R
                 const Vt = omega * (distToAxis / 1000); // m/s -> mm/s if not careful. omega is rad/s.
                 
                 // V_rot_x = -Vt * sin(theta) * 1000 (mm/s)
                 // V_rot_y = Vt * cos(theta) * 1000
                 const vRotX = -Vt * Math.sin(theta) * 1000;
                 const vRotY = Vt * Math.cos(theta) * 1000;
                 
                 const vBladeX = (params.forwardSpeed * 1000) + vRotX;
                 const vBladeY = vRotY;
                 
                 // Relative velocity
                 const vRelX = vx - vBladeX;
                 const vRelY = vy - vBladeY;
                 
                 // Force proportional to relative velocity (Damping/Cutting model)
                 // High stiffness for steel blade
                 const k_cut = 2500;
                 toolFx = -k_cut * vRelX * mass * TIME_STEP;
                 toolFy = -k_cut * vRelY * mass * TIME_STEP;
                 
                 // Centrifugal throw effect if lifting
                 if (vRotY > 0) {
                     toolFy += 2000 * mass; // Lift
                     toolFx += 800 * mass; // Throw back/forward depending on phase
                     // Side scatter influenced by blade angle
                     const scatterFactor = Math.sin(bladeAngle * Math.PI / 180);
                     toolFz += (rng.next() - 0.5) * 800 * mass * scatterFactor; 
                 }
                 
                 accumulatedTorque += Math.sqrt(toolFx*toolFx + toolFy*toolFy) * (distToAxis/1000);
             }
        }
    }
    // B. Moldboard Plough (Refined Draft & Inversion)
    else if (params.toolType === ToolType.MOLDBOARD_PLOUGH) {
         // Tool is essentially a moving inclined plane/curved surface
         // Bounding box for interaction
         if (Math.abs(dx) < 150 && Math.abs(dz) < 150 && y < 100 && y > -simDepth * 1.5) {
             
             // Simplistic Penetration Depth into the "Virtual Tool"
             // Assume tool leading edge is at toolPos.x
             // Tool surface slopes back: x_surface = toolPos.x + f(y, z)
             // simplified: penetration = (toolPos.x + offset) - x
             
             const penetration = (100 - dx); // Positive if behind leading edge
             
             if (penetration > 0) {
                 hitTool = true;
                 const k_n = 5000; // Stiffness
                 const Fn_mag = penetration * k_n * mass * 0.01; // Scaled normal force
                 
                 // Surface Normal Vector (approximating twisted moldboard)
                 // Low Z (Landside): Normal points mostly X/Y
                 // High Z (Wing): Normal points more Z (side throw)
                 // As Y increases (up the moldboard), Normal points more Z (inversion)
                 
                 // Base Normal (Shearing/Lifting)
                 let nx = -0.7; // Pushes forward (Draft)
                 let ny = 0.4;  // Lifts
                 let nz = 0.4;  // Side
                 
                 // Modify based on height (Inversion)
                 const heightFactor = (y + simDepth) / simDepth; // 0 at bottom, 1 at surface
                 nz += heightFactor * 0.5; // More side push at top
                 
                 // Normalize
                 const normLen = Math.sqrt(nx*nx + ny*ny + nz*nz);
                 nx /= normLen; ny /= normLen; nz /= normLen;
                 
                 // Normal Force Vector
                 const Fnx = nx * Fn_mag;
                 const Fny = ny * Fn_mag;
                 const Fnz = nz * Fn_mag;
                 
                 // Sliding Friction (Coulomb)
                 // Tangential velocity
                 const vRelX = vx - (params.forwardSpeed * 1000);
                 const vRelY = vy;
                 const vRelZ = vz;
                 const vRelMag = Math.sqrt(vRelX*vRelX + vRelY*vRelY + vRelZ*vRelZ);
                 
                 let Ftx = 0, Fty = 0, Ftz = 0;
                 if (vRelMag > 0.001) {
                    const Ft_mag = mu_soil_tool * Fn_mag;
                    // Oppose motion
                    Ftx = -(vRelX / vRelMag) * Ft_mag;
                    Fty = -(vRelY / vRelMag) * Ft_mag;
                    Ftz = -(vRelZ / vRelMag) * Ft_mag;
                 }
                 
                 toolFx = Fnx + Ftx;
                 toolFy = Fny + Fty;
                 toolFz = Fnz + Ftz;
                 
                 accumulatedForce += Fn_mag;
                 accumulatedDraft += Math.abs(toolFx); // Track X component specifically
             }
         }
    }
    // C. Chisel Plough
    else if (params.toolType === ToolType.CHISEL_PLOUGH) {
         if (Math.abs(dx) < 50 && Math.abs(dz % 100) < 20) { 
             if (y < 0 && y > -simDepth * 1.5) {
                 hitTool = true;
                 const Fn = 6000 * mass;
                 toolFx = Fn * 0.5;
                 toolFy = Fn * 0.8; // Strong vertical lift (loosening)
                 toolFz = (rng.next() - 0.5) * Fn * 0.2; 
                 accumulatedForce += Fn;
                 accumulatedDraft += Fn * 0.5;
             }
         }
    }
    // D. Trencher
    else if (params.toolType === ToolType.TRENCHING_DEVICE) {
        if (Math.abs(dx) < 80 && Math.abs(dz) < 40) {
             if (y < 20 && y > -simDepth * 1.5) {
                 hitTool = true;
                 const Fn = 7000 * mass;
                 toolFx = Fn * -0.2; 
                 toolFy = Fn * 1.5; 
                 toolFz = Fn * 1.0; 
                 accumulatedTorque += Fn;
             }
        }
    }

    if (hitTool) {
        movedParticles++;
        vx += (toolFx / mass) * TIME_STEP;
        vy += (toolFy / mass) * TIME_STEP;
        vz += (toolFz / mass) * TIME_STEP;
    }

    const totalFx = fx_pp + toolFx;
    const totalFy = fy_pp + toolFy;
    const totalFz = fz_pp + toolFz;
    forceMag = Math.sqrt(totalFx*totalFx + totalFy*totalFy + totalFz*totalFz);

    // --- 4. INTEGRATION & BOUNDARIES ---
    vy -= GRAVITY * TIME_STEP; 
    
    // Damping
    vx *= 0.98; vy *= 0.98; vz *= 0.98;
    
    x += vx * TIME_STEP;
    y += vy * TIME_STEP;
    z += vz * TIME_STEP;

    // Strict Soil Bin Box Walls
    const halfW = BOX_WIDTH / 2;
    const halfD = BOX_DEPTH / 2;

    if (y < -BOX_HEIGHT) { y = -BOX_HEIGHT; vy *= -0.3; } // Floor
    if (x < -halfW) { x = -halfW; vx *= -0.5; }
    if (x > halfW) { x = halfW; vx *= -0.5; }
    if (z < -halfD) { z = -halfD; vz *= -0.5; }
    if (z > halfD) { z = halfD; vz *= -0.5; }

    // Straw spreading control (Cover/Ceiling)
    // Simulates a physical cover over the tillage tool to keep straw in the mixing zone
    const strawCoverHeight = 150; // mm above surface
    if (p.type === 'straw' && y > strawCoverHeight) {
        y = strawCoverHeight;
        vy *= -0.5; // Bounce back down into the soil
        vx *= 0.8;  // Damping from hitting the cover
        vz *= 0.8;
    }

    p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz;
    p.force = forceMag;
    p.plasticStrain = Math.min(1.0, plasticStrain);
    
    // --- 5. STATS COLLECTION ---
    // Only count particles within the analysis horizontal zone (middle 400x200)
    if (Math.abs(x) < 200 && Math.abs(z) < 100) {
        const sIdx = getSectionIndex(y);
        const section = stats[sIdx];
        if (p.type === 'soil') section.soilCount++;
        else {
            section.strawCount++;
            if (p.subtype === 'rice') section.riceCount++;
            else if (p.subtype === 'wheat') section.wheatCount++;
        }
        if (p.type === 'straw' && y < -50) strawBuried++;
    }
    totalCompactionStrain += p.plasticStrain;
  });

  // --- OUTPUT CALCULATION ---
  const totalStraw = particles.filter(p => p.type === 'straw').length;
  const delta_s = (movedParticles / particles.length) * 100; 
  const eta_b = totalStraw > 0 ? (strawBuried / totalStraw) * 100 : 0; 
  const compactionIndex = particles.length > 0 ? (totalCompactionStrain / particles.length) * 100 : 0; 
  
  // Refined Draft Force reporting using accumulatedDraft if available, else fallback
  const draft_force_reported = accumulatedDraft > 0 ? (accumulatedDraft / 500) : (accumulatedForce / 500);
  
  const P_c = (draft_force_reported * params.forwardSpeed) + (accumulatedTorque * omega);
  
  const tensor: OutputTensor = {
    physical: { eta_b, delta_s, tau_max: draft_force_reported * 1.5, draft_force: draft_force_reported, compaction: compactionIndex, residueInterference: 0 },
    energetic: { P_c, E_spec: movedParticles > 0 ? P_c/movedParticles : 0, torque: accumulatedTorque },
    environmental: { C_disturb: delta_s * 0.8, E_vapor: delta_s * 0.5 }
  };

  const macro: MacroscopicState = {
    theta: params.soilMoisture,
    rho_b: params.soilProps.density / 1000,
    sigma_s: 0.4,
    G_eff: params.soilProps.shearModulus / 1e6
  };

  return { particles, tensor, macro, sectionStats: stats };
};
