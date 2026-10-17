import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, RoundedBox, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'

export interface EventCarouselItem {
  id: string
  title: string
  category: string
  date: string
  venue: string
  accentColor?: string
  slug?: string
}

interface CardMeshProps {
  item: EventCarouselItem
  position: [number, number, number]
  rotation: [number, number, number]
  index: number
  onSelect: (item: EventCarouselItem) => void
}

function EventCardMesh({ item, position, rotation, onSelect }: CardMeshProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const accent = item.accentColor || '#8FE3C6'

  useFrame(() => {
    if (!meshRef.current) return
    const scale = hovered ? 1.08 : 1.0
    meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
  })

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect(item)}
    >
      {/* Frosted Glass Body */}
      <RoundedBox args={[2.0, 2.8, 0.08]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial
          color="#16151f"
          roughness={0.2}
          metalness={0.15}
          transmission={0.6}
          thickness={0.8}
          transparent
          opacity={0.92}
        />
      </RoundedBox>

      {/* Glowing Neon Outline when hovered */}
      <RoundedBox args={[2.04, 2.84, 0.06]} radius={0.11} smoothness={4} position={[0, 0, -0.01]}>
        <meshStandardMaterial
          color={hovered ? accent : '#2a2838'}
          emissive={hovered ? accent : '#000000'}
          emissiveIntensity={hovered ? 0.6 : 0}
          roughness={0.4}
        />
      </RoundedBox>

      {/* Header Accent Bar */}
      <mesh position={[0, 1.15, 0.045]}>
        <planeGeometry args={[1.7, 0.04]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      {/* Typography */}
      <group position={[-0.85, 0, 0.05]}>
        <Text
          position={[0, 1.0, 0]}
          fontSize={0.12}
          color={accent}
          anchorX="left"
        >
          {item.category.toUpperCase()}
        </Text>

        <Text
          position={[0, 0.5, 0]}
          fontSize={0.18}
          color="#ffffff"
          maxWidth={1.7}
          anchorX="left"
          lineHeight={1.15}
        >
          {item.title}
        </Text>

        <Text
          position={[0, -0.6, 0]}
          fontSize={0.11}
          color="#a1a1aa"
          anchorX="left"
        >
          {item.date}
        </Text>

        <Text
          position={[0, -0.85, 0]}
          fontSize={0.10}
          color="#71717a"
          anchorX="left"
        >
          {item.venue}
        </Text>

        <Text
          position={[0, -1.15, 0]}
          fontSize={0.11}
          color={hovered ? '#ffffff' : accent}
          anchorX="left"
        >
          {hovered ? 'CLICK TO EXPLORE →' : 'EXPLORE EVENT'}
        </Text>
      </group>
    </group>
  )
}

function CarouselScene({
  items,
  onSelect,
}: {
  items: EventCarouselItem[]
  onSelect: (item: EventCarouselItem) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const isDragging = useRef(false)
  const previousX = useRef(0)
  const autoRotateSpeed = useRef(0.003)

  useFrame(() => {
    if (!groupRef.current) return
    if (!isDragging.current) {
      groupRef.current.rotation.y += autoRotateSpeed.current
    }
  })

  // Calculate cylindrical carousel positions
  const radius = 3.6
  const count = items.length

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    previousX.current = e.clientX
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !groupRef.current) return
    const deltaX = e.clientX - previousX.current
    groupRef.current.rotation.y += deltaX * 0.005
    previousX.current = e.clientX
  }

  const handlePointerUp = () => {
    isDragging.current = false
  }

  return (
    <group
      onPointerDown={handlePointerDown as any}
      onPointerMove={handlePointerMove as any}
      onPointerUp={handlePointerUp as any}
    >
      <group ref={groupRef}>
        {items.map((item, index) => {
          const angle = (index / count) * Math.PI * 2
          const x = Math.sin(angle) * radius
          const z = Math.cos(angle) * radius
          const rotationY = angle
          return (
            <EventCardMesh
              key={item.id}
              item={item}
              position={[x, 0, z]}
              rotation={[0, rotationY, 0]}
              index={index}
              onSelect={onSelect}
            />
          )
        })}
      </group>

      {/* Ambient Floating Campus Sparkles */}
      <Sparkles count={50} scale={8} size={2.5} speed={0.4} opacity={0.5} color="#8FE3C6" />
    </group>
  )
}

export interface EventCarousel3DProps {
  items: EventCarouselItem[]
  className?: string
  height?: number | string
}

export const EventCarousel3D: React.FC<EventCarousel3DProps> = ({
  items,
  height = 420,
  className = '',
}) => {
  const navigate = useNavigate()

  const handleSelect = (item: EventCarouselItem) => {
    if (item.slug) {
      navigate(`/events/${item.slug}`)
    } else {
      navigate('/explore')
    }
  }

  return (
    <div
      className={`w-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      style={{ height }}
    >
      <Canvas
        camera={{ position: [0, 0.4, 6.2], fov: 48 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 6, 6]} intensity={1.8} />
        <pointLight position={[-5, 2, 2]} intensity={1.2} color="#8FE3C6" />
        <pointLight position={[5, -2, -2]} intensity={0.9} color="#FFA69E" />

        <React.Suspense fallback={null}>
          <CarouselScene items={items} onSelect={handleSelect} />
        </React.Suspense>
      </Canvas>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-xs font-mono text-text-3 bg-surface/80 px-3 py-1 rounded-full border border-border-default backdrop-blur-sm">
        3D Campus Stage • Drag to rotate carousel • Click card to view
      </div>
    </div>
  )
}
