import React, { useEffect, useRef, useState } from 'react'
import { AmbientSilkCanvas } from './AmbientSilkCanvas'

export interface GradientEngineProps {
  mode?: 'silk' | 'watercolor' | 'mesh'
  className?: string
  opacity?: number
  speed?: number
  preset?: 'material' | 'poolside' | 'orchid' | 'mint' | 'sunset'
}

/* =========================================================================
   WATERCOLOR SHADER GLSL
   Procedural wet pigment & granulation on deckle paper
   ========================================================================= */
const WATERCOLOR_VS = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const WATERCOLOR_FS = `
precision highp float;
uniform vec2 u_res;
uniform sampler2D u_noise;
uniform vec4 u_shape[4];
uniform vec4 u_pigment[4];
uniform vec2 u_turn[4];
uniform vec3 u_bloom[4];
uniform vec4 u_flow;
uniform float u_scale, u_spread, u_wetness, u_pigmentStrength;
uniform float u_blooms, u_granulation, u_edges, u_texture, u_warmth;

vec4 field(vec2 p) {
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return texture2D(u_noise, (mod(floor(p), 256.0) + f + 0.5) / 256.0);
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x / u_res.x, 1.0 - gl_FragCoord.y / u_res.y);
  float aspect = u_res.x / u_res.y;
  vec2 paper = (uv - 0.5) * vec2(aspect, 1.0) / max(1.0, aspect);
  vec2 p = paper * u_scale;
  vec2 offset = vec2(17.3, 29.8);
  
  vec4 large = field(p * 3.7 + offset + u_flow.xy);
  vec4 mid = field(p * 11.8 + offset + large.rg * 1.7 + u_flow.zw);
  vec4 fine = field(p * 43.0 + offset + mid.rg * 0.8 + u_flow.xy * 0.35);
  vec2 warp = ((large.rg - 0.5) * 0.44 + (mid.rg - 0.5) * 0.16 + (fine.rg - 0.5) * 0.027) * (0.25 + u_spread * 1.4);
  
  float frequency = min(620.0, min(u_res.x, u_res.y) * 0.45);
  vec4 tooth = field(paper * frequency + vec2(37.0, 89.0));
  vec4 fiber = field(paper * min(210.0, frequency * 0.45) + vec2(71.0, 13.0));
  float grain = (tooth.r - 0.5) * 0.68 + (fiber.g - 0.5) * 0.32;
  float feather = 0.025 + u_wetness * 0.31;
  vec3 absorption = vec3(0.0);

  for(int i = 0; i < 4; i++) {
    vec2 delta = p + warp - u_shape[i].xy;
    vec2 turn = u_turn[i];
    vec2 q = vec2(delta.x * turn.x - delta.y * turn.y, delta.x * turn.y + delta.y * turn.x) / u_shape[i].zw;
    float d = length(q) + (fine.b - 0.5) * 0.08;
    float mask = 1.0 - smoothstep(1.0 - feather, 1.0 + feather, d);
    float cloud = mix(large.b, large.a, mod(float(i), 2.0));
    float uneven = 0.55 + cloud * 0.8 + (mid.b - 0.5) * 0.34;
    float edgeDistance = (d - (0.97 - feather * 0.28)) / (0.014 + feather * 0.13);
    float ridge = exp(-edgeDistance * edgeDistance) * u_edges * (0.12 + mid.a * 0.45) * (1.0 - u_wetness * 0.45);
    
    vec2 b = q - u_bloom[i].xy;
    float bd = length(b) + (mid.a - 0.5) * 0.42 + (fine.a - 0.5) * 0.13;
    float bloomRadius = 0.2 + u_blooms * (0.32 + u_bloom[i].z);
    float bloom = (1.0 - smoothstep(bloomRadius - 0.09, bloomRadius + 0.08, bd)) * u_blooms;
    float bloomDistance = (bd - bloomRadius - 0.045) / 0.036;
    float bloomEdge = exp(-bloomDistance * bloomDistance) * u_blooms * 0.33;
    
    float granulate = max(0.15, 1.0 + grain * u_granulation * 0.85 + (fine.g - 0.5) * u_granulation * 0.32);
    float density = (mask * uneven * (1.0 - bloom * 0.78) + ridge + bloomEdge * mask) * granulate;
    density *= u_pigment[i].a * u_pigmentStrength;
    absorption += u_pigment[i].rgb * density;
  }

  vec3 paperColor = mix(vec3(0.995, 0.994, 0.989), vec3(0.99, 0.949, 0.867), u_warmth);
  vec3 color = paperColor * exp(-absorption);
  color *= 1.0 + grain * u_texture * 0.095 + (fiber.b - 0.5) * u_texture * 0.026;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`

// Generate procedural pseudo-random noise texture for watercolor
function createNoiseTexture(): Uint8Array {
  const size = 256
  const data = new Uint8Array(size * size * 4)
  let s = 1977
  for (let i = 0; i < data.length; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    data[i] = Math.floor((s / 4294967296) * 256)
  }
  return data
}

