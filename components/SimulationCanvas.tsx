
import React, { useRef, useEffect, useState, useMemo, useLayoutEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Center, Stars, BakeShadows, Text, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Particle, SimulationParams, ToolType, OutputTensor, MacroscopicState, SectionStat } from '../types';
import { initializeParticles, updatePhysics, resetSimulation, resetRNG } from '../services/physicsEngine';
import { CloudLightning, Layers, Eye, EyeOff, Wind, Pipette } from 'lucide-react';

interface Props {
  params: SimulationParams;
  onMetricsUpdate: (tensor: OutputTensor, macro: MacroscopicState, stats: SectionStat[]) => void;
  onParamChange: (updates: Partial<SimulationParams>) => void;
}

// --- HIGH FIDELITY MATERIALS (EDEM 2026 Style) ---
const Materials = {
    Steel: new THREE.MeshStandardMaterial({
        color: '#64748b',
        metalness: 0.9,
        roughness: 0.25,
        envMapIntensity: 1.5,
    }),
    PaintRed: new THREE.MeshPhysicalMaterial({
        color: '#b91c1c',
        metalness: 0.4,
        roughness: 0.2,
        envMapIntensity: 1.2,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1
    }),
    PaintYellow: new THREE.MeshStandardMaterial({
        color: '#facc15',
        metalness: 0.5,
        roughness: 0.3,
        envMapIntensity: 1.2,
    }),
    WearPart: new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        metalness: 0.6,
        roughness: 0.4,
        envMapIntensity: 1.0,
    }),
    // Section Materials (Semi-transparent)
    Section1: new THREE.MeshStandardMaterial({ color: '#f97316', transparent: true, opacity: 0.3, roughness: 0.8, depthWrite: false, side: THREE.DoubleSide }),
    Section2: new THREE.MeshStandardMaterial({ color: '#dc2626', transparent: true, opacity: 0.3, roughness: 0.8, depthWrite: false, side: THREE.DoubleSide }),
    Section3: new THREE.MeshStandardMaterial({ color: '#facc15', transparent: true, opacity: 0.3, roughness: 0.8, depthWrite: false, side: THREE.DoubleSide }),
    Section4: new THREE.MeshStandardMaterial({ color: '#06b6d4', transparent: true, opacity: 0.3, roughness: 0.8, depthWrite: false, side: THREE.DoubleSide }),
    Section5: new THREE.MeshStandardMaterial({ color: '#1e3a8a', transparent: true, opacity: 0.4, roughness: 0.8, depthWrite: false, side: THREE.DoubleSide }),
    Wireframe: new THREE.LineBasicMaterial({ color: '#94a3b8', linewidth: 1 }),
    EngineeringWireframe: new THREE.LineBasicMaterial({ color: '#000000', linewidth: 2 })
};

// --- Dimension Helper Component ---
const DimensionLine = ({ start, end, label, offset = 0, color="white" }: { start: [number, number, number], end: [number, number, number], label: string, offset?: number, color?: string }) => {
    const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
    const mid = useMemo(() => new THREE.Vector3().addVectors(points[0], points[1]).multiplyScalar(0.5), [points]);
    mid.y += offset;

    return (
        <group>
            <Line points={points} color={color} lineWidth={1} dashed dashScale={5} opacity={0.5} transparent />
            <Text position={mid} fontSize={14} color={color} anchorX="center" anchorY="middle" outlineWidth={color === 'white' ? 1 : 0} outlineColor="#000000">
                {label}
            </Text>
        </group>
    );
};

