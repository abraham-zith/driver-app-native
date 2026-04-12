import { useTheme as useNativeTheme } from '@react-navigation/native';
import { theme } from '../constant/theme';

export type AppTheme = typeof theme;

export const useTheme = () => useNativeTheme() as unknown as AppTheme;

// We also have a custom hook for the app theme context
export { useAppTheme } from '../context/ThemeContext';
