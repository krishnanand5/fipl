declare module 'react-fireworks' {
  interface FireworksOptions {
    speed?: number;
    acceleration?: number;
    friction?: number;
    gravity?: number;
    particles?: number;
    explosion?: number;
  }

  interface FireworksProps {
    options?: FireworksOptions;
  }

  const Fireworks: React.FC<FireworksProps>;
  export default Fireworks;
} 