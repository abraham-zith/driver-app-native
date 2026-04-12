import React from 'react';
import { View } from 'react-native';
import Text from './Text';
import { Styles } from '../lib/styles';
import fonts from '../constant/fonts';
import { SvgProps } from 'react-native-svg';

interface CardProps{
    icon: React.ComponentType<SvgProps>;
    label: string;
    value: string;
}
const Card: React.FC<CardProps> = ({ icon: Icon, label, value }) => {
    return (
        <View style={[Styles.card1]}>
            {Icon && <Icon />}
            <Text style={[Styles.fs12]}>{label}</Text>
            <Text style={[Styles.fs18, fonts.medium]}>{value}</Text>
        </View>
    );
};

export default Card;
