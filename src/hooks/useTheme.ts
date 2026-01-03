import { useSettings } from '../context/SettingsContext';
import { lightColors, darkColors } from '../theme/colors';

export const useTheme = () => {
  const { settings } = useSettings();
  const colors = settings.darkMode ? darkColors : lightColors;

  return {
    colors,
    isDarkMode: settings.darkMode,
  };
};
