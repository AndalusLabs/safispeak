export const logoAnimation = {
    from: {
      translateY: 0,
      scale: 0.8,
      opacity: 0.7,
    },
    animate: {
      translateY: -15,
      scale: 1,
      opacity: 1,
    },
    transition: {
      type: 'timing',
      duration: 1500,
      loop: true,
      repeatReverse: true,
    } as any, // <- werkt altijd
  };
  