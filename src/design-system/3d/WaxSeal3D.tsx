import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

interface WaxSeal3DMeshProps {
  issuerName?: string
  sealText?: string
  sealYear?: string
  color?: string
}

function WaxSealMesh({
  issuerName = 'EVENTMESH UNIVERSITY',
  sealText = 'VERIFIED CREDENTIAL',
  sealYear = '2026',
  color = '#8A1C14', // Classic rich burgundy wax
}: WaxSeal3DMeshProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!meshRef.current) return
    const targetY = (state.pointer.x * Math.PI) / 4
    const targetX = -(state.pointer.y * Math.PI) / 4
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.08)
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.08)
  })

  return (
    <group ref={meshRef}>
      <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.5}>
        <group
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* Ribbon Backing Left */}
          <mesh position={[-0.35, -1.1, -0.05]} rotation={[0, 0, -0.2]}>
            <planeGeometry args={[0.35, 1.2]} />
            <meshStandardMaterial
              color="#d4af37"
              roughness={0.4}
              metalness={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Ribbon Backing Right */}
          <mesh position={[0.35, -1.1, -0.05]} rotation={[0, 0, 0.2]}>
            <planeGeometry args={[0.35, 1.2]} />
            <meshStandardMaterial
              color="#d4af37"
              roughness={0.4}
              metalness={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Outer Organic Wax Ruffle */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[1.25, 1.35, 0.16, 32]} />
            <meshStandardMaterial
              color={color}
              roughness={0.35}
              metalness={0.15}
            />
          </mesh>

          {/* Inner Raised Wax Rim */}
          <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.95, 0.09, 16, 48]} />
            <meshStandardMaterial
              color={color}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>

          {/* Center Seal Face */}
          <mesh position={[0, 0, 0.07]}>
            <cylinderGeometry args={[0.95, 0.95, 0.04, 32]} />
            <meshStandardMaterial
              color={color}
              roughness={0.3}
              metalness={0.25}
            />
          </mesh>

          {/* Gilded Embossed Crest Center */}
          <group position={[0, 0, 0.11]}>
            {/* Center Star / Insignia */}
            <mesh position={[0, 0.18, 0]}>
              <octahedronGeometry args={[0.22, 0]} />
              <meshStandardMaterial
                color="#f0c05a"
                roughness={0.2}
                metalness={0.85}
              />
            </mesh>

            <Text
              position={[0, -0.15, 0]}
              fontSize={0.11}
              color="#f0c05a"
              anchorX="center"
            >
              {sealText}
            </Text>

            <Text
              position={[0, -0.35, 0]}
              fontSize={0.09}
              color="#d4af37"
              anchorX="center"
              letterSpacing={0.1}
            >
              ★ {sealYear} ★
            </Text>
          </group>
        </group>
      </Float>

      <ContactShadows position={[0, -1.8, 0]} opacity={0.6} scale={4} blur={2} />
    </group>
  )
}

export interface WaxSeal3DProps extends WaxSeal3DMeshProps {
  className?: string
  height?: number | string
}

export const WaxSeal3D: React.FC<WaxSeal3DProps> = ({
  height = 280,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`w-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{ height }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[3, 4, 4]} intensity={2.2} />
        <pointLight position={[-3, -2, 2]} intensity={0.9} color="#ffd700" />

        <React.Suspense fallback={null}>
          <WaxSealMesh {...props} />
        </React.Suspense>
      </Canvas>
    </div>
  )
}
