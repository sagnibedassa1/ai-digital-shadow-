

import React, { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Calculator, TrendingUp, Sliders, Download, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { RSMCoefficients, OptimizationConstraints } from '../types';
import { solveOptimization, generateSurfaceData } from '../services/rsmMath';

// --- Default Coefficients (Based on Literature) ---
// Model: Y = b0 + b1*A + b2*B + b12*A*B + b11*A^2 + b22*B^2
const DEFAULT_BURIAL_COEFFS: RSMCoefficients = {
  b0: 88.5,  // Intercept
  b1: 4.2,   // Omega (Speed improves burial)
  b2: 2.1,   // Depth (Deeper improves burial)
  b12: 1.5,  // Interaction
  b11: -3.5, // Quadratic (Diminishing returns on speed)
  b22: -1.8  // Quadratic (Diminishing returns on depth)
};

const DEFAULT_POWER_COEFFS: RSMCoefficients = {
  b0: 45.0,
  b1: 5.5,   // Omega (High cost)
  b2: 8.0,   // Depth (Very high cost)
  b12: 1.2,
  b11: 0.5,
  b22: 2.5   // Quadratic (Exponential power rise with depth)
};

// --- 3D Surface Component ---
const ResponseSurface = ({ coeffs, colorStart, colorEnd, opacity = 1 }: { coeffs: RSMCoefficients, colorStart: string, colorEnd: string, opacity?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { data, resolution } = useMemo(() => generateSurfaceData(coeffs, 30), [coeffs]);
  
  // Create Geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 30, 30);
    const posAttribute = geo.attributes.position;
    
    // Deform plane based on Z value (which is Y in ThreeJS up-axis)
    // Map value range to height range (-5 to 10)
    const values = data.map(d => d.y);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal;

    for (let i = 0; i < posAttribute.count; i++) {
       const h = data[i].y;
       // Normalize height to display scale
       const y = ((h - minVal) / range) * 10 - 5; 
       posAttribute.setY(i, y);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [data]);

  // Vertex Colors
  useMemo(() => {
    const colors = [];
    const c1 = new THREE.Color(colorStart);
    const c2 = new THREE.Color(colorEnd);
    const count = geometry.attributes.position.count;
    
    for(let i=0; i<count; i++) {
        const y = geometry.attributes.position.getY(i);
        const normY = (y + 5) / 10; // 0 to 1
        const c = c1.clone().lerp(c2, normY);
        colors.push(c.r, c.g, c.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }, [geometry, colorStart, colorEnd]);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} wireframe={false} transparent opacity={opacity} metalness={0.2} roughness={0.5} />
    </mesh>
  );
};

const RSMOptimizer: React.FC = () => {
  const [burialCoeffs, setBurialCoeffs] = useState<RSMCoefficients>(DEFAULT_BURIAL_COEFFS);
  const [constraints, setConstraints] = useState<OptimizationConstraints>({ maxPower: 58, minBurial: 85 });
  const [viewMode, setViewMode] = useState<'burial' | 'power' | 'combined'>('burial');

  // Solve Optimization
  const { result, paretoPoints } = useMemo(() => 
    solveOptimization(burialCoeffs, DEFAULT_POWER_COEFFS, constraints), 
  [burialCoeffs, constraints]);

  // Optimal Point for Visualization (Normalized to 3D scene)
  const optimalPoint3D = useMemo(() => {
     if(!result.isFeasible) return null;
     const { omega, depth } = result.optimalVector;
     
     // Normalize like in the math service
     // Omega [180-350] -> [-10, 10]
     const x = ((omega - 180) / 170) * 20 - 10;
     // Depth [8-20] -> [-10, 10] (Mapped to Z in 3D)
     const z = ((depth - 8) / 12) * 20 - 10;
     
     // Get height
     const val = result.predicted.burialRate;
     // Map value to height (Approximate for visual placement relative to surface)
     // Need min/max of current surface to map accurately, calculating simply here
     const minVal = 80; const maxVal = 100; // Expected range
     const y = ((val - minVal) / (maxVal - minVal)) * 10 - 5;

     return new THREE.Vector3(x, y, z); // Note: In scene, Y is Up. Surface is rotated.
  }, [result]);

  return (
    <div className="h-full grid grid-cols-12 gap-6 p-1 overflow-hidden">
      
      {/* LEFT: Controls & Parameters */}
      <div className="col-span-12 lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-y-auto">
         <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Calculator className="text-agri-700" size={20} />
                Optimization Setup
            </h2>
            <p className="text-xs text-gray-500 mt-1">Define DEM-RSM constraints.</p>
         </div>

         <div className="p-5 space-y-6">
            
            {/* Constraints */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex justify-between">
                    <span>Max Power (Pc)</span>
                    <span className="text-red-600 font-mono">{constraints.maxPower} kW</span>
                </label>
                <input 
                    type="range" min="40" max="80" step="1"
                    value={constraints.maxPower}
                    onChange={(e) => setConstraints({...constraints, maxPower: Number(e.target.value)})}
                    className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Economy (40kW)</span>
                    <span>Heavy Duty (80kW)</span>
                </div>
            </div>

            {/* Model Tuning (Coefficients) - Simplified */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Sliders size={12} /> Model Tuning (β)
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Rotary Influence (β1)</span>
                        <input 
                            type="number" step="0.1"
                            value={burialCoeffs.b1}
                            onChange={(e) => setBurialCoeffs({...burialCoeffs, b1: Number(e.target.value)})}
                            className="w-16 p-1 text-right text-xs border rounded"
                        />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Depth Influence (β2)</span>
                        <input 
                            type="number" step="0.1"
                            value={burialCoeffs.b2}
                            onChange={(e) => setBurialCoeffs({...burialCoeffs, b2: Number(e.target.value)})}
                            className="w-16 p-1 text-right text-xs border rounded"
                        />
                    </div>
                </div>
                <button 
                    onClick={() => setBurialCoeffs(DEFAULT_BURIAL_COEFFS)}
                    className="mt-3 text-xs text-blue-600 flex items-center gap-1 hover:underline"
                >
                    <RotateCcw size={10} /> Reset Model
                </button>
            </div>

            {/* Optimal Solution Card */}
            <div className={`p-4 rounded-lg border ${result.isFeasible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                    {result.isFeasible ? <CheckCircle2 size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-red-600" />}
                    <span className={`font-bold text-sm ${result.isFeasible ? 'text-green-800' : 'text-red-800'}`}>
                        {result.isFeasible ? 'Optimal Solution Found' : 'Infeasible Region'}
                    </span>
                </div>
                
                {result.isFeasible && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Speed (ω*)</span>
                            <span className="font-mono font-bold">{result.optimalVector.omega} rpm</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Depth (d*)</span>
                            <span className="font-mono font-bold">{result.optimalVector.depth} cm</span>
                        </div>
                        <div className="border-t border-green-200 my-2 pt-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Burial (η)</span>
                                <span className="font-mono font-bold text-green-700">{result.predicted.burialRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Power (Pc)</span>
                                <span className="font-mono font-bold text-red-700">{result.predicted.power.toFixed(1)} kW</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <button className="w-full py-2 bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-slate-900 transition-colors">
                <Download size={16} /> Export Report (PDF)
            </button>
         </div>
      </div>

      {/* MIDDLE: 3D Visualization */}
      <div className="col-span-12 lg:col-span-6 bg-slate-900 rounded-xl shadow-inner border border-slate-800 relative overflow-hidden flex flex-col">
         <div className="absolute top-4 left-4 z-10">
            <h3 className="text-white font-bold text-lg drop-shadow-md">Response Surface (RSM)</h3>
            <p className="text-slate-400 text-xs">Interactive 3D View • η_b(ω, d)</p>
         </div>

         <div className="absolute top-4 right-4 z-10 flex gap-1">
             <button onClick={() => setViewMode('burial')} className={`px-3 py-1 text-xs rounded-l border border-slate-600 ${viewMode === 'burial' ? 'bg-agri-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Burial</button>
             <button onClick={() => setViewMode('power')} className={`px-3 py-1 text-xs border-y border-slate-600 ${viewMode === 'power' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Power</button>
             <button onClick={() => setViewMode('combined')} className={`px-3 py-1 text-xs rounded-r border border-slate-600 ${viewMode === 'combined' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Combined</button>
         </div>

         <Canvas 
            camera={{ position: [15, 12, 15], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ powerPreference: "high-performance", preserveDrawingBuffer: false }}
         >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />
            <Grid args={[20, 20]} cellSize={1} sectionSize={5} sectionColor="#475569" cellColor="#334155" position={[0, -5, 0]} />

            {/* Surfaces */}
            {(viewMode === 'burial' || viewMode === 'combined') && (
                <ResponseSurface 
                    coeffs={burialCoeffs} 
                    colorStart="#fef3c7" 
                    colorEnd="#15803d" 
                    opacity={viewMode === 'combined' ? 0.6 : 1} 
                />
            )}
            
            {(viewMode === 'power' || viewMode === 'combined') && (
                <ResponseSurface 
                    coeffs={DEFAULT_POWER_COEFFS} 
                    colorStart="#fee2e2" 
                    colorEnd="#b91c1c" 
                    opacity={viewMode === 'combined' ? 0.6 : 1}
                />
            )}

            {/* Optimal Point Marker */}
            {result.isFeasible && optimalPoint3D && (
                <group position={[optimalPoint3D.x, -2, optimalPoint3D.z]}>
                    <mesh position={[0, optimalPoint3D.y, 0]}>
                        <sphereGeometry args={[0.5]} />
                        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
                    </mesh>
                    <mesh position={[0, optimalPoint3D.y/2, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, optimalPoint3D.y]} />
                        <meshStandardMaterial color="white" opacity={0.5} transparent />
                    </mesh>
                    <Html position={[0, optimalPoint3D.y + 1, 0]} center>
                        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap backdrop-blur">
                            u* ({result.optimalVector.omega}, {result.optimalVector.depth})
                        </div>
                    </Html>
                </group>
            )}

            {/* Axes Labels */}
            <Html position={[11, -5, 0]}>
                <div className="text-slate-400 text-xs font-mono">X: Speed (ω)</div>
            </Html>
            <Html position={[0, -5, 11]}>
                <div className="text-slate-400 text-xs font-mono">Z: Depth (d)</div>
            </Html>
         </Canvas>
      </div>

      {/* RIGHT: Pareto & Stats */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto">
         
         {/* Pareto Chart */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 flex flex-col min-h-[250px]">
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-600" />
                Pareto Front
            </h3>
            <p className="text-[10px] text-gray-500 mb-4">Trade-off: Burial Efficiency vs Power Consumption</p>
            
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="power" name="Power" unit="kW" tick={{fontSize: 10}} label={{ value: 'Power (kW)', position: 'bottom', offset: 0, fontSize: 10 }} domain={[30, 90]} />
                        <YAxis type="number" dataKey="burial" name="Burial" unit="%" tick={{fontSize: 10}} label={{ value: 'Burial %', angle: -90, position: 'insideLeft', fontSize: 10 }} domain={[60, 100]} />
                        <ZAxis type="number" range={[50, 400]} />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{fontSize: '12px'}} />
                        <Scatter name="Design Points" data={paretoPoints} fill="#8884d8" shape="circle" fillOpacity={0.5} />
                        {result.isFeasible && (
                            <Scatter name="Optimal" data={[{ power: result.predicted.power, burial: result.predicted.burialRate }]} fill="#16a34a" shape="star" />
                        )}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
         </div>

         {/* ANOVA Summary (Static Demo) */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Model Statistics (ANOVA)</h3>
            <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-500">R² (Adj)</span>
                    <span className="font-bold text-gray-800">0.964</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-500">F-Value</span>
                    <span className="font-bold text-gray-800">124.5</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-500">p-value</span>
                    <span className="font-bold text-green-600">&lt; 0.0001</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">RMSE</span>
                    <span className="font-bold text-gray-800">2.14</span>
                </div>
            </div>
         </div>

      </div>

    </div>
  );
};

export default RSMOptimizer;
