import React, { useEffect, useRef, useState } from 'react'

interface AmbientSilkCanvasProps {
  className?: string
  opacity?: number
  speed?: number
  interactive?: boolean
}

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_res;
uniform float u_angle, u_folds, u_drape, u_tension, u_depth, u_zoom, u_phase, u_time;
uniform float u_sheen, u_thread, u_glow;
uniform vec3 u_light;
uniform sampler2D u_palette;

vec2 clothCoordinates(vec2 xy) {
  float ca = cos(u_angle);
  float sa = sin(u_angle);
  float u = (xy.x * ca + xy.y * sa) / u_zoom;
  float v = (-xy.x * sa + xy.y * ca) / u_zoom;
  float ph = u_phase;
  float t = u_time;
  float a = 0.35 + u_drape * 0.30;
  float wu = a * sin(1.9 * v + 0.6 * u + ph + t) + 0.05 * sin(4.1 * v - 1.3 * u + ph * 0.7 - t * 0.6);
  float wv = a * 0.6 * sin(1.7 * u - 0.5 * v + ph * 1.3 - t * 0.8) + 0.05 * sin(3.7 * u + 1.1 * v + ph * 0.4 + t * 0.5);
  u += wu;
  v += wv;
  float pull = (v + 0.45) * 1.7;
  float spread = 1.0 - u_tension * 0.5 * exp(-pull * pull);
  return vec2(((u + 0.2) / spread - 0.2) * u_folds, v);
}

float cloth(vec2 xy) {
  const float TAU = 6.28318530718;
  vec2 coord = clothCoordinates(xy);
  float lane0 = coord.x;
  float v = coord.y;
  float ph = u_phase;
  float lane = lane0 + 0.45 * sin(lane0 * 0.53 + v * 0.7 + ph) + 0.1 * sin(lane0 * 1.31 - v * 1.1 + ph * 0.6 + u_time * 0.5);
  float lp = lane * 0.35;
  float rolled = lp + 0.05 * sin(TAU * lp + ph * 0.4);
  float amp = 0.6 + 0.40 * sin(lane * 0.71 + v * 0.9 + ph * 1.3);
  float along = 0.8 + 0.2 * sin(v * 2.4 + lane * 0.4 + u_time * 0.3);
  float h = amp * along * (0.5 + 0.5 * cos(TAU * rolled));
  float mask = 0.5 + 0.5 * sin(lane * 0.37 + v * 1.7 + ph * 0.8);
  h += u_tension * 0.03 * mask * (0.5 + 0.5 * cos(TAU * (lp * 2.6 + 0.25 * sin(v * 2.1 + ph))));
  h += u_drape * 0.60 * sin(lane / u_folds * 2.0 + v * 1.3 + ph);
  return u_depth * (0.42 / sqrt(u_folds)) * h;
}

vec3 pal(float t) {
  return texture2D(u_palette, vec2(clamp(t, 0.0, 1.0) * 0.99609375 + 0.001953125, 0.5)).rgb;
}