// --- Soil Bin Structure Component ---
const SoilBinStructure = ({ visibility, mode }: { visibility: Record<string, boolean>, mode: string }) => {
    const BIN_L = 1200;
    const BIN_W = 600;
    const BIN_H = 250;
    const ZONE_L = 400;
    const ZONE_W = 200;
    const ZONE_H = 180;
    const SEC_H = ZONE_H / 5;

    const isEngMode = mode === 'VolumeFraction';
    const wireColor = isEngMode ? "black" : "#94a3b8";
    const dimColor = isEngMode ? "black" : "white";

    return (
        <group>
            {/* 1. Outer Bin Wireframe */}
            {visibility.outerBin && (
                <group>
                    <mesh position={[0, -BIN_H/2, 0]}>
                        <boxGeometry args={[BIN_L, BIN_H, BIN_W]} />
                        <meshBasicMaterial color={wireColor} wireframe transparent opacity={isEngMode ? 0.8 : 0.3} />
                    </mesh>
                    <DimensionLine start={[-BIN_L/2, -BIN_H - 40, BIN_W/2]} end={[BIN_L/2, -BIN_H - 40, BIN_W/2]} label="1200" color={dimColor} />
                    <DimensionLine start={[BIN_L/2 + 40, -BIN_H - 40, -BIN_W/2]} end={[BIN_L/2 + 40, -BIN_H - 40, BIN_W/2]} label="600" color={dimColor} />
                    <DimensionLine start={[-BIN_L/2 - 40, 0, -BIN_W/2]} end={[-BIN_L/2 - 40, -BIN_H, -BIN_W/2]} label="250" color={dimColor} />
                </group>
            )}

            {/* 2. Vertical Sections (Hidden in Engineering Mode to match Volume Fraction Look) */}
            {!isEngMode && (
            <group position={[0, -20, 0]}>
                {visibility.sec1 && (
                    <group position={[0, -SEC_H/2, 0]}>
                        <mesh receiveShadow><boxGeometry args={[ZONE_L, SEC_H, ZONE_W]} /><primitive object={Materials.Section1} /></mesh>
                        <Text position={[ZONE_L/2 + 60, 0, ZONE_W/2]} fontSize={12} color="#f97316" anchorX="left">Section 1</Text>
                    </group>
                )}
                {visibility.sec2 && (
                    <group position={[0, -SEC_H * 1.5, 0]}>
                        <mesh receiveShadow><boxGeometry args={[ZONE_L, SEC_H, ZONE_W]} /><primitive object={Materials.Section2} /></mesh>
                        <Text position={[ZONE_L/2 + 60, 0, ZONE_W/2]} fontSize={12} color="#dc2626" anchorX="left">Section 2</Text>
                    </group>
                )}
                {visibility.sec3 && (
                    <group position={[0, -SEC_H * 2.5, 0]}>
                        <mesh receiveShadow><boxGeometry args={[ZONE_L, SEC_H, ZONE_W]} /><primitive object={Materials.Section3} /></mesh>
                        <Text position={[ZONE_L/2 + 60, 0, ZONE_W/2]} fontSize={12} color="#facc15" anchorX="left">Section 3</Text>
                    </group>
                )}
                {visibility.sec4 && (
                    <group position={[0, -SEC_H * 3.5, 0]}>
                        <mesh receiveShadow><boxGeometry args={[ZONE_L, SEC_H, ZONE_W]} /><primitive object={Materials.Section4} /></mesh>
                        <Text position={[ZONE_L/2 + 60, 0, ZONE_W/2]} fontSize={12} color="#06b6d4" anchorX="left">Section 4</Text>
                    </group>
                )}
                {visibility.sec5 && (
                    <group position={[0, -SEC_H * 4.5, 0]}>
                        <mesh receiveShadow><boxGeometry args={[ZONE_L, SEC_H, ZONE_W]} /><primitive object={Materials.Section5} /></mesh>
                        <Text position={[ZONE_L/2 + 60, 0, ZONE_W/2]} fontSize={12} color="#1e3a8a" anchorX="left">Section 5</Text>
                    </group>
                )}
                {Object.values(visibility).some(v => v) && (
                    <group>
                        <DimensionLine start={[-ZONE_L/2, 20, -ZONE_W/2]} end={[ZONE_L/2, 20, -ZONE_W/2]} label="400" />
                        <DimensionLine start={[ZONE_L/2 + 20, 20, -ZONE_W/2]} end={[ZONE_L/2 + 20, 20, ZONE_W/2]} label="200" />
                        <DimensionLine start={[-ZONE_L/2 - 20, 0, ZONE_W/2 + 20]} end={[-ZONE_L/2 - 20, -ZONE_H, ZONE_W/2 + 20]} label="180" />
                    </group>
                )}
            </group>
            )}
        </group>
    );
};

