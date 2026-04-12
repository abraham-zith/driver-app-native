type FontStyle = {
  fontFamily: string;
  fontWeight:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
};

const fonts: {
  thin: FontStyle;
  ultraLight: FontStyle;
  light: FontStyle;
  regular: FontStyle;
  medium: FontStyle;
  semiBold: FontStyle;
  bold: FontStyle;
  extraBold: FontStyle;
  heavy: FontStyle;
} = {
  thin: {
    fontFamily: 'Gilroy-Thin',
    fontWeight: 'normal',
  },
  ultraLight: {
    fontFamily: 'Gilroy-UltraLight',
    fontWeight: 'normal',
  },
  light: {
    fontFamily: 'Gilroy-Light',
    fontWeight: 'normal',
  },
  regular: {
    fontFamily: 'Gilroy-Regular',
    fontWeight: 'normal',
  },
  medium: {
    fontFamily: 'Gilroy-Medium',
    fontWeight: 'normal',
  },
  semiBold: {
    fontFamily: 'Gilroy-SemiBold',
    fontWeight: 'normal',
  },
  bold: {
    fontFamily: 'Gilroy-Bold',
    fontWeight: 'normal',
  },
  extraBold: {
    fontFamily: 'Gilroy-ExtraBold',
    fontWeight: 'normal',
  },
  heavy: {
    fontFamily: 'Gilroy-Heavy',
    fontWeight: 'normal',
  },
};

export default fonts;