void main() {
  float aspect = u_res.x / u_res.y;
  float fit = min(1.0, 1.6 / aspect);
  vec2 p = (vec2(gl_FragCoord.x / u_res.x, 1.0 - gl_FragCoord.y / u_res.y) - 0.5) * vec2(aspect, 1.0) * fit;
  float e = 0.001;
  float h = cloth(p);
  vec3 N = normalize(vec3(
    -(cloth(p + vec2(e, 0.0)) - cloth(p - vec2(e, 0.0))) / (2.0 * e),
    -(cloth(p + vec2(0.0, e)) - cloth(p - vec2(0.0, e))) / (2.0 * e),
    1.0
  ));
  
  float dux = clothCoordinates(p + vec2(e, 0.0)).x - clothCoordinates(p - vec2(e, 0.0)).x;
  float duy = clothCoordinates(p + vec2(0.0, e)).x - clothCoordinates(p - vec2(0.0, e)).x;
  vec2 across = normalize(vec2(dux, duy) + 1e-6);
  
  float e2 = 0.012;
  float curv = -(cloth(p + across * e2) + cloth(p - across * e2) - 2.0 * h) / (e2 * e2);
  vec3 L = u_light;
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  
  float shadow = 1.0;
  for(int i = 1; i <= 6; i++) {
    float d = float(i) * 0.025;
    float clearance = h + L.z * d - cloth(p + L.xy * d);
    shadow = min(shadow, clamp(0.6 + clearance / (d * 0.45), 0.0, 1.0));
  }
  
  float cavity = max(0.0, (cloth(p + vec2(0.03, 0.0)) + cloth(p - vec2(0.03, 0.0)) + cloth(p + vec2(0.0, 0.03)) + cloth(p - vec2(0.0, 0.03))) * 0.25 - h);
  float ao = exp(-cavity * 16.0);
  
  float nl = dot(N, L);
  float wrap = clamp((nl + 0.42) / (1.0 + 0.42), 0.0, 1.0);
  wrap = wrap * wrap * (3.0 - 2.0 * wrap);
  float diffuse = (0.12 + (1.0 - 0.12) * wrap * shadow) * ao;
  
  float scale = 0.055 * mix(1.4, 0.7, u_sheen);
  float cn = curv * scale;
  float crest = smoothstep(0.35, 0.35 + 0.45, cn) * smoothstep(-0.15, 0.45, nl) * shadow;
  
  vec2 fibre = clothCoordinates(p);
  crest *= 0.55 + 0.45 * sin(fibre.y * 3.1 + fibre.x * 0.35 + u_phase * 0.9 + u_time * 0.4);
  float core = smoothstep(0.72, 0.9, cn) * smoothstep(-0.15, 0.45, nl) * shadow;
  
  float nh = max(dot(N, H), 0.0);
  float flank = pow(nh, 5.0) * shadow;
  float sheen = 0.8 * crest + 0.3 * core + 0.4 * flank;
  float rim = 0.2 * pow(1.0 - max(N.z, 0.0), 2.5) * (1.0 - wrap);
  
  float pixel = fit / u_res.y;
  float weave = sin(6.2831853 * dot(p, across) / (pixel * 3.0) + fibre.y * 6.0);
  diffuse *= 1.0 + weave * u_thread * 0.035;
  sheen *= 1.0 + weave * u_thread * 0.035 * 1.5;
  
  float x = diffuse * 1.05;
  float tone = clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
  tone = pow(tone, 1.2) * 0.56;
  
  vec3 body = pal(tone);
  float luma = dot(body, vec3(0.2126, 0.7152, 0.0722));
  body = clamp(mix(vec3(luma), body, 1.15), 0.0, 1.0);
  
  vec3 color = mix(body, pal(0.86), clamp(rim, 0.0, 1.0));
  vec3 sheenColor = mix(pal(0.97), vec3(1.0), 0.55);
  float gain = 1.7 * (0.7 + u_glow * 0.9);
  color = mix(color, sheenColor, 1.0 - exp(-sheen * gain));
  
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  gl_FragColor = vec4(color + dither / 255.0, 1.0);
}
`

/**
 * Helper to build Google Material 3 256x1 palette texture
 * Primary (#1A73E8), Container (#E8F0FE), Surface (#F8F9FA), Pure White (#FFFFFF)
 */
function createMaterial3Palette(): Uint8Array {
  const palette = new Uint8Array(256 * 3)
  
  // Key color stops in 0..1 range:
  // 0.0:  #E8F0FE (Light Blue Tonal Container)
  // 0.35: #D3E3FD (Soft Ambient Blue)
  // 0.65: #F8F9FA (Google Surface)
  // 0.85: #1A73E8 (Google Blue Accent Peak)
  // 1.0:  #FFFFFF (Pure White Glow)
  const stops = [
    { pos: 0.0,  r: 232, g: 240, b: 254 }, // #E8F0FE
    { pos: 0.35, r: 211, g: 227, b: 253 }, // #D3E3FD
    { pos: 0.65, r: 248, g: 249, b: 250 }, // #F8F9FA
    { pos: 0.85, r: 168, g: 200, b: 250 }, // Soft Google Blue tint
    { pos: 1.0,  r: 255, g: 255, b: 255 }, // Pure White
  ]

  for (let i = 0; i < 256; i++) {
    const t = i / 255
    let c1 = stops[0]
    let c2 = stops[stops.length - 1]
    
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s].pos && t <= stops[s + 1].pos) {
        c1 = stops[s]
        c2 = stops[s + 1]
        break
      }
    }

    const range = Math.max(1e-5, c2.pos - c1.pos)
    const factor = (t - c1.pos) / range
    // Smooth cosine interpolation
    const smooth = 0.5 - 0.5 * Math.cos(factor * Math.PI)

    palette[i * 3 + 0] = Math.round(c1.r + (c2.r - c1.r) * smooth)
    palette[i * 3 + 1] = Math.round(c1.g + (c2.g - c1.g) * smooth)
    palette[i * 3 + 2] = Math.round(c1.b + (c2.b - c1.b) * smooth)
  }

  return palette
}

export const AmbientSilkCanvas: React.FC<AmbientSilkCanvasProps> = ({
  className = '',
  opacity = 0.5,
  speed = 0.12,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [webglSupported, setWebglSupported] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Verify WebGL availability
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: false,
    })

    if (!gl) {
      setWebglSupported(false)
      return
    }

    let program: WebGLProgram | null = null
    let animId: number = 0
    let startTime = performance.now()

    try {
      // Compile Vertex Shader
      const vs = gl.createShader(gl.VERTEX_SHADER)!
      gl.shaderSource(vs, VERTEX_SHADER)
      gl.compileShader(vs)
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(vs) || 'VS error')
      }

      // Compile Fragment Shader
      const fs = gl.createShader(gl.FRAGMENT_SHADER)!
      gl.shaderSource(fs, FRAGMENT_SHADER)
      gl.compileShader(fs)
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(fs) || 'FS error')
      }

      program = gl.createProgram()!
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'Link error')
      }

      gl.useProgram(program)

      // Screen Quad Buffer
      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      )

      const aPos = gl.getAttribLocation(program, 'a_pos')
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

      // 256x1 Color Palette Texture
      const paletteData = createMaterial3Palette()
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        256,
        1,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        paletteData
      )

      // Uniform Locations
      const uRes = gl.getUniformLocation(program, 'u_res')
      const uAngle = gl.getUniformLocation(program, 'u_angle')
      const uFolds = gl.getUniformLocation(program, 'u_folds')
      const uDrape = gl.getUniformLocation(program, 'u_drape')
      const uTension = gl.getUniformLocation(program, 'u_tension')
      const uDepth = gl.getUniformLocation(program, 'u_depth')
      const uZoom = gl.getUniformLocation(program, 'u_zoom')
      const uPhase = gl.getUniformLocation(program, 'u_phase')
      const uTime = gl.getUniformLocation(program, 'u_time')
      const uSheen = gl.getUniformLocation(program, 'u_sheen')
      const uThread = gl.getUniformLocation(program, 'u_thread')
      const uGlow = gl.getUniformLocation(program, 'u_glow')
      const uLight = gl.getUniformLocation(program, 'u_light')
      const uPalette = gl.getUniformLocation(program, 'u_palette')

      gl.uniform1i(uPalette, 0)

      // Ambient Silk Shader parameters (Optimized for calming Material 3 aura)
      const angleRad = (42 * Math.PI) / 180
      const folds = 5.0
      const drape = 0.35
      const tension = 0.3
      const depth = 0.42
      const zoom = 1.2
      const phase = 3.14
      const sheen = 0.3
      const thread = 0.2
      const glow = 0.3
      const lightDir = [Math.cos(angleRad) * 0.9, Math.sin(angleRad) * 0.9, 0.55]

      let isVisible = true
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting
      })
      observer.observe(canvas)

      const render = () => {
        if (!isVisible) {
          animId = requestAnimationFrame(render)
          return
        }

        const width = canvas.clientWidth
        const height = canvas.clientHeight

        // Render at downscaled resolution for buttery 60fps & low battery consumption
        const scale = 0.4
        const targetW = Math.max(120, Math.floor(width * scale))
        const targetH = Math.max(120, Math.floor(height * scale))

        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW
          canvas.height = targetH
          gl.viewport(0, 0, targetW, targetH)
        }

        const elapsed = (performance.now() - startTime) / 1000
        const simTime = elapsed * speed

        gl.useProgram(program)
        gl.uniform2f(uRes, targetW, targetH)
        gl.uniform1f(uAngle, angleRad)
        gl.uniform1f(uFolds, folds)
        gl.uniform1f(uDrape, drape)
        gl.uniform1f(uTension, tension)
        gl.uniform1f(uDepth, depth)
        gl.uniform1f(uZoom, zoom)
        gl.uniform1f(uPhase, phase)
        gl.uniform1f(uTime, simTime)
        gl.uniform1f(uSheen, sheen)
        gl.uniform1f(uThread, thread)
        gl.uniform1f(uGlow, glow)
        gl.uniform3f(uLight, lightDir[0], lightDir[1], lightDir[2])

        gl.drawArrays(gl.TRIANGLES, 0, 3)

        animId = requestAnimationFrame(render)
      }

      animId = requestAnimationFrame(render)

      return () => {
        cancelAnimationFrame(animId)
        observer.disconnect()
        if (program) {
          gl.deleteProgram(program)
        }
      }
    } catch {
      setWebglSupported(false)
    }
  }, [speed])

  if (!webglSupported) {
    // Beautiful CSS fallback with identical Material 3 tonal colorway
    return (
      <div
        className={`pointer-events-none absolute inset-0 ${className}`}
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 10%, rgba(232, 240, 254, 0.7) 0%, rgba(211, 227, 253, 0.3) 50%, transparent 100%)',
          opacity,
        }}
      />
    )
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover transition-opacity duration-700"
        style={{ opacity }}
      />
      {/* Soft Bottom Vignette for seamless blend into Google M3 canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-canvas/40 to-canvas pointer-events-none" />
    </div>
  )
}
