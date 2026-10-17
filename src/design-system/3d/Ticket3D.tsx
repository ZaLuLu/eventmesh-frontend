import React, { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text, RoundedBox, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { triggerBurstConfetti } from '@/lib/confetti'

interface Ticket3DCanvasProps {
  eventTitle: string
  attendeeName?: string
  ticketCode?: string
  tierName?: string
  dateText?: string
  venueText?: string
  color?: string
  isVip?: boolean
  onTear?: () => void
}

function TicketMesh({
  eventTitle,
  attendeeName = 'CAMPUS ATTENDEE',
  ticketCode = 'EM-2026-VIP',
  tierName = 'VIP ALL-ACCESS',
  dateText = 'OCT 24, 2026',
  venueText = 'Main Auditorium',
  color = '#8FE3C6',
  isVip = true,
  onTear,
}: Ticket3DCanvasProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [torn, setTorn] = useState(false)

  // Smooth mouse tilt tracking
  useFrame((state) => {
    if (!meshRef.current) return
    const targetX = (state.pointer.x * Math.PI) / 8
    const targetY = -(state.pointer.y * Math.PI) / 8
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX, 0.08)
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetY, 0.08)
  })

  const handlePointerDown = () => {
    if (!torn) {
      setTorn(true)
      triggerBurstConfetti()
      onTear?.()
    } else {
      setTorn(false)
    }
  }

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
        {/* Main Ticket Body */}
        <group
          position={torn ? [-0.3, 0.1, 0] : [0, 0, 0]}
          rotation={torn ? [0, 0, 0.05] : [0, 0, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={handlePointerDown}
        >
          {/* Main Card Slab */}
          <RoundedBox args={[3.2, 1.8, 0.06]} radius={0.08} smoothness={4}>
            <meshPhysicalMaterial
              color="#1a1921"
              roughness={0.25}
              metalness={0.1}
              clearcoat={0.3}
              clearcoatRoughness={0.1}
            />
          </RoundedBox>

          {/* Golden/Accent Holographic Border Trim */}
          <RoundedBox args={[3.24, 1.84, 0.04]} radius={0.09} smoothness={4} position={[0, 0, -0.01]}>
            <meshStandardMaterial
              color={isVip ? '#e5c07b' : color}
              metalness={0.9}
              roughness={0.2}
            />
          </RoundedBox>

          {/* Holographic Security Strip */}
          <mesh position={[-1.2, 0, 0.035]}>
            <planeGeometry args={[0.35, 1.6]} />
            <meshPhysicalMaterial
              color="#e0e0f0"
              roughness={0.1}
              metalness={0.8}
              iridescence={1.0}
              iridescenceIOR={1.6}
              clearcoat={1}
            />
          </mesh>

          {/* Typography Overlays via Drei Text */}
          <group position={[-0.85, 0, 0.04]}>
            <Text
              position={[0, 0.58, 0]}
              fontSize={0.13}
              color={color}
              anchorX="left"
            >
              EVENTMESH // {tierName.toUpperCase()}
            </Text>

            <Text
              position={[0, 0.32, 0]}
              fontSize={0.22}
              color="#ffffff"
              maxWidth={1.9}
              anchorX="left"
            >
              {eventTitle.length > 22 ? `${eventTitle.slice(0, 22)}...` : eventTitle}
            </Text>

            <Text
              position={[0, -0.02, 0]}
              fontSize={0.14}
              color="#e4e4e7"
              anchorX="left"
            >
              {attendeeName}
            </Text>

            <Text
              position={[0, -0.28, 0]}
              fontSize={0.11}
              color="#a1a1aa"
              anchorX="left"
            >
              {dateText} • {venueText}
            </Text>

            <Text
              position={[0, -0.55, 0]}
              fontSize={0.12}
              color="#71717a"
              anchorX="left"
            >
              {ticketCode}
            </Text>
          </group>

          {/* Perforation Notch Indicators */}
          <mesh position={[0.7, 0.9, 0.035]}>
            <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
            <meshBasicMaterial color="#0e0d12" />
          </mesh>
          <mesh position={[0.7, -0.9, 0.035]}>
            <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
            <meshBasicMaterial color="#0e0d12" />
          </mesh>

          {/* Perforation Dashed Line */}
          <mesh position={[0.7, 0, 0.032]}>
            <planeGeometry args={[0.02, 1.6]} />
            <meshBasicMaterial color="#3f3f46" transparent opacity={0.6} />
          </mesh>
        </group>

        {/* Right Ticket Stub (Tears off when clicked) */}
        <group
          position={torn ? [1.2, -0.2, 0.15] : [0, 0, 0]}
          rotation={torn ? [0.1, 0.2, -0.15] : [0, 0, 0]}
          onClick={handlePointerDown}
        >
          <RoundedBox args={[0.9, 1.8, 0.06]} radius={0.06} smoothness={4} position={[1.15, 0, 0]}>
            <meshPhysicalMaterial
              color="#131218"
              roughness={0.3}
              metalness={0.2}
            />
          </RoundedBox>

          {/* Stub QR / Barcode Pattern simulation */}
          <group position={[1.15, 0, 0.035]}>
            <mesh position={[0, 0.35, 0]}>
              <planeGeometry args={[0.5, 0.5]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0.35, 0.002]}>
              <planeGeometry args={[0.42, 0.42]} />
              <meshBasicMaterial color="#09090b" />
            </mesh>

            <Text
              position={[0, -0.15, 0]}
              fontSize={0.11}
              color={color}
              anchorX="center"
            >
              {torn ? 'ADMITTED' : 'VALID'}
            </Text>

            <Text
              position={[0, -0.45, 0]}
              fontSize={0.09}
              color="#71717a"
              anchorX="center"
            >
              {torn ? 'CLICK TO RESET' : 'CLICK TO TEAR'}
            </Text>
          </group>
        </group>
      </Float>

      {/* Realistic Floor Shadow */}
      <ContactShadows
        position={[0, -1.6, 0]}
        opacity={hovered ? 0.8 : 0.5}
        scale={6}
        blur={2}
        far={4}
      />
    </group>
  )
}

export interface Ticket3DProps extends Ticket3DCanvasProps {
  className?: string
  height?: number | string
}

export const Ticket3D: React.FC<Ticket3DProps> = ({
  height = 360,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`w-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{ height }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 5, 5]} intensity={1.8} castShadow />
        <pointLight position={[-4, -3, 2]} intensity={0.8} color="#8FE3C6" />
        <pointLight position={[4, -2, 2]} intensity={0.6} color="#FFA69E" />

        <React.Suspense fallback={null}>
          <TicketMesh {...props} />
        </React.Suspense>
      </Canvas>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] font-mono text-text-3 opacity-70">
        Interactive 3D Pass • Move cursor to tilt • Click to tear stub
      </div>
    </div>
  )
}
