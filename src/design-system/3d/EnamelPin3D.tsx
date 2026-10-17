import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

interface EnamelPin3DProps {
  clubName: string
  clubCategory?: string
  accentColor?: string
  metalColor?: 'gold' | 'silver' | 'brass' | 'graphite'
  className?: string
  height?: number | string
}

function PinMesh({
  clubName,
  clubCategory = 'TECH CLUB',
  accentColor = '#8FE3C6',
  metalColor = 'gold',
}: {
  clubName: string
  clubCategory?: string
  accentColor?: string
  metalColor?: 'gold' | 'silver' | 'brass' | 'graphite'
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const metalHues = {
    gold: { color: '#e5c07b', metalness: 0.95, roughness: 0.18 },
    silver: { color: '#e2e8f0', metalness: 0.9, roughness: 0.2 },
    brass: { color: '#d97706', metalness: 0.85, roughness: 0.25 },
    graphite: { color: '#334155', metalness: 0.8, roughness: 0.35 },
  }

  const mat = metalHues[metalColor]

  useFrame((state) => {
    if (!groupRef.current) return
    if (!hovered) {
      groupRef.current.rotation.y += 0.015
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.1
    } else {
      const targetY = (state.pointer.x * Math.PI) / 2
      const targetX = -(state.pointer.y * Math.PI) / 4
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.1)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.1)
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
        <group
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* Heavy Cast Outer Bezel (Shield / Hexagon shape) */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[1.3, 1.35, 0.14, 6]} />
            <meshStandardMaterial
              color={mat.color}
              metalness={mat.metalness}
              roughness={mat.roughness}
            />
          </mesh>

          {/* Deep Recessed Enamel Fill */}
          <mesh position={[0, 0, 0.035]}>
            <cylinderGeometry args={[1.15, 1.15, 0.12, 6]} />
            <meshPhysicalMaterial
              color={accentColor}
              roughness={0.12}
              metalness={0.25}
              clearcoat={1.0}
              clearcoatRoughness={0.08}
            />
          </mesh>

          {/* Inner Raised Metallic Emblems */}
          <group position={[0, 0, 0.1]}>
            {/* Center Geometric Emblem */}
            <mesh position={[0, 0.25, 0]}>
              <octahedronGeometry args={[0.35, 0]} />
              <meshStandardMaterial
                color={mat.color}
                metalness={mat.metalness}
                roughness={mat.roughness}
              />
            </mesh>

            {/* Club Name Text */}
            <Text
              position={[0, -0.22, 0]}
              fontSize={0.14}
              color="#ffffff"
              anchorX="center"
              maxWidth={1.8}
            >
              {clubName.toUpperCase()}
            </Text>

            <Text
              position={[0, -0.45, 0]}
              fontSize={0.09}
              color={mat.color}
              anchorX="center"
            >
              {clubCategory}
            </Text>
          </group>
        </group>
      </Float>

      <ContactShadows position={[0, -1.6, 0]} opacity={0.65} scale={4} blur={2} />
    </group>
  )
}

export const EnamelPin3D: React.FC<EnamelPin3DProps> = ({
  clubName,
  clubCategory,
  accentColor,
  metalColor = 'gold',
  height = 240,
  className = '',
}) => {
  return (
    <div
      className={`w-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{ height }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 5, 4]} intensity={2.4} />
        <pointLight position={[-3, -3, 2]} intensity={1.0} color="#ffffff" />
        <React.Suspense fallback={null}>
          <PinMesh
            clubName={clubName}
            clubCategory={clubCategory}
            accentColor={accentColor}
            metalColor={metalColor}
          />
        </React.Suspense>
      </Canvas>
    </div>
  )
}
