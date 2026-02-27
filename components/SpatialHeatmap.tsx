

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Box } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  metric: 'compaction' | 'straw';
  runId: number | string;
}

// Generate mock voxel data based on runId to simulate different outcomes
const generateVoxelData = (metric: 'compaction' | 'straw', runId: number | string) => {
    const data = [];
    const seed = Number(runId) * 12345;
    const rng = () => {
        const x = Math.sin(seed + data.length) * 10000;
        return x - Math.floor(x);
    };

    // Grid dimensions
    const width = 16;
    const height = 8;
    const depth = 8;

    for(let x=0; x<width; x++) {
        for(let y=0; y<height; y++) {
            for(let z=0; z<depth; z++) {
                const val = rng();
                
                if (metric === 'compaction') {
                    // Compaction tends to be higher at bottom (y=0) and lower at top
                    // Modify based on "runId" (even/odd) to show variation
                    const depthFactor = 1 - (y/height);
                    const runFactor = Number(runId) % 2 === 0 ? 1.2 : 0.8;
                    const cVal = val * depthFactor * runFactor;
                    
                    if (cVal > 0.4) {
                        data.push({ x: x - width/2, y: y, z: z - depth/2, value: cVal });
                    }
                } else {
                    // Straw distribution - Random clumps
                    // Deeper runs have more straw at bottom
                    const isDeepRun = Number(runId) % 2 !== 0;
                    const bias = isDeepRun ? 0.3 : 0.0; // Bias towards bottom if deep
                    
                    if (val > 0.85) {
                        data.push({ x: x - width/2, y: y - (isDeepRun ? rng()*2 : 0), z: z - depth/2, value: val });
                    }
                }
            }
        }
    }
    return data;
};

const VoxelCloud = ({ data, metric }: { data: any[], metric: 'compaction' | 'straw' }) => {
    const meshRef = React.useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);

    React.useLayoutEffect(() => {
        if (!meshRef.current) return;
        
        data.forEach((d, i) => {
            dummy.position.set(d.x * 2, d.y * 2 - 5, d.z * 2);
            dummy.scale.set(1.8, 1.8, 1.8);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
            
            if (metric === 'compaction') {
                // Green (low) -> Red (high)
                color.setHSL((1.0 - d.value) * 0.3, 1, 0.5);
            } else {
                // Straw (Gold/Yellow)
                color.set('#eab308'); 
            }
            meshRef.current!.setColorAt(i, color);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [data, metric]);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial transparent opacity={0.6} roughness={0.1} />
        </instancedMesh>
    );
};

const SpatialHeatmap: React.FC<Props> = ({ metric, runId }) => {
  const data = useMemo(() => generateVoxelData(metric, runId), [metric, runId]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden relative">
        <Canvas 
            camera={{ position: [20, 20, 20], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ powerPreference: "high-performance", preserveDrawingBuffer: false }}
        >
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <OrbitControls autoRotate autoRotateSpeed={1} />
            
            <VoxelCloud data={data} metric={metric} />
            
            <Grid position={[0, -5, 0]} args={[40, 40]} cellSize={2} cellThickness={1} cellColor="#475569" sectionColor="#64748b" fadeDistance={30} />
        </Canvas>
        
        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur p-2 rounded text-white text-[10px]">
            <div className="font-bold mb-1 uppercase">{metric === 'compaction' ? 'Soil Compaction' : 'Straw Distribution'}</div>
            {metric === 'compaction' ? (
                <div className="w-32 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-sm"></div>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                    <span>Residue Density</span>
                </div>
            )}
        </div>
    </div>
  );
};

export default SpatialHeatmap;
