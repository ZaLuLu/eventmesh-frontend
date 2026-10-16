/**
 * Zero-asset procedural Web Audio synthesizer for the 3D Stamp.
 * Synthesizes air swoosh, physical rubber thump, paper impact, and wheel clicks
 * using native Web Audio API without loading any external .mp3/.wav files.
 * Based on mortspace/stamp audio physics.
 */

class ProceduralStampSound {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return null
      this.ctx = new AudioCtx()
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return this.ctx
  }

  /**
   * Heavy rubber stamp desk impact thump.
   * Deep bass transient (45-55 Hz sine pitch drop) + muffled rubber surface slap.
   */
  playThump(volume = 1) {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime

    // 1. Bass body drop (sine pitch sweep)
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(140, now)
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.14)

    oscGain.gain.setValueAtTime(0.85 * volume, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(oscGain)
    oscGain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.23)

    // 2. Rubber slap noise burst (lowpass filtered noise)
    const bufferSize = Math.floor(ctx.sampleRate * 0.08)
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015))
    }

    const whiteNoise = ctx.createBufferSource()
    whiteNoise.buffer = noiseBuffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(850, now)
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.08)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.7 * volume, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    whiteNoise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    whiteNoise.start(now)
    whiteNoise.stop(now + 0.08)
  }

  /**
   * Air swoosh as stamp plummets down to paper.
   */
  playSwoosh(volume = 0.5) {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const duration = 0.22
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize
      const envelope = Math.sin(Math.PI * t)
      data[i] = (Math.random() * 2 - 1) * envelope
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(450, now)
    filter.frequency.exponentialRampToValueAtTime(1400, now + duration)
    filter.Q.value = 1.2

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.35 * volume, now)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    source.start(now)
    source.stop(now + duration)
  }

  /**
   * Resonant paper contact chime when lifted away.
   */
  playChime(volume = 0.4) {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06)

    gain.gain.setValueAtTime(0.2 * volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.16)
  }

  /**
   * Tactile wheel scroll tick.
   */
  playTick(volume = 0.3) {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(1200, now)

    gain.gain.setValueAtTime(0.08 * volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.016)
  }
}

export const stampSound = new ProceduralStampSound()
