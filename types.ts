
export enum ToolType {
  ROTARY_TILLER = 'Rotary Tiller',
  MOLDBOARD_PLOUGH = 'Moldboard Plough',
  CHISEL_PLOUGH = 'Chisel Plough',
  TRENCHING_DEVICE = 'Trenching Device',
  CUSTOM = 'Custom Import',
}

export type StrawRetentionModel = 
  | 'shallow_std' | 'shallow_film' | 'shallow_decomp'
  | 'conv_std' | 'conv_film' | 'conv_decomp'
  | 'deep_std' | 'deep_film'
  | 'even_std' | 'even_film' | 'even_decomp'
  | 'no_stubble_even';

export type SoilType = 'Clay Loam' | 'Sandy Loam' | 'Silt' | 'Heavy Clay';
export type StrawType = 'Rice' | 'Wheat' | 'Corn';

export type ColorMapMode = 'Type' | 'Velocity' | 'Force' | 'Stress' | 'Strain' | 'Compaction' | 'BurialDepth' | 'VolumeFraction';

export type ParticleShape = 'Spherical' | 'Multi-Sphere Clump' | 'Polyhedral';
export type ContactModel = 'Hertz-Mindlin' | 'Linear Spring' | 'JKR (Cohesive)';

export type SimulationEngine = 'DEM' | 'AI_SURROGATE';

export interface MaterialProperties {
  poissonRatio: number;
  shearModulus: number; // Pa
  density: number; // kg/m3
}

export interface InteractionProperties {
  restitutionCoeff: number; // Soil-Soil
  staticFrictionSoilStraw: number;
  staticFrictionSoilTool: number;
  rollingFrictionStrawTool: number;
}

export interface SimulationParams {
  retentionModel: StrawRetentionModel;
  toolType: ToolType;
  customModelUrl?: string; // URL for uploaded CAD model
  depth: number; // cm (d)
  forwardSpeed: number; // m/s (v)
  rotarySpeed: number; // rpm (omega)
  strawDensity: number; // kg/m3 (Bulk density for generation)
  soilMoisture: number; // %
  soilType: SoilType;
  strawType: StrawType; // New: Crop specific modeling
  colorMap: ColorMapMode;
  isRunning: boolean;
  simulationEngine: SimulationEngine; // New: Engine Selector
  useCloudCompute: boolean; // New: Cloud offload
  
  // Rotovator specific parameters
  rotorRadius: number; // mm
  bladeCount: number;
  bladeAngle: number; // degrees
  bladeClearance: number; // mm (distance between blades and shield)
  bladeShape: 'C-shaped' | 'L-shaped' | 'J-shaped'; // Common rotovator blade shapes

  // Advanced DEM Parameters
  particleShape: ParticleShape;
  contactModel: ContactModel;
  interParticleFriction: number; // Generic/Fallback
  
  // Real Environment Material Props
  soilProps: MaterialProperties;
  strawProps: MaterialProperties;
  interactions: InteractionProperties;

  // Soil Mechanics (Mohr-Coulomb & Breakage)
  enableBreakage: boolean;
  cohesionStrength: number; // kPa (c)
  internalFrictionAngle: number; // Degrees (phi)
  breakageThreshold: number; // Force unit threshold
  
  // AI/Cloud Integration
  activeModelId?: string; // ID of the trained model being used
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  type: 'soil' | 'straw' | 'dust';
  subtype?: 'rice' | 'wheat' | 'corn'; // For visualization distinction
  radius: number;
  rotation: number;
  mass: number;
  friction: number;
  force: number; // For visualization
  density: number; // 0-1 normalized volume fraction approximation
  
  // Advanced Physics State
  isAgglomerate: boolean; // Is this a breakable soil clod?
  plasticStrain: number; // Accumulation of deformation
  
  // Bonded Particle Model (BPM) for Straw/Clumps
  bonds?: number[]; // IDs of connected particles
}

// --- NEW STATE-SPACE TYPES ---

export interface SectionStat {
  id: number; // 1 to 5
  label: string;
  soilCount: number;
  strawCount: number;
  riceCount: number;
  wheatCount: number;
  avgDepth: number;
}

// Macroscopic Continuum State Vector (x_M)
export interface MacroscopicState {
  theta: number;   // Soil Moisture
  rho_b: number;   // Bulk Density (kg/m3)
  sigma_s: number; // Straw Areal Density (kg/m2)
  G_eff: number;   // Effective Shear Modulus (MPa)
}

// Output Measurement Tensor (Y)
export interface OutputTensor {
  physical: {
    eta_b: number;   // Straw Burial Rate (%)
    delta_s: number; // Soil Disturbance (%)
    tau_max: number; // Max Shear Stress (kPa)
    draft_force: number; // Draft Force (kN)
    compaction: number; // Soil Compaction Index (0-100)
    residueInterference: number; // Straw wrapping/clogging index (0-100)
  };
  energetic: {
    P_c: number;    // Power Consumption (W)
    E_spec: number; // Specific Energy (J/m3)
    torque: number; // Torque (Nm)
  };
  environmental: {
    C_disturb: number; // Carbon Disturbance Potential (index)
    E_vapor: number;   // Evaporation Potential (index)
  };
}

