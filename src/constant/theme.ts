import colors from './colors';
import fonts from './fonts';

export const theme = {
  colors: colors,
  fonts: fonts,
  dark: false,

  paragraphText: '#9aa4ad',
  rectangle: '#161b22',
};

export const AppLightTheme = {
  ...theme,
  dark: false,
  colors: {
    ...colors,
    background: '#FFFFFF',
    text: '#000000',
    card: '#FFFFFF',
    border: '#ADADAD',
    textMuted: '#767676',
  },
};

export const AppDarkTheme = {
  ...theme,
  dark: true,
  colors: {
    ...colors,
    background: '#121212',
    text: '#FFFFFF',
    card: '#1E1E1E',
    border: '#333333',
    textMuted: '#9aa4ad',
  },
};