export const WatercolorCanvas: React.FC<{
  className?: string
  opacity?: number
  speed?: number
}> = ({ className = '', opacity = 0.5, speed = 0.04 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: true, depth: false })
    if (!gl) {
      setSupported(false)
      return
    }

    let program: WebGLProgram | null = null
    let animId = 0
    const startTime = performance.now()

    try {
      const vs = gl.createShader(gl.VERTEX_SHADER)!
      gl.shaderSource(vs, WATERCOLOR_VS)
      gl.compileShader(vs)

      const fs = gl.createShader(gl.FRAGMENT_SHADER)!
      gl.shaderSource(fs, WATERCOLOR_FS)
      gl.compileShader(fs)

      program = gl.createProgram()!
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      gl.useProgram(program)

      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      )
      const pos = gl.getAttribLocation(program, 'position')
      gl.enableVertexAttribArray(pos)
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

      // Noise texture
      const noise = createNoiseTexture()
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        256,
        256,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        noise
      )

      // Shapes and pigments in soft Google M3 pastel tones
      const shapes = new Float32Array([
        -0.3, -0.2, 0.45, 0.35,
        0.35, 0.15, 0.5, 0.4,
        -0.1, 0.3, 0.4, 0.45,
        0.1, -0.25, 0.35, 0.3,
      ])
      const pigments = new Float32Array([
        0.1, 0.45, 0.9, 0.35, // Soft M3 Google Blue
        0.55, 0.75, 0.95, 0.3, // Soft Sky
        0.9, 0.95, 0.99, 0.25, // White cloud
        0.2, 0.55, 0.85, 0.2, // Tonal accent
      ])
      const turns = new Float32Array([1, 0, 0.8, 0.6, 0.7, -0.7, 0, 1])
      const blooms = new Float32Array([0.1, 0.1, 0.2, -0.1, 0.1, 0.15, 0.05, -0.1, 0.18, 0, 0, 0.1])

      const uRes = gl.getUniformLocation(program, 'u_res')
      const uShape = gl.getUniformLocation(program, 'u_shape')
      const uPigment = gl.getUniformLocation(program, 'u_pigment')
      const uTurn = gl.getUniformLocation(program, 'u_turn')
      const uBloom = gl.getUniformLocation(program, 'u_bloom')
      const uFlow = gl.getUniformLocation(program, 'u_flow')
      const uScale = gl.getUniformLocation(program, 'u_scale')
      const uSpread = gl.getUniformLocation(program, 'u_spread')
      const uWetness = gl.getUniformLocation(program, 'u_wetness')
      const uPigmentStr = gl.getUniformLocation(program, 'u_pigmentStrength')
      const uBlooms = gl.getUniformLocation(program, 'u_blooms')
      const uGranulation = gl.getUniformLocation(program, 'u_granulation')
      const uEdges = gl.getUniformLocation(program, 'u_edges')
      const uTexture = gl.getUniformLocation(program, 'u_texture')
      const uWarmth = gl.getUniformLocation(program, 'u_warmth')

      gl.uniform4fv(uShape, shapes)
      gl.uniform4fv(uPigment, pigments)
      gl.uniform2fv(uTurn, turns)
      gl.uniform3fv(uBloom, blooms)
      gl.uniform1f(uScale, 1.2)
      gl.uniform1f(uSpread, 0.45)
      gl.uniform1f(uWetness, 0.65)
      gl.uniform1f(uPigmentStr, 0.8)
      gl.uniform1f(uBlooms, 0.3)
      gl.uniform1f(uGranulation, 0.25)
      gl.uniform1f(uEdges, 0.35)
      gl.uniform1f(uTexture, 0.2)
      gl.uniform1f(uWarmth, 0.1)

      const render = () => {
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        const scale = 0.35
        const targetW = Math.max(100, Math.floor(width * scale))
        const targetH = Math.max(100, Math.floor(height * scale))

        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW
          canvas.height = targetH
          gl.viewport(0, 0, targetW, targetH)
        }

        const t = ((performance.now() - startTime) / 1000) * speed
        gl.uniform2f(uRes, targetW, targetH)
        gl.uniform4f(
          uFlow,
          Math.sin(t * 0.7) * 0.25,
          Math.cos(t * 0.5) * 0.2,
          Math.sin(t * 0.4) * 0.15,
          Math.cos(t * 0.6) * 0.22
        )

        gl.drawArrays(gl.TRIANGLES, 0, 3)
        animId = requestAnimationFrame(render)
      }

      animId = requestAnimationFrame(render)

      return () => {
        cancelAnimationFrame(animId)
        if (program) gl.deleteProgram(program)
      }
    } catch {
      setSupported(false)
    }
  }, [speed])

  if (!supported) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 ${className}`}
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(232, 240, 254, 0.6) 0%, rgba(211, 227, 253, 0.25) 50%, transparent 100%)',
          opacity,
        }}
      />
    )
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full object-cover" style={{ opacity }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-canvas/30 to-canvas pointer-events-none" />
    </div>
  )
}

/**
 * Universal Gradient Engine Component
 * Supports 'silk' (WebGL cloth folds), 'watercolor' (pigment wash), or 'mesh' (CSS aura)
 */
export const GradientEngine: React.FC<GradientEngineProps> = ({
  mode = 'silk',
  className = '',
  opacity = 0.45,
  speed = 0.08,
}) => {
  if (mode === 'watercolor') {
    return <WatercolorCanvas className={className} opacity={opacity} speed={speed} />
  }

  if (mode === 'silk') {
    return <AmbientSilkCanvas className={className} opacity={opacity} speed={speed} />
  }

  // Mesh gradient fallback
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        background:
          'radial-gradient(circle at 20% 20%, rgba(26, 115, 232, 0.08) 0%, transparent 45%), radial-gradient(circle at 80% 30%, rgba(211, 227, 253, 0.25) 0%, transparent 55%), radial-gradient(circle at 50% 80%, rgba(232, 240, 254, 0.4) 0%, transparent 60%)',
        opacity,
      }}
    />
  )
}