const CustomToolModel = ({ url, position, rotation }: { url: string, position: THREE.Vector3, rotation: number }) => {
    const { scene } = useGLTF(url);
    const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
    
    const clonedScene = useMemo(() => {
        const s = scene.clone();
        s.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
                obj.frustumCulled = false;
                
                const mat = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (!mat.map && (mat.color.getHex() === 0xffffff || mat.name.includes('Default'))) {
                     (obj as THREE.Mesh).material = Materials.Steel;
                } else if (mat.isMeshStandardMaterial) {
                    mat.envMapIntensity = 1.5;
                    mat.metalness = Math.max(mat.metalness, 0.6);
                    mat.roughness = Math.min(mat.roughness, 0.4);
                    mat.needsUpdate = true;
                }
            }
        });
        return s;
    }, [scene]);

    useLayoutEffect(() => {
        const box = new THREE.Box3().setFromObject(clonedScene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
            const targetSize = 350; 
            const scaleFactor = targetSize / maxDim;
            setScale([scaleFactor, scaleFactor, scaleFactor]);
        }
    }, [clonedScene]);

    return (
        <group position={position} rotation={[rotation, 0, 0]} frustumCulled={false}>
            <Center top><primitive object={clonedScene} scale={scale} /></Center>
        </group>
    );
};

