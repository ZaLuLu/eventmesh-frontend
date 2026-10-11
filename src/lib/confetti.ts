import confetti from 'canvas-confetti'

export function triggerConfetti(origin?: { x: number; y: number }) {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: origin || { y: 0.7 },
      colors: ['#2F4BD6', '#7B63A8', '#E6E4F3', '#151130', '#10B981'],
      disableForReducedMotion: true,
    })
  } catch (err) {
    console.debug('Confetti suppressed:', err)
  }
}

export function triggerBurstConfetti() {
  try {
    const count = 100
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#2F4BD6', '#7B63A8', '#E6E4F3', '#C66A4A', '#38BDF8'],
    }

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  } catch (err) {
    console.debug('Burst confetti suppressed:', err)
  }
}

export const fireCelebrationConfetti = triggerBurstConfetti
