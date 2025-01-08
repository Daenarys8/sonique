import { useEffect, useRef, useMemo } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface Character3DProps {
  modelPath: string;
  animationPaths?: string[];
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  currentAnimation?: number;
}

export function Character3D({ 
  modelPath, 
  animationPaths = [], 
  position, 
  scale, 
  rotation,
  currentAnimation = 0
}: Character3DProps) {
  const mixer = useRef<THREE.AnimationMixer>();
  const currentAction = useRef<THREE.AnimationAction>();
  const model = useRef<THREE.Group>();

  // Check if the model path is GLTF or FBX
  const isGLTF = modelPath.toLowerCase().endsWith('.gltf') || modelPath.toLowerCase().endsWith('.glb');

  // Load the model based on file type
  const baseModel = isGLTF 
    ? useGLTF(modelPath) as unknown as GLTF & { scene: THREE.Group }
    : useLoader(FBXLoader, modelPath) as THREE.Group & { animations: THREE.AnimationClip[] };

  // Memoized animations loading
  const animations = useMemo(() => animationPaths.map(path => {
    const isAnimGLTF = path.toLowerCase().endsWith('.gltf') || path.toLowerCase().endsWith('.glb');
    if (isAnimGLTF) {
      const gltfAnim = useLoader(GLTFLoader, path) as GLTF;
      return gltfAnim.animations[0];
    } else {
      const fbxAnim = useLoader(FBXLoader, path) as THREE.Group & { animations: THREE.AnimationClip[] };
      return fbxAnim.animations[0];
    }
  }), [animationPaths]);

  useEffect(() => {
    const scene = 'scene' in baseModel ? baseModel.scene : baseModel;
    model.current = scene;

    mixer.current = new THREE.AnimationMixer(scene);

    if (currentAction.current) {
      currentAction.current.stop();
    }

    if (animations[currentAnimation]) {
      const clip = animations[currentAnimation];
      currentAction.current = mixer.current.clipAction(clip);
      currentAction.current.reset().play();
    }

    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
        mixer.current.uncacheRoot(scene);
        mixer.current = undefined;
      }
    };
  }, [baseModel, currentAnimation, animations]);

  useFrame((state, delta) => {
    mixer.current?.update(delta);
  });

  return (
    <primitive 
      object={'scene' in baseModel ? baseModel.scene : baseModel}
      position={position}
      scale={scale}
      rotation={rotation}
    />
  );
}
