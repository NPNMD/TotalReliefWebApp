import { useFCM } from '../hooks/useFCM';

export const FCMManager = () => {
  useFCM();
  return null; // This component doesn't render anything visual
};

