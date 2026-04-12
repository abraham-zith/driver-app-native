import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const hS = (size: number) =>
  (width / guidelineBaseWidth) * size;

export const vS = (size: number) =>
  (height / guidelineBaseHeight) * size;

export const mS = (size: number, factor = 0.5) =>
  size + (Math.min(hS(size), vS(size)) - size) * factor;

// Lowercase aliases for convenience
export const s = hS;
export const vs = vS;
export const ms = mS;
export const mvs = (size: number, factor = 0.5) =>
  size + (vS(size) - size) * factor;

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
