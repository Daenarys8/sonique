import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Character3D } from './Character3D';
import { MODEL_PATHS } from '../constants/modelPaths';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/model.css';
import '../styles/battle-responsive.css';
import '../styles/animations.css';

interface BattleSceneProps {
  playerState: {
    currentAnimation: number;
  };
  npcState: {
    currentAnimation: number;
  };
  playerEffect: string | null;
  npcEffect: string | null;
  isMobile?: boolean;
  onModelsLoaded?: () => void;
}

const CAST_GIF = '/effects/cast.gif';
const SUFFER_GIF = '/effects/suffer.gif';

export function BattleScene({
  playerState,
  npcState,
  playerEffect,
  npcEffect,
  isMobile = false,
  onModelsLoaded
}: BattleSceneProps) {
  const { highContrast, reducedMotion } = useAccessibility();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const responsive = useResponsive();
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (modelsLoaded && onModelsLoaded) {
      onModelsLoaded();
    }
  }, [modelsLoaded, onModelsLoaded]);

  return (
    <div className="battle-scene-wrapper">
      {/* Left Model */}
      <div
        className="battle-model-container left"
        style={{
          pointerEvents: 'none',
          transition: reducedMotion ? 'none' : 'all 0.3s ease',
          filter: highContrast ? 'grayscale(100%) contrast(200%)' : 'none'
        }}
      >
        <Canvas 
          onCreated={() => setModelsLoaded(true)} 
          camera={{ 
            position: isLandscape ? [-6, 2, 6] : [-5, 2, 5], 
            fov: isMobile ? (isLandscape ? 55 : 65) : 50 
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={7} />
          <Character3D
            modelPath={MODEL_PATHS.PLAYER.BASE.model}
            animationPaths={MODEL_PATHS.PLAYER.BASE.animations}
            position={[-2, -2, 0]}
            scale={isMobile ? (isLandscape ? 0.018 : 0.015) : 0.02}
            rotation={[0, Math.PI / 0.5, 0]}
            currentAnimation={playerState.currentAnimation}
          />
          <Environment preset="park" />
        </Canvas>
        {playerEffect && (
          <img
            src={playerEffect}
            alt="Player effect animation"
            aria-hidden="true"
            className="effect-overlay left"
          />
        )}
      </div>

      {/* Right Model */}
      <div
        className="battle-model-container right"
        style={{
          pointerEvents: 'none',
          transition: reducedMotion ? 'none' : 'all 0.3s ease',
          filter: highContrast ? 'grayscale(100%) contrast(200%)' : 'none'
        }}
      >
        <Canvas 
          onCreated={() => setModelsLoaded(true)} 
          camera={{ 
            position: [5, 2, 5], 
            fov: isMobile ? (isLandscape ? 55 : 65) : 50 
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[-10, 10, 5]} intensity={10} />
          <Character3D
            modelPath={MODEL_PATHS.NPC.BASE.model}
            animationPaths={MODEL_PATHS.NPC.BASE.animations}
            position={[2, -2, 0]}
            scale={isMobile ? (isLandscape ? 0.018 : 0.015) : 0.02}
            rotation={[0, -Math.PI / 0.25, 0]}
            currentAnimation={npcState.currentAnimation}
          />
          <Environment preset="park" />
        </Canvas>
        {npcEffect && (
          <img
            src={npcEffect}
            alt="NPC effect animation"
            aria-hidden="true"
            className="effect-overlay right"
          />
        )}
      </div>
    </div>
  );
}
