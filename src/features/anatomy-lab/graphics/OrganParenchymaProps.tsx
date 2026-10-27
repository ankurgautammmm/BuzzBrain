import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AnatomicalStructure, GraphicsRenderMode } from '../types/anatomy';
import { createAnatomicalMaterial } from './OrganShaderMaterials';

export interface OrganParenchymaPropsProps {
  organId: string;
  renderMode?: GraphicsRenderMode;
  tissueOpacity?: number; // 0.0 to 1.0 (default 0.92)
  showCrossSection?: boolean;
  selectedStructure?: AnatomicalStructure | null;
  hoveredStructure?: AnatomicalStructure | null;
  onSelectStructure?: (struct: AnatomicalStructure | null) => void;
  clippingPlanes?: THREE.Plane[];
}

/**
 * High-fidelity 3D Anatomical Organ Body & Parenchymal Muscle Tissue Props
 * Solves the missing organ body issue where only isolated veins/arteries were visible.
 * Renders complete myocardial muscular walls, renal cortex/capsule, and cerebral cortex.
 */
export const OrganParenchymaProps: React.FC<OrganParenchymaPropsProps> = ({
  organId,
  renderMode = 'pbr_tissue',
  tissueOpacity = 0.92,
  showCrossSection = false,
  selectedStructure,
  hoveredStructure,
  onSelectStructure,
  clippingPlanes = []
}) => {
  // Common biological tissue material for myocardial muscular walls
  const myocardiumMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#991b1b'), // Deep rich cardiac muscle crimson
      roughness: 0.38,
      metalness: 0.06,
      clearcoat: 0.6,
      clearcoatRoughness: 0.18,
      reflectivity: 0.55,
      transparent: tissueOpacity < 0.98,
      opacity: tissueOpacity,
      side: showCrossSection ? THREE.DoubleSide : THREE.FrontSide,
      clippingPlanes,
      clipShadows: true,
    });
  }, [tissueOpacity, showCrossSection, clippingPlanes]);

  // Material for epicardial fat cushions / sulcus grooves
  const epicardialFatMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fef08a'), // Creamy physiological fat along sulcus
      roughness: 0.55,
      metalness: 0.02,
      transparent: tissueOpacity < 0.98,
      opacity: Math.min(1.0, tissueOpacity * 0.9),
      side: THREE.DoubleSide,
      clippingPlanes,
    });
  }, [tissueOpacity, clippingPlanes]);

  // Material for Renal Cortex & Capsule
  const renalCortexMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#831843'), // Reddish-brown renal parenchyma
      roughness: 0.42,
      metalness: 0.05,
      clearcoat: 0.7,
      clearcoatRoughness: 0.15,
      transparent: tissueOpacity < 0.98,
      opacity: tissueOpacity,
      side: showCrossSection ? THREE.DoubleSide : THREE.FrontSide,
      clippingPlanes,
    });
  }, [tissueOpacity, showCrossSection, clippingPlanes]);

  // Material for Renal Medullary Pyramids
  const renalPyramidMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#9f1239'), // Deeper striated medullary pyramid tissue
      roughness: 0.45,
      metalness: 0.04,
      transparent: tissueOpacity < 0.98,
      opacity: tissueOpacity,
      clippingPlanes,
    });
  }, [tissueOpacity, clippingPlanes]);

  // Material for Brain Cerebral Cortex Mantle
  const brainCortexMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f1f5f9'), // Pearl-tinted cerebral grey/white matter
      roughness: 0.5,
      metalness: 0.05,
      clearcoat: 0.4,
      transparent: tissueOpacity < 0.98,
      opacity: tissueOpacity,
      side: THREE.DoubleSide,
      clippingPlanes,
    });
  }, [tissueOpacity, clippingPlanes]);

  // 1. HUMAN HEART FULL MYOCARDIAL BODY PROP
  if (organId === 'organ-heart') {
    return (
      <group name="heart-parenchyma-prop">
        {/* Left Ventricle Thick Conical Muscular Wall (Forms Cardiac Apex) */}
        <mesh 
          position={[0.04, 0.44, 0.04]} 
          rotation={[0.1, 0.15, -0.22]} 
          scale={[1.1, 1.35, 1.05]}
          material={myocardiumMaterial}
          castShadow
          receiveShadow
        >
          {showCrossSection ? (
            // Half-sphere cutaway showing internal chamber
            <sphereGeometry args={[0.088, 32, 24, 0, Math.PI * 1.6, 0, Math.PI]} />
          ) : (
            <sphereGeometry args={[0.088, 32, 28]} />
          )}
        </mesh>

        {/* Right Ventricle Anterior Crescentic Muscular Wall */}
        <mesh 
          position={[-0.04, 0.45, 0.06]} 
          rotation={[-0.05, -0.15, 0.15]} 
          scale={[0.95, 1.25, 0.9]}
          material={myocardiumMaterial}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[0.075, 30, 24, 0, Math.PI * 1.8, 0, Math.PI]} />
        </mesh>

        {/* Interventricular Septum (Muscular Partition) */}
        <mesh 
          position={[0.005, 0.45, 0.045]} 
          rotation={[0, 0.25, 0]} 
          material={myocardiumMaterial}
          castShadow
        >
          <boxGeometry args={[0.018, 0.13, 0.085]} />
        </mesh>

        {/* Left Atrial Muscular Auricle & Posterior Wall */}
        <mesh 
          position={[0.055, 0.53, -0.01]} 
          rotation={[0.2, 0, -0.15]} 
          material={myocardiumMaterial}
          castShadow
        >
          <sphereGeometry args={[0.052, 24, 20]} />
        </mesh>

        {/* Right Atrial Muscular Auricle & Pectinate Wall */}
        <mesh 
          position={[-0.06, 0.52, 0.03]} 
          rotation={[-0.15, 0, 0.2]} 
          material={myocardiumMaterial}
          castShadow
        >
          <sphereGeometry args={[0.054, 24, 20]} />
        </mesh>

        {/* Anterior Interventricular Sulcus Fatty Cushion */}
        <mesh 
          position={[0.008, 0.43, 0.11]} 
          rotation={[0, 0, -0.25]}
          material={epicardialFatMaterial}
        >
          <cylinderGeometry args={[0.006, 0.004, 0.14, 12]} />
        </mesh>

        {/* Coronary Sulcus (Atrioventricular Groove) Fatty Band */}
        <mesh 
          position={[0.01, 0.495, 0.04]} 
          rotation={[Math.PI / 2, 0, 0.1]}
          material={epicardialFatMaterial}
        >
          <torusGeometry args={[0.085, 0.006, 10, 28, Math.PI * 1.7]} />
        </mesh>
      </group>
    );
  }

  // 2. HUMAN KIDNEY FULL RENAL CORTEX & CAPSULE PROP
  if (organId === 'organ-kidney') {
    return (
      <group name="kidney-parenchyma-prop">
        {/* Main Bean-Shaped Renal Cortex Outer Body */}
        <mesh 
          position={[-0.06, 0.35, 0.05]} 
          scale={[0.9, 1.45, 0.85]}
          material={renalCortexMaterial}
          castShadow
          receiveShadow
        >
          {showCrossSection ? (
            // Half cutaway showing medullary pyramids and renal pelvis inside
            <sphereGeometry args={[0.085, 32, 24, 0, Math.PI, 0, Math.PI]} />
          ) : (
            <sphereGeometry args={[0.085, 32, 28]} />
          )}
        </mesh>

        {/* Medullary Pyramids (Striated Cones inside Parenchyma) */}
        <group position={[-0.06, 0.35, 0.05]}>
          {[
            { pos: [0.015, 0.035, 0.01], rot: [0, 0, -0.6] },
            { pos: [0.02, 0.005, 0.01], rot: [0, 0, -0.2] },
            { pos: [0.015, -0.03, 0.01], rot: [0, 0, 0.3] },
            { pos: [-0.01, 0.04, -0.01], rot: [0, 0, -0.8] },
            { pos: [-0.015, -0.035, -0.01], rot: [0, 0, 0.6] },
          ].map((pyr, idx) => (
            <mesh 
              key={`pyr-${idx}`} 
              position={pyr.pos as [number, number, number]} 
              rotation={pyr.rot as [number, number, number]}
              material={renalPyramidMaterial}
            >
              <coneGeometry args={[0.018, 0.035, 16]} />
            </mesh>
          ))}
        </group>

        {/* Renal Pelvis Funnel leading to Ureter */}
        <mesh 
          position={[0.025, 0.33, 0.05]} 
          rotation={[0, 0, 0.35]}
          material={epicardialFatMaterial}
        >
          <cylinderGeometry args={[0.016, 0.008, 0.06, 16]} />
        </mesh>
      </group>
    );
  }

  // 3. HUMAN BRAIN CEREBRAL MANTLE & GYRI PROP
  if (organId === 'organ-brain') {
    return (
      <group name="brain-parenchyma-prop">
        {/* Left Cerebral Hemisphere */}
        <mesh 
          position={[-0.042, 0.38, 0.02]} 
          scale={[1.0, 1.15, 1.25]}
          material={brainCortexMaterial}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[0.075, 32, 24]} />
        </mesh>

        {/* Right Cerebral Hemisphere */}
        <mesh 
          position={[0.042, 0.38, 0.02]} 
          scale={[1.0, 1.15, 1.25]}
          material={brainCortexMaterial}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[0.075, 32, 24]} />
        </mesh>

        {/* Cerebellar Foliated Lobes (Posteroinferior) */}
        <mesh 
          position={[-0.03, 0.31, -0.05]} 
          scale={[1.0, 0.7, 0.85]}
          material={myocardiumMaterial}
        >
          <sphereGeometry args={[0.042, 24, 20]} />
        </mesh>
        <mesh 
          position={[0.03, 0.31, -0.05]} 
          scale={[1.0, 0.7, 0.85]}
          material={myocardiumMaterial}
        >
          <sphereGeometry args={[0.042, 24, 20]} />
        </mesh>

        {/* Brainstem & Medulla Oblongata */}
        <mesh 
          position={[0, 0.26, -0.01]} 
          material={brainCortexMaterial}
        >
          <cylinderGeometry args={[0.018, 0.014, 0.08, 20]} />
        </mesh>
      </group>
    );
  }

  return null;
};