// --- PROCEDURAL TOOL MODELS ---
const ToolModel = ({ type, position, rotation, customModelUrl }: { type: ToolType, position: THREE.Vector3, rotation: number, customModelUrl?: string }) => {
    if (type === ToolType.CUSTOM && customModelUrl) {
        return (
            <Suspense fallback={<mesh position={position}><boxGeometry args={[100, 100, 100]} /><meshBasicMaterial color="gray" wireframe/></mesh>}>
               <CustomToolModel url={customModelUrl} position={position} rotation={rotation} />
            </Suspense>
        )
    }

    const S = 1; // Scaling factor for visual clarity within the box

    return (
        <group position={position} frustumCulled={false} scale={[S, S, S]}>
            
            {/* 1. ROTARY TILLER MODEL */}
            {type === ToolType.ROTARY_TILLER && (
                <group>
                    {/* Main Shaft */}
                    <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={Materials.Steel}>
                        <cylinderGeometry args={[8, 8, 240, 32]} />
                    </mesh>
                    {/* Flanges & Blades */}
                    <group rotation={[rotation, 0, 0]}>
                        {Array.from({ length: 7 }).map((_, i) => (
                            <group key={i} position={[(i - 3) * 35, 0, 0]} rotation={[0, 0, i * (Math.PI / 3)]}>
                                <mesh rotation={[0,0,Math.PI/2]} material={Materials.PaintRed}><cylinderGeometry args={[12, 12, 4, 24]} /></mesh>
                                {/* Blades (L-Shape) */}
                                {[0, Math.PI].map((angle, j) => (
                                    <group key={j} rotation={[angle, 0, 0]}>
                                        <mesh position={[0, 45, 0]} castShadow material={Materials.Steel}><boxGeometry args={[3, 80, 5]} /></mesh>
                                        <mesh position={[0, 85, 10]} rotation={[0.4, 0, 0]} castShadow material={Materials.WearPart}><boxGeometry args={[3, 20, 25]} /></mesh>
                                    </group>
                                ))}
                            </group>
                        ))}
                    </group>
                    {/* Cover/Hood */}
                    <mesh position={[0, 80, -30]} rotation={[0.2, 0, 0]} receiveShadow material={Materials.PaintRed} castShadow={false}>
                        <cylinderGeometry args={[100, 100, 260, 32, 1, false, Math.PI, Math.PI]} />
                    </mesh>
                </group>
            )}

            {/* 2. MOLDBOARD PLOUGH MODEL */}
            {type === ToolType.MOLDBOARD_PLOUGH && (
                <group rotation={[0, -Math.PI/2, 0]} position={[0, 50, 0]}>
                     {/* Frame */}
                    <mesh position={[0, 100, 0]} rotation={[0,0, -0.1]} material={Materials.Steel} castShadow>
                         <boxGeometry args={[20, 20, 300]} />
                    </mesh>
                    
                    {/* Plough Body 1 */}
                    <group position={[0, 0, -50]}>
                        {/* Share */}
                        <mesh position={[10, -50, 20]} rotation={[0, 0.5, 0.2]} material={Materials.WearPart} castShadow>
                             <boxGeometry args={[80, 10, 30]} />
                        </mesh>
                        {/* Moldboard (Curved Surface Simulation) */}
                        <mesh position={[-10, -10, 10]} rotation={[0, 0.5, -0.4]} material={Materials.PaintRed} castShadow>
                             <cylinderGeometry args={[40, 60, 90, 32, 1, true, 0, Math.PI/1.5]} />
                        </mesh>
                        {/* Landside */}
                         <mesh position={[-20, -40, -10]} material={Materials.Steel}><boxGeometry args={[60, 30, 5]} /></mesh>
                    </group>

                    {/* Plough Body 2 */}
                    <group position={[50, 0, 80]}>
                        <mesh position={[10, -50, 20]} rotation={[0, 0.5, 0.2]} material={Materials.WearPart} castShadow>
                             <boxGeometry args={[80, 10, 30]} />
                        </mesh>
                        <mesh position={[-10, -10, 10]} rotation={[0, 0.5, -0.4]} material={Materials.PaintRed} castShadow>
                             <cylinderGeometry args={[40, 60, 90, 32, 1, true, 0, Math.PI/1.5]} />
                        </mesh>
                    </group>
                </group>
            )}

            {/* 3. CHISEL PLOUGH MODEL */}
            {type === ToolType.CHISEL_PLOUGH && (
                <group position={[0, 40, 0]}>
                    {/* Main Frame */}
                    <mesh position={[0, 80, 0]} material={Materials.PaintYellow} castShadow>
                         <boxGeometry args={[300, 15, 15]} />
                    </mesh>
                    
                    {/* Tines */}
                    {[-100, 0, 100].map((x, i) => (
                        <group key={i} position={[x, 0, (i%2)*40]}>
                            {/* Shank (Curved) */}
                            <mesh position={[0, 20, 0]} rotation={[0.2, 0, 0]} material={Materials.Steel} castShadow>
                                <boxGeometry args={[12, 120, 12]} />
                            </mesh>
                            {/* Point */}
                            <mesh position={[0, -40, 10]} rotation={[0.8, 0, 0]} material={Materials.WearPart} castShadow>
                                <boxGeometry args={[15, 30, 8]} />
                            </mesh>
                            {/* Spring Pack */}
                            <mesh position={[0, 70, -15]} material={Materials.Steel}>
                                <cylinderGeometry args={[8, 8, 30]} />
                            </mesh>
                        </group>
                    ))}
                </group>
            )}

            {/* 4. TRENCHING DEVICE MODEL */}
            {type === ToolType.TRENCHING_DEVICE && (
                <group position={[0, 30, 0]} rotation={[0, Math.PI/2, 0]}>
                     {/* Main Wheel / Chain Drive */}
                     <group rotation={[0, 0, -rotation*0.5]}>
                        <mesh rotation={[Math.PI/2, 0, 0]} material={Materials.PaintRed} castShadow>
                            <cylinderGeometry args={[90, 90, 20, 32]} />
                        </mesh>
                        {/* Teeth */}
                        {Array.from({length: 12}).map((_, i) => (
                            <mesh key={i} position={[Math.cos(i*Math.PI/6)*90, Math.sin(i*Math.PI/6)*90, 0]} rotation={[0, 0, i*Math.PI/6]} material={Materials.WearPart} castShadow>
                                <boxGeometry args={[15, 15, 25]} />
                            </mesh>
                        ))}
                     </group>
                     {/* Frame Arm */}
                     <mesh position={[-80, 40, 0]} rotation={[0, 0, 0.3]} material={Materials.Steel}>
                         <boxGeometry args={[180, 20, 10]} />
                     </mesh>
                     {/* Conveyor/Auger for spoil */}
                     <mesh position={[0, 0, 50]} rotation={[0, 0, Math.PI/2]} material={Materials.Steel}>
                         <cylinderGeometry args={[15, 15, 120, 16]} />
                     </mesh>
                </group>
            )}
        </group>
    );
};

