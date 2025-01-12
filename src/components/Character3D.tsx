import { useEffect, useRef, useMemo, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
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

import { useResponsive } from '../hooks/useResponsive';

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

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const responsive = useResponsive();
  
  // Check device capabilities
  const [supportedScreen, setSupportedScreen] = useState(true);

  useEffect(() => {
    const checkDeviceCapabilities = () => {
      // Check for WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      // Check screen size and WebGL support
      setSupportedScreen(
        window.innerWidth >= 480 && 
        window.innerHeight >= 320 && 
        !!gl
      );
    };
    
    checkDeviceCapabilities();
    window.addEventListener('resize', checkDeviceCapabilities);
    
    return () => window.removeEventListener('resize', checkDeviceCapabilities);
  }, []);

  // Check for low performance devices
  useEffect(() => {
    const checkPerformance = () => {
      if (typeof window !== 'undefined' && 'deviceMemory' in navigator) {
        // @ts-ignore
        setIsLowPerformance(navigator.deviceMemory < 4);
      }
    };
    checkPerformance();
  }, []);

  useEffect(() => {
    if (!model.current) {
      setLoadingProgress(0);
      return;
    }

    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [model.current]);

  if (error) {
    return (
      <Html>
        <div className="model-error" role="alert">
          <p>Unable to load 3D model</p>
          <p>{error}</p>
        </div>
      </Html>
    );
  }

  if (!supportedScreen) {
    return (
      <Html>
        <div className="model-fallback" role="alert">
          <p>3D view not supported on this device</p>
          <p>Please use a device with a larger screen or better graphics capabilities</p>
        </div>
      </Html>
    );
  }

  return (
    <>
      {isLoading && (
        <Html>
          <div className="model-loading" role="status" aria-live="polite">
            <div className="model-loading-content">
              <div className="model-loading-spinner" aria-hidden="true" />
              <p>Loading 3D model... {Math.round(loadingProgress)}%</p>
            </div>
          </div>
        </Html>
      )}
      <primitive 
        className="character-model"
        object={'scene' in baseModel ? baseModel.scene : baseModel}
        position={position}
        scale={
    isLowPerformance 
      ? scale * 0.8 
      : scale * (responsive.isMobile 
        ? (responsive.isLandscape ? 0.9 : 0.8) 
        : responsive.isTablet 
          ? 0.95 
          : 1
      )
}
        rotation={rotation}
        onError={(error: Error) => setError(error.message)}
        visible={!isLoading}
        frustumCulled={true}
      />
    </>
  );
}
