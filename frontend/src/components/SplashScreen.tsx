import React from 'react';
import { Typography } from '@mui/material';
import '../styles/SplashScreen.css';

export const SplashScreen: React.FC = () => (
  <div className="splash-screen">
    <Typography 
      variant="h4" 
      className="splash-screen__title"
    >
      Welcome to FIPL 2025
    </Typography>
    <img
      src={`${process.env.PUBLIC_URL}/assets/videos/intro.gif`}
      alt="Loading..."
      className="splash-screen__image"
    />
    <Typography 
      variant="h6" 
      className="splash-screen__subtitle"
    >
      Cooking now...
    </Typography>
  </div>
); 