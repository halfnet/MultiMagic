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
  // Initial burst
  const duration = 3000; // Increased duration to 3 seconds
  const animationEnd = Date.now() + duration;
  let particleCount = 0;

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  // Multiple bursts from different positions
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    particleCount = 50 * (timeLeft / duration);

    // Left side
    confetti({
      particleCount: particleCount,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: colors
    });

    // Right side
    confetti({
      particleCount: particleCount,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: colors
    });

  }, 150);

  // Add some random bursts from random positions
  const randomBursts = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      clearInterval(randomBursts);
      return;
    }

    confetti({
      particleCount: 30,
      startVelocity: 30,
      spread: 360,
      origin: { 
        x: Math.random(), 
        y: Math.random() - 0.2
      },
      colors: colors
    });
  }, 200);
};