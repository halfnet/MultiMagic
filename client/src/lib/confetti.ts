import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0.5,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['star'],
    colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ['star']
  });

  confetti({
    ...defaults,
    particleCount: 25,
    scalar: 0.75,
    shapes: ['circle']
  });
};

export const triggerCelebration = () => {
  const duration = 1500;
  const animationEnd = Date.now() + duration;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      particleCount,
      spread: 80,
      origin: { x: Math.random(), y: Math.random() - 0.2 }
    });
  }, 250);
};
