/**
 * Web Audio API synthesized sounds for tactile kiosk and check-in interactions.
 * Zero external audio file dependencies.
 * Enhanced with SoundProvider controls, global mute, and reduced-motion compliance (Audit F-14).
 */

import { useSoundStore } from '@/stores/useSoundStore'

class SoundController {
  private ctx: AudioContext | null = null

  private isAudioPermitted(): boolean {
    if (typeof window === 'undefined') return false
    // 1. Check global user mute setting
    const { isMuted, hasUserGesture } = useSoundStore.getState()
    if (isMuted) return false

    // 2. Respect OS-level reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

    // 3. User gesture check (prevent autoplay policy errors)
    if (!hasUserGesture) return false

    return true
  }

  private getContext(): AudioContext | null {
    if (!this.isAudioPermitted()) return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  /**
   * Positive dual-tone admission chime (880Hz -> 1320Hz)
   * Simulates a physical event scanner / kiosk terminal check-in confirmation.
   */
  playGateAdmissionChime() {
    try {
      const ctx = this.getContext()
      if (!ctx) return

      const now = ctx.currentTime

      // Tone 1: 880Hz (A5)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(880, now)

      gain1.gain.setValueAtTime(0, now)
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.02)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

      osc1.connect(gain1)
      gain1.connect(ctx.destination)

      osc1.start(now)
      osc1.stop(now + 0.25)

      // Tone 2: 1320Hz (E6) - higher affirmation tone
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1320, now + 0.08)

      gain2.gain.setValueAtTime(0, now + 0.08)
      gain2.gain.linearRampToValueAtTime(0.25, now + 0.1)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

      osc2.connect(gain2)
      gain2.connect(ctx.destination)

      osc2.start(now + 0.08)
      osc2.stop(now + 0.45)
    } catch {
      // Gracefully silent if audio context is blocked
    }
  }

  /**
   * Laser scan chirp simulating a barcode / QR scanner beep
   */
  playLaserScanChirp() {
    try {
      const ctx = this.getContext()
      if (!ctx) return

      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(1400, now)
      osc.frequency.linearRampToValueAtTime(2200, now + 0.08)

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.18, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.1)
    } catch {}
  }

  /**
   * Realistic paper tear friction and fiber snapping sound synthesized via white noise burst
   */
  playPaperTearSound() {
    try {
      const ctx = this.getContext()
      if (!ctx) return

      const bufferSize = ctx.sampleRate * 0.45 // 450ms noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      // Bandpass filter to sound like rough paper fibers ripping
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(1800, ctx.currentTime)
      filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.4)
      filter.Q.setValueAtTime(3.5, ctx.currentTime)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      noise.start(ctx.currentTime)
      noise.stop(ctx.currentTime + 0.45)
    } catch {}
  }

  /**
   * Soft mechanical tear click / haptic impulse
   */
  playTearImpulse() {
    try {
      const ctx = this.getContext()
      if (!ctx) return

      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(240, now)
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.06)

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.06)
    } catch {}
  }

  /**
   * Low discordant buzz for rejection / scan error
   */
  playErrorTone() {
    try {
      const ctx = this.getContext()
      if (!ctx) return

      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(160, now)
      osc.frequency.linearRampToValueAtTime(110, now + 0.22)

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.25)
    } catch {}
  }
}

export const soundController = new SoundController()
export const playGateAdmissionChime = () => soundController.playGateAdmissionChime()
export const playTearImpulse = () => soundController.playTearImpulse()
export const playLaserScanChirp = () => soundController.playLaserScanChirp()
export const playPaperTearSound = () => soundController.playPaperTearSound()
export const playErrorTone = () => soundController.playErrorTone()

export function playSound(type: 'gate_chime' | 'success' | 'error' | 'paper_tear' | 'laser' | string) {
  if (type === 'gate_chime' || type === 'success') {
    soundController.playGateAdmissionChime()
  } else if (type === 'error') {
    soundController.playErrorTone()
  } else if (type === 'paper_tear') {
    soundController.playPaperTearSound()
  } else {
    soundController.playLaserScanChirp()
  }
}
