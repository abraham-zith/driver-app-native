import i18n from '../i18n/i18n';
import { ms } from '../lib/scale';

/**
 * Returns a language-aware scaled font size.
 * For Tamil (ta), it returns a slightly smaller size to balance the dense characters.
 * @param size The original size (unscaled)
 * @param factor Optional moderate scaling factor
 * @returns The final scaled font size
 */
export const getLanguageScaledSize = (size: number, factor = 0.5) => {
    const isTamil = i18n.language === 'ta';
    const baseScaled = ms(size, factor);
    return isTamil ? baseScaled * 0.92 : baseScaled;
};

/**
 * Returns a language-aware line height factor.
 * Tamil characters often need more vertical space.
 * @param lineHeight Original line height
 * @returns Adjusted line height
 */
export const getLanguageLineHeight = (lineHeight: number) => {
    const isTamil = i18n.language === 'ta';
    return isTamil ? lineHeight * 1.1 : lineHeight;
};