const SimulationScene = ({ params, onMetricsUpdate, visibility }: Props & { visibility: any }) => {
  const particlesRef = useRef<Particle[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const toolPosRef = useRef(new THREE.Vector3(-600, 0, 0)); 
  const timeRef = useRef(0);
  const lastMetricsUpdateRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []); 

  // --- Extended Color Palette ---
  const colors = useMemo(() => ({
      soil: new THREE.Color('#5d4037'),
      soilClod: new THREE.Color('#3e2723'),
      riceStraw: new THREE.Color('#e4d5b7'),
      wheatStraw: new THREE.Color('#fbbf24'),
      dust: new THREE.Color('#d2b48c'), // Light brown for dust
      velLow: new THREE.Color('#3b82f6'),
      velHigh: new THREE.Color('#ef4444'),
      contactHighlight: new THREE.Color('#ffffff')
  }), []);

  useEffect(() => {
    resetRNG(); 
    resetSimulation(); 
    particlesRef.current = initializeParticles(
        2500, 
        params.strawDensity / 200, 
        params.soilType, 
        params.soilMoisture,
        params
    );
    toolPosRef.current.set(-600, 0, 0); 
    
    if (meshRef.current) {
        updateMeshInstances(particlesRef.current);
    }
  }, [
      params.strawDensity, 
      params.soilType, 
      params.toolType, 
      params.strawType,
      params.soilProps.density,
      params.strawProps.density
  ]); 

  const updateMeshInstances = (particles: Particle[]) => {
      if (!meshRef.current) return;
      
      const maxInstances = meshRef.current.instanceMatrix.array.length / 16;
      let index = 0;
      particles.forEach((p) => {
        if (index >= maxInstances) return; // Safety check
        if (p.type === 'soil' && !visibility.showSoil) return;
        if (p.type === 'dust' && !visibility.showDust) return;
        if (p.type === 'straw') {
            if (p.subtype === 'rice' && !visibility.showRice) return;
            if (p.subtype === 'wheat' && !visibility.showWheat) return;
        }

        dummy.position.set(p.x, p.y, p.z);
        if (p.type === 'straw') {
            const lenScale = p.subtype === 'wheat' ? 8 : 6;
            dummy.scale.set(p.radius, p.radius, p.radius * lenScale); 
            dummy.rotation.set(p.rotation, Math.PI/2, 0);
        } else if (p.type === 'dust') {
            const vel = Math.sqrt(p.vx*p.vx + p.vy*p.vy + p.vz*p.vz);
            if (vel < 50 && p.y < 20) {
                // Settled dust: flatter and wider
                dummy.scale.set(p.radius * 1.8, p.radius * 0.3, p.radius * 1.8);
                dummy.rotation.set(0, p.rotation, 0);
            } else {
                // Airborne dust
                dummy.scale.set(p.radius, p.radius, p.radius);
                dummy.rotation.set(0,0,0);
            }
        } else {
            dummy.scale.set(p.radius, p.radius, p.radius);
            dummy.rotation.set(0,0,0);
        }

        // --- COLOR LOGIC ---
        if (params.colorMap === 'VolumeFraction') {
            // Rainbow Gradient (Blue -> Cyan -> Green -> Yellow -> Red)
            const t = p.density;
            tempColor.setHSL(0.66 * (1.0 - t), 1.0, 0.5); // HSL trick for rainbow: Blue(0.66) -> Red(0.0)
            meshRef.current!.setColorAt(index, tempColor);
        } else if (params.colorMap === 'BurialDepth') {
             if (p.type === 'soil' || p.type === 'dust') {
                 // Ghosting soil to show straw layers
                 tempColor.set('#1e293b'); // Dark Slate
                 const s = p.radius * 0.3; // Shrink soil to allow seeing straw
                 dummy.scale.set(s, s, s);
                 meshRef.current!.setColorAt(index, tempColor);
             } else {
                 // Straw Depth Gradient: Red (Surface) -> Yellow -> Green (Deep)
                 // Y Range: +20mm (Surface) to -200mm (Deep)
                 const val = Math.max(-200, Math.min(20, p.y));
                 const t = (20 - val) / 220; // 0 (Surface) to 1 (Deep)
                 // Hue: 0 (Red) -> 120 (Green)
                 tempColor.setHSL(t * 0.33, 1.0, 0.5); 
                 meshRef.current!.setColorAt(index, tempColor);
             }
        } else if (params.colorMap === 'Type') {
            let base = colors.soil;
            if (p.type === 'straw') {
                base = p.subtype === 'rice' ? colors.riceStraw : colors.wheatStraw;
            } else if (p.type === 'dust') {
                const vel = Math.sqrt(p.vx*p.vx + p.vy*p.vy + p.vz*p.vz);
                if (vel < 50 && p.y < 20) {
                    // Blend with soil when settled
                    tempColor.copy(colors.dust).lerp(colors.soil, 0.6);
                    base = tempColor;
                } else {
                    base = colors.dust;
                }
            } else if (p.isAgglomerate) {
                base = colors.soilClod;
            }
            if (visibility.showContacts && p.force > 50) {
                const intensity = Math.min(1, (p.force - 50) / 200);
                tempColor.copy(base).lerp(colors.contactHighlight, intensity);
                meshRef.current!.setColorAt(index, tempColor);
            } else {
                meshRef.current!.setColorAt(index, base);
            }
        } else if (params.colorMap === 'Velocity') {
            const vel = Math.sqrt(p.vx*p.vx + p.vy*p.vy + p.vz*p.vz) / 1000;
            tempColor.copy(colors.velLow).lerp(colors.velHigh, Math.min(1, vel));
            meshRef.current!.setColorAt(index, tempColor);
        }

        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(index, dummy.matrix);

        index++;
      });
      
      meshRef.current.count = index; 
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  };

  useFrame((state, delta) => {
    if (!params.isRunning) return;

    const dt = 0.016; 
    const speed = params.forwardSpeed * 1000 * dt; 
    toolPosRef.current.x += speed;
    if (toolPosRef.current.x > 600) toolPosRef.current.x = -600; 

    timeRef.current += dt;
    
    // In AI Surrogate Mode, we skip heavy physics calculation for particles
    // but still animate the tool for visual reference
    if (params.simulationEngine === 'DEM') {
        const { particles: nextParticles, tensor, macro, sectionStats } = updatePhysics(
            particlesRef.current, 
            params, 
            {x: toolPosRef.current.x, y: toolPosRef.current.y, z: toolPosRef.current.z}
        );
        
        particlesRef.current = nextParticles;
        updateMeshInstances(nextParticles);

        if (state.clock.elapsedTime - lastMetricsUpdateRef.current > 0.2) {
            lastMetricsUpdateRef.current = state.clock.elapsedTime;
            onMetricsUpdate(tensor, macro, sectionStats);
        }
    }
  });

  const toolRotation = (timeRef.current * params.rotarySpeed) / 10;
  
  // Dynamic Y offset based on tool type to interact with surface
  let toolY = 0;
  if (params.toolType === ToolType.ROTARY_TILLER) toolY = 150 - (params.depth * 10);
  else if (params.toolType === ToolType.MOLDBOARD_PLOUGH) toolY = 0 - (params.depth * 10);
  else if (params.toolType === ToolType.CHISEL_PLOUGH) toolY = 50 - (params.depth * 10);
  else if (params.toolType === ToolType.TRENCHING_DEVICE) toolY = 80 - (params.depth * 10);

  return (
    <>
      <BakeShadows />
      <ambientLight intensity={params.colorMap === 'VolumeFraction' ? 1.0 : 0.8} color={params.colorMap === 'VolumeFraction' ? "#ffffff" : "#e0f2fe"} />
      <directionalLight 
        position={[800, 1200, 800]} 
        intensity={1.8} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
        shadow-bias={-0.0001}
        shadow-camera-left={-1000}
        shadow-camera-right={1000}
        shadow-camera-top={800}
        shadow-camera-bottom={-800}
      />
      <Environment preset={params.colorMap === 'VolumeFraction' ? "studio" : "warehouse"} background={false} blur={0.6} />
      {params.colorMap !== 'VolumeFraction' && <Stars radius={3000} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />}

      <SoilBinStructure visibility={visibility} mode={params.colorMap} />
      
      <instancedMesh ref={meshRef} args={[undefined, undefined, 25000]} castShadow receiveShadow frustumCulled={false}>
         <sphereGeometry args={[1, 16, 16]} /> 
         <meshStandardMaterial roughness={0.7} metalness={0.1} />
      </instancedMesh>
      
      <ToolModel 
        type={params.toolType} 
        customModelUrl={params.customModelUrl} 
        position={new THREE.Vector3(toolPosRef.current.x, toolY, 0)} 
        rotation={toolRotation} 
      />

      <ContactShadows opacity={0.5} scale={2500} blur={2.5} far={200} resolution={512} color="#0f172a" />
    </>
  );
};

