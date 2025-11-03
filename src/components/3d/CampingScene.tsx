import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import CampingModel from "./CampingModel";
import ModelLoader from "./ModelLoader";

interface CampingSceneProps {
  autoRotate?: boolean;
}

const CampingScene: React.FC<CampingSceneProps> = ({ autoRotate = true }) => {
  return (
    <div className="w-full h-full">
      <Canvas
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2, // Tăng độ sáng
        }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={<ModelLoader />}>
          {/* Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-5, 3, -5]} intensity={0.8} />
          <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFA500" />

          {/* Environment */}
          <Environment preset="sunset" />

          {/* Camera */}
          <PerspectiveCamera
            makeDefault
            position={[0, 2, 6]}
            fov={50}
            near={0.1}
            far={100}
          />

          {/* Model */}
          <CampingModel position={[0, -1, 0]} scale={1.1} />

          {/* Ground plane */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1, 0]}
            receiveShadow
          >
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial 
              color="#FFD700" 
              roughness={0.7}
              metalness={0.2}
            />
          </mesh>

          {/* Shadow layer */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.99, 0]}
            receiveShadow
          >
            <planeGeometry args={[15, 15]} />
            <shadowMaterial opacity={0.4} />
          </mesh>

          {/* Circle accent */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.98, 0]}>
            <circleGeometry args={[2.75, 64]} />
            <meshStandardMaterial
              color="#FF8C00"
              opacity={0.5}
              transparent
              roughness={0.8}
              emissive="#FF6B00"
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minDistance={4}
            maxDistance={10}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 6}
            autoRotate={autoRotate}
            autoRotateSpeed={0.8}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default CampingScene;