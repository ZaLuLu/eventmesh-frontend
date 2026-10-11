/**
 * Web Audio API synthesized sounds for tactile kiosk and check-in interactions.
 * Zero external audio file dependencies.
 */

class SoundController {
  private ctx: AudioContext | null = null

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
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
      // Gracefully silent if user has not interacted with DOM or audio is disabled
    }
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
    } catch {
      // Graceful fallback
    }
  }
}

export const soundController = new SoundController()
export const playGateAdmissionChime = () => soundController.playGateAdmissionChime()
export const playTearImpulse = () => soundController.playTearImpulse()
