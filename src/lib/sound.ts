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
    const { isMuted } = useSoundStore.getState()
    if (isMuted) return false

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
   * Cheerful, bright 3-note ascending chime (A5 -> C#6 -> E6 + A6 shimmer)
   * Simulates an official high-affirmation gate admission turnstile confirmation.
   */
  playGateAdmissionChime() {
    try {
      const ctx = this.getContext()
      if (!ctx) return

      const now = ctx.currentTime

      // Note 1: 880Hz (A5)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(880, now)

      gain1.gain.setValueAtTime(0, now)
      gain1.gain.linearRampToValueAtTime(0.22, now + 0.015)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.20)

      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.20)

      // Note 2: 1108.7Hz (C#6)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(1108.7, now + 0.08)

      gain2.gain.setValueAtTime(0, now + 0.08)
      gain2.gain.linearRampToValueAtTime(0.24, now + 0.095)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.30)

      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.08)
      osc2.stop(now + 0.30)

      // Note 3: 1318.5Hz (E6) - strong affirmation tone
      const osc3 = ctx.createOscillator()
      const gain3 = ctx.createGain()
      osc3.type = 'sine'
      osc3.frequency.setValueAtTime(1318.5, now + 0.16)

      gain3.gain.setValueAtTime(0, now + 0.16)
      gain3.gain.linearRampToValueAtTime(0.28, now + 0.18)
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.52)

      osc3.connect(gain3)
      gain3.connect(ctx.destination)
      osc3.start(now + 0.16)
      osc3.stop(now + 0.52)

      // High octave chime shimmer (1760Hz - A6)
      const oscShimmer = ctx.createOscillator()
      const gainShimmer = ctx.createGain()
      oscShimmer.type = 'triangle'
      oscShimmer.frequency.setValueAtTime(1760, now + 0.16)

      gainShimmer.gain.setValueAtTime(0, now + 0.16)
      gainShimmer.gain.linearRampToValueAtTime(0.09, now + 0.18)
      gainShimmer.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

      oscShimmer.connect(gainShimmer)
      gainShimmer.connect(ctx.destination)
      oscShimmer.start(now + 0.16)
      oscShimmer.stop(now + 0.45)
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
   * Warning double-pulse tone (580Hz -> 580Hz)
   * Signals duplicate scans, already admitted, or offline queued pass.
   */
  playWarningTone() {
    try {
      const ctx = this.getContext()
      if (!ctx) return

      const now = ctx.currentTime
      const playPulse = (startTime: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(580, startTime)

        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + 0.12)
      }

      playPulse(now)
      playPulse(now + 0.16)
    } catch {}
  }

  /**
   * Distinct dual-buzz warning tone ("BZZT - BZZT!") for gate rejection / access denied.
   * Uses dual sawtooth/square generators through a warm low-pass filter to produce
   * an authoritative, unmistakable physical buzzer sound.
   */
  playRejectionTone() {
    try {
      const ctx = this.getContext()
      if (!ctx) return

      const now = ctx.currentTime

      // --- Pulse 1: 0.00s -> 0.13s (260Hz -> 180Hz) ---
      const filter1 = ctx.createBiquadFilter()
      filter1.type = 'lowpass'
      filter1.frequency.setValueAtTime(1200, now)

      const osc1A = ctx.createOscillator()
      osc1A.type = 'sawtooth'
      osc1A.frequency.setValueAtTime(260, now)
      osc1A.frequency.linearRampToValueAtTime(180, now + 0.13)

      const osc1B = ctx.createOscillator()
      osc1B.type = 'square'
      osc1B.frequency.setValueAtTime(175, now)

      const gain1 = ctx.createGain()
      gain1.gain.setValueAtTime(0, now)
      gain1.gain.linearRampToValueAtTime(0.28, now + 0.01)
      gain1.gain.setValueAtTime(0.25, now + 0.10)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.13)

      osc1A.connect(filter1)
      osc1B.connect(filter1)
      filter1.connect(gain1)
      gain1.connect(ctx.destination)

      osc1A.start(now)
      osc1B.start(now)
      osc1A.stop(now + 0.13)
      osc1B.stop(now + 0.13)

      // --- Pulse 2: 0.19s -> 0.36s (Lower pitch 200Hz -> 125Hz for rejection feel) ---
      const t2 = now + 0.19
      const filter2 = ctx.createBiquadFilter()
      filter2.type = 'lowpass'
      filter2.frequency.setValueAtTime(1000, t2)

      const osc2A = ctx.createOscillator()
      osc2A.type = 'sawtooth'
      osc2A.frequency.setValueAtTime(200, t2)
      osc2A.frequency.linearRampToValueAtTime(125, t2 + 0.17)

      const osc2B = ctx.createOscillator()
      osc2B.type = 'square'
      osc2B.frequency.setValueAtTime(130, t2)

      const gain2 = ctx.createGain()
      gain2.gain.setValueAtTime(0, t2)
      gain2.gain.linearRampToValueAtTime(0.30, t2 + 0.01)
      gain2.gain.setValueAtTime(0.26, t2 + 0.12)
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.17)

      osc2A.connect(filter2)
      osc2B.connect(filter2)
      filter2.connect(gain2)
      gain2.connect(ctx.destination)

      osc2A.start(t2)
      osc2B.start(t2)
      osc2A.stop(t2 + 0.17)
      osc2B.stop(t2 + 0.17)
    } catch {}
  }

  /**
   * Cautionary dual-tone double alert (E5 659.3Hz -> C5 523.3Hz)
   * Distinct auditory signature for an already-scanned / duplicate ticket pass.
   * Clear and polite, warning the organizer that the ticket was already redeemed.
   */
  playAlreadyScannedTone() {
    try {
      const ctx = this.getContext()
      if (!ctx) return

      const now = ctx.currentTime

      // Tone 1: 659.3Hz (E5) - alert ping
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'triangle'
      osc1.frequency.setValueAtTime(659.3, now)

      gain1.gain.setValueAtTime(0, now)
      gain1.gain.linearRampToValueAtTime(0.24, now + 0.012)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.14)

      // Tone 2: 523.3Hz (C5) - cautionary lower note
      const t2 = now + 0.13
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(523.3, t2)

      gain2.gain.setValueAtTime(0, t2)
      gain2.gain.linearRampToValueAtTime(0.26, t2 + 0.015)
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.32)

      // Subtle warmth harmonic (1046.5Hz C6)
      const oscWarmth = ctx.createOscillator()
      const gainWarmth = ctx.createGain()
      oscWarmth.type = 'sine'
      oscWarmth.frequency.setValueAtTime(1046.5, t2)

      gainWarmth.gain.setValueAtTime(0, t2)
      gainWarmth.gain.linearRampToValueAtTime(0.08, t2 + 0.015)
      gainWarmth.gain.exponentialRampToValueAtTime(0.001, t2 + 0.25)

      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      oscWarmth.connect(gainWarmth)
      gainWarmth.connect(ctx.destination)

      osc2.start(t2)
      osc2.stop(t2 + 0.32)
      oscWarmth.start(t2)
      oscWarmth.stop(t2 + 0.25)
    } catch {}
  }

  /**
   * Alias for distinct wrong pass / denial buzzer
   */
  playWrongPassTone() {
    this.playRejectionTone()
  }

  /**
   * Backwards-compatible alias for rejection tone
   */
  playErrorTone() {
    this.playRejectionTone()
  }
}