const SimulationCanvas: React.FC<Props> = (props) => {
  const [visibility, setVisibility] = useState({
      outerBin: true,
      sec1: true, sec2: true, sec3: true, sec4: true, sec5: true,
      showSoil: true,
      showRice: true,
      showWheat: true,
      showDust: true,
      showContacts: false
  });

  const toggleVis = (key: string) => {
      setVisibility(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const isEngineeringMode = props.params.colorMap === 'VolumeFraction';

  return (
    <div className={`w-full h-full relative rounded-xl overflow-hidden border group shadow-2xl transition-colors ${isEngineeringMode ? 'bg-white border-gray-300' : 'bg-slate-900 border-slate-700'}`}>
        <Canvas 
            shadows 
            dpr={[1, 1.5]} 
            gl={{ 
                antialias: false, 
                toneMapping: THREE.ACESFilmicToneMapping, 
                toneMappingExposure: 1.1,
                powerPreference: "high-performance"
            }} 
            camera={{ position: [800, 600, 800], fov: 45, near: 10, far: 8000 }} 
        >
            <color attach="background" args={[isEngineeringMode ? '#ffffff' : '#0f172a']} />
            <fog attach="fog" args={[isEngineeringMode ? '#ffffff' : '#0f172a', 1500, 5000]} />
            <SimulationScene {...props} visibility={visibility} />
            <OrbitControls 
                minPolarAngle={0} 
                maxPolarAngle={Math.PI / 2 - 0.05} 
                maxDistance={3500} 
                minDistance={100} 
                target={[0, 0, 0]} 
                enableDamping 
                dampingFactor={0.05}
            />
        </Canvas>

        {/* Section Visibility Controls (Hidden in Engineering Mode) */}
        {!isEngineeringMode && (
        <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="bg-black/70 backdrop-blur-md p-3 rounded-lg text-white text-xs border border-white/10 w-48">
                <h4 className="font-bold mb-2 text-slate-300 uppercase flex items-center gap-2">
                    <Layers size={12} /> Analysis Zones
                </h4>
                <div className="space-y-1">
                    {['outerBin', 'sec1', 'sec2', 'sec3', 'sec4', 'sec5'].map((key, i) => (
                        <div key={key} className="flex items-center justify-between hover:bg-white/10 p-1 rounded cursor-pointer" onClick={() => toggleVis(key)}>
                            <span className={i===0 ? "text-gray-300" : "text-gray-400"}>
                                {i===0 ? "Bin Frame" : `Section ${i}`}
                            </span>
                            {visibility[key as keyof typeof visibility] ? <Eye size={12} className="text-blue-400" /> : <EyeOff size={12} className="text-gray-600" />}
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-black/70 backdrop-blur-md p-3 rounded-lg text-white text-xs border border-white/10 w-48">
                <h4 className="font-bold mb-2 text-slate-300 uppercase flex items-center gap-2">
                    <Wind size={12} /> Particles
                </h4>
                <div className="space-y-1">
                    <div className="flex items-center justify-between hover:bg-white/10 p-1 rounded cursor-pointer" onClick={() => toggleVis('showSoil')}>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#5d4037]"></span> Soil</span>
                        {visibility.showSoil ? <Eye size={12} /> : <EyeOff size={12} className="text-gray-600" />}
                    </div>
                    <div className="flex items-center justify-between hover:bg-white/10 p-1 rounded cursor-pointer" onClick={() => toggleVis('showRice')}>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#e4d5b7]"></span> Rice Straw</span>
                        {visibility.showRice ? <Eye size={12} /> : <EyeOff size={12} className="text-gray-600" />}
                    </div>
                    <div className="flex items-center justify-between hover:bg-white/10 p-1 rounded cursor-pointer" onClick={() => toggleVis('showWheat')}>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#fbbf24]"></span> Wheat Straw</span>
                        {visibility.showWheat ? <Eye size={12} /> : <EyeOff size={12} className="text-gray-600" />}
                    </div>
                    <div className="flex items-center justify-between hover:bg-white/10 p-1 rounded cursor-pointer" onClick={() => toggleVis('showDust')}>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d2b48c]"></span> Dust</span>
                        {visibility.showDust ? <Eye size={12} /> : <EyeOff size={12} className="text-gray-600" />}
                    </div>
                </div>
            </div>
        </div>
        )}

        {/* Legend - Scientific Vertical Style for Volume Fraction */}
        {isEngineeringMode ? (
            <div className="absolute top-4 left-4 bg-white/90 border border-gray-300 p-3 rounded shadow-md text-xs">
                <div className="font-bold mb-2 text-black">Phase 2. Volume Fraction</div>
                <div className="font-mono text-xs text-black mb-1">Volume Rendering 1</div>
                <div className="flex gap-2 h-48">
                    <div className="w-4 rounded-sm bg-gradient-to-t from-red-600 via-yellow-400 via-green-500 via-cyan-400 to-blue-600"></div>
                    <div className="flex flex-col justify-between py-0.5 text-[10px] font-mono font-medium text-gray-700">
                        <span>1.000e+00</span>
                        <span>7.500e-01</span>
                        <span>5.000e-01</span>
                        <span>2.500e-01</span>
                        <span>0.000e+00</span>
                    </div>
                </div>
            </div>
        ) : (
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md p-3 rounded-lg text-white text-xs border border-white/10 pointer-events-none shadow-xl z-10">
                <div className="font-bold mb-2 uppercase tracking-wider text-[10px] text-slate-400">{props.params.colorMap} Field</div>
                <div className="flex items-center gap-2">
                    <div className={`w-32 h-3 rounded-sm ${
                        props.params.colorMap === 'Strain' || props.params.colorMap === 'Compaction' ? 'bg-gradient-to-r from-gray-200 via-yellow-400 to-red-600' : 
                        props.params.colorMap === 'BurialDepth' ? 'bg-gradient-to-r from-red-500 via-yellow-400 to-green-500' :
                        props.params.colorMap === 'Type' ? 'bg-gradient-to-r from-[#5d4037] via-[#e4d5b7] to-[#fbbf24]' :
                        'bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500'
                    }`}></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
                    <span>{props.params.colorMap === 'Type' ? 'Soil' : props.params.colorMap === 'BurialDepth' ? 'Surface' : 'Min'}</span>
                    <span>{props.params.colorMap === 'Type' ? 'Wheat' : props.params.colorMap === 'BurialDepth' ? 'Deep' : 'Max'}</span>
                </div>
            </div>
        )}
    </div>
  );
};

export default SimulationCanvas;
