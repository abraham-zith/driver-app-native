import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Styles } from '../lib/styles';
import { useTheme } from '@react-navigation/native';

interface OTPInputProps {
  numberOfDigits?: number;
  onChangeText?: (value: string) => void;
  value?: string;
  containerStyle?: ViewStyle | ViewStyle[];
  hasError?: boolean;
  autoFocus?: boolean; // ✅ ADD
}

const OTPInput: React.FC<OTPInputProps> = ({
  numberOfDigits = 6,
  onChangeText = () => { },
  value = '',
  containerStyle,
  hasError = false,
  autoFocus = false,
}) => {
  const [valueArray, setValueArray] = useState<string[]>([]);
  const { colors, fonts } = useTheme();
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    setValueArray(value.split(''));
  }, [value]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...valueArray];

    if (text) {
      newCode[index] = text;
      onChangeText(newCode.join(''));

      if (index < numberOfDigits - 1) {
        inputs.current[index + 1]?.focus();
      }
    } else {
      newCode.splice(index, 1);
      onChangeText(newCode.join(''));

      if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View
      style={[
        styles.container, // ✅ FIXED LAYOUT
        containerStyle,
      ]}
    >
      {Array(numberOfDigits)
        .fill('')
        .map((_x, i) => (
          <TextInput
            key={i}
            value={valueArray[i] || ''}
            style={[
              Styles.bw1,
              Styles.br2,
              fonts.medium,
              Styles.fs16,
              styles.box,
              {
                borderColor: hasError
                  ? '#EF4444'
                  : colors.primary,
                color: colors.text,
              },
              i !== numberOfDigits - 1 && styles.gap, // ✅ GAP
            ]}
            textAlign="center"
            keyboardType="number-pad"
            maxLength={1}
            underlineColorAndroid="transparent"
            onChangeText={text =>
              handleChange(text.replace(/[^0-9]/g, ''), i)
            }
            autoFocus={i === 0 && autoFocus}
            ref={ref => { inputs.current[i] = ref; }}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center', // ✅ CENTERED
  },
  box: {
    height: 48,
    width: 48,
  },
  gap: {
    marginRight: 12, // ✅ PERFECT OTP GAP
  },
});

export default React.memo(OTPInput);