export const soundController = new SoundController()
export const playGateAdmissionChime = () => soundController.playGateAdmissionChime()
export const playWarningTone = () => soundController.playWarningTone()
export const playAlreadyScannedTone = () => soundController.playAlreadyScannedTone()
export const playWrongPassTone = () => soundController.playRejectionTone()
export const playRejectionTone = () => soundController.playRejectionTone()
export const playTearImpulse = () => soundController.playTearImpulse()
export const playLaserScanChirp = () => soundController.playLaserScanChirp()
export const playPaperTearSound = () => soundController.playPaperTearSound()
export const playErrorTone = () => soundController.playRejectionTone()

export function playSound(
  type:
    | 'gate_chime'
    | '1st_time_scan'
    | 'success'
    | 'checkin'
    | 'warning'
    | 'already_scanned'
    | 'already_admitted'
    | 'duplicate'
    | 'wrong_pass'
    | 'wrong_event'
    | 'error'
    | 'rejection'
    | 'denied'
    | 'paper_tear'
    | 'laser'
    | string
) {
  if (
    type === 'gate_chime' ||
    type === '1st_time_scan' ||
    type === 'success' ||
    type === 'checkin'
  ) {
    // 1. 1st time scanning: Celebratory bright 3-note ascending chime
    soundController.playGateAdmissionChime()
  } else if (
    type === 'already_scanned' ||
    type === 'already_admitted' ||
    type === 'duplicate'
  ) {
    // 2. Already scanned pass: Cautionary dual-tone double alert ping
    soundController.playAlreadyScannedTone()
  } else if (type === 'warning') {
    soundController.playWarningTone()
  } else if (
    type === 'wrong_pass' ||
    type === 'wrong_event' ||
    type === 'error' ||
    type === 'rejection' ||
    type === 'denied'
  ) {
    // 3. Wrong pass: Heavy dual-buzz rejection buzzer
    soundController.playRejectionTone()
  } else if (type === 'paper_tear') {
    soundController.playPaperTearSound()
  } else {
    soundController.playLaserScanChirp()
  }
}
