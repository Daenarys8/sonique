import { useEffect, useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
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

  // Load base model
  const fbx = useLoader(FBXLoader, modelPath) as THREE.Group & {
    animations: THREE.AnimationClip[];
  };

  // Load animations, skipping the base model
  const animations = useLoader(
    FBXLoader,
    animationPaths
  ).map((animation) => animation.animations[0]);

  useEffect(() => {
    if (!fbx) return;

    // Store the model reference
    model.current = fbx;
    
    // Create new mixer
    mixer.current = new THREE.AnimationMixer(model.current);

    // Stop any playing animations
    if (currentAction.current) {
      currentAction.current.stop();
    }

    // Get the current animation clip
    if (animations && animations[currentAnimation]) {
      const clip = animations[currentAnimation];
      if (clip) {
        console.log('Playing animation:', currentAnimation, clip.name);
        currentAction.current = mixer.current.clipAction(clip);
        currentAction.current.reset().play();
      }
    }

    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
      }
    };
  }, [fbx, currentAnimation, animations]);

  // Update animation mixer
  useFrame((state, delta) => {
    mixer.current?.update(delta);
  });

  // Debug logging
  useEffect(() => {
    console.log('Animation paths:', animationPaths);
    console.log('Current animation index:', currentAnimation);
    console.log('Available animations:', animations?.map(a => a?.name || 'Unnamed'));
  }, [animationPaths, currentAnimation, animations]);

  return (
    <primitive 
      object={fbx} 
      position={position}
      scale={scale}
      rotation={rotation}
    />
  );
}
