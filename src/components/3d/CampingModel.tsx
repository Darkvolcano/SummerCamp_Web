import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface CampingModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const CampingModel: React.FC<CampingModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const { scene } = useGLTF("/models/camping_set_final.glb");
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (modelRef.current) {
      // Gentle rotation
      modelRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      // Subtle floating effect
      modelRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={modelRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={scene.clone()} />
    </group>
  );
};

useGLTF.preload("/models/space_ame_camping_-_amelia_watson_hololive.glb");

export default CampingModel;
