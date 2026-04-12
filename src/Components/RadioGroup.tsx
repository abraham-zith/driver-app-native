import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Styles } from '../lib/styles';

interface Props {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

const RadioGroup: React.FC<Props> = ({ label, value, options, onChange }) => {
  const { colors, fonts }: any = useTheme();

  return (
    <View style={Styles.mb4}>
      <Text style={[fonts.medium, Styles.mb2, { color: colors.primary }]}>
        {label}
      </Text>

      <View style={[Styles.flexRow]}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              Styles.flexRow,
              Styles.alignItemsCenter,
              Styles.mr4,
            ]}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                borderWidth: 2,
                borderColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {value === opt && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: colors.primary,
                  }}
                />
              )}
            </View>

            <Text style={[fonts.regular, Styles.ml2]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default React.memo(RadioGroup);