// Combined Simulation State
export interface SimulationState {
  macro: MacroscopicState;
  tensor: OutputTensor;
  sectionStats: SectionStat[]; // Added for vertical distribution analysis
  feasibility: {
    isFeasible: boolean;
    reason?: string;
  };
}

export interface HistoricalDataPoint {
  id?: number | string; // Optional ID for tracking
  time: string;
  disturbance: number;
  incorporation: number;
  power: number; // Added to history
  compaction: number; // New metric
}

// ... [Rest of the file remains unchanged] ...
// --- AI Decision Support Types ---

export interface SensorData {
  timestamp: string;
  moisture: number;
  temp: number;
  soc: number;
  residue: number;
}

export type ServiceStatus = 'operational' | 'degraded' | 'down' | 'connecting';

export interface MicroserviceHealth {
  userMgmt: ServiceStatus;
  dataIngestion: ServiceStatus;
  advisoryEngine: ServiceStatus;
  simulationDB: ServiceStatus;
}

export interface FieldState {
  soilMoisture: number;
  residueLoad: number;
  residueDensity: number;
  soilType: SoilType;
}

export interface ControlVector {
  v: number;
  omega: number;
  d: number;
}

export interface EnsemblePrediction {
  baseLearners: {
    ann: number;
    rf: number;
    svm: number;
  };
  metaLearner: number;
  confidence: number;
}

export interface DecisionMatrixItem {
  id: number;
  technique: string;
  controlVector: ControlVector;
  burialRate: number;
  powerConsumption: number;
  ghgEmissions: number;
  score: number;
  explanation: string; // New field for AI reasoning
  advisory?: {
    optimalDecompositionTime: string;
    incorporationMethod: string;
    actionableAdvice: string;
  };
}

// --- RSM & OPTIMIZATION TYPES ---

export interface RSMCoefficients {
  b0: number; // Intercept
  b1: number; // Omega (Linear)
  b2: number; // Depth (Linear)
  b12: number; // Interaction (Omega * Depth)
  b11: number; // Omega^2 (Quadratic)
  b22: number; // Depth^2 (Quadratic)
}

export interface OptimizationResult {
  optimalVector: {
    omega: number;
    depth: number;
  };
  predicted: {
    burialRate: number;
    power: number;
  };
  isFeasible: boolean;
}

export interface OptimizationConstraints {
  maxPower: number; // Watts
  minBurial: number; // %
}

// --- ANALYTICS TYPES ---

export interface AnalyticReport {
  id: string;
  timestamp: string;
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  predictionAccuracy: number;
}

export interface ScenarioSuggestion {
  id: string;
  name: string;
  description: string;
  params: Partial<SimulationParams>;
  predictedOutcome: string;
}

// --- USER PROFILE & SETTINGS TYPES ---

export interface UserSettings {
  profile: {
    name: string;
    role: string;
    organization: string;
    bio: string;
  };
  preferences: {
    units: 'Metric (SI)' | 'Imperial';
    language: 'English (US)' | 'Chinese (Simplified)';
    theme: 'Light' | 'Dark' | 'System';
  };
  defaults: {
    soilType: SoilType;
    simulationQuality: 'Low (Fast)' | 'Medium' | 'High (Accurate)';
  };
  notifications: {
    batchComplete: boolean;
    calibrationAlerts: boolean;
    systemUpdates: boolean;
    emailDigest: boolean;
  };
}

export interface SavedParameterSet {
  id: string;
  name: string;
  tags: string[];
  lastModified: string;
  params: Partial<SimulationParams>;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'CSV' | 'API' | 'Manual' | 'JSON';
  status: 'Connected' | 'Error' | 'Syncing';
  lastSync: string;
}

// --- LIVE MONITORING TYPES ---

export interface MonitoringAlert {
  id: string;
  message: string;
  suggestedAction?: string;
  severity?: 'low' | 'medium' | 'high';
  timestamp?: string;
}

export interface LiveMetrics {
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ERROR';
  totalBatchItems: number;
  currentBatchItem: number;
  batchProgress: number; // 0 - 100
  tps: number; // Time steps per second
  stabilityIndex: number; // 0 - 100
  computeLoad: number; // 0 - 100
  anomalies: MonitoringAlert[];
}

// --- PROJECT MANAGEMENT TYPES ---

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface Comment {
  id: string;
  author: string; // name
  text: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  status: string;
  simulations: number;
  members: TeamMember[];
  comments: Comment[];
}

// --- AI MODEL TRAINING TYPES ---

export interface TrainedModel {
  id: string;
  name: string;
  type: 'Soil' | 'Straw' | 'Interaction';
  baseSoilType?: SoilType;
  trainingDatasets: string[]; // IDs of DataSources
  accuracy: number;
  lastTrained: string;
  status: 'Ready' | 'Training' | 'Needs Fine-tuning';
  description: string;
}

// --- CLOUD COMPUTING TYPES ---

export interface CloudJob {
  id: string;
  name: string;
  type: 'Batch Simulation' | 'Model Training' | 'Parameter Sweep';
  status: 'Queued' | 'Running' | 'Completed' | 'Failed';
  progress: number;
  submittedAt: string;
  estimatedCompletion: string;
  resources: string; // e.g. "GPU Cluster A (8x A100)"
  resultUrl?: string;
}
