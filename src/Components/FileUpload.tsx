import {
  View,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Modal,
} from 'react-native';
import React, { useState } from 'react';
import { Styles } from '../lib/styles';
import { useTheme } from '@react-navigation/native';
import Text from './Text';

interface FileUploadProps {

  containerStyle?: ViewStyle | ViewStyle[];
  label?: string;
  labelStyle?: TextStyle | TextStyle[];
  type?: string;
  typeStyle?: TextStyle | TextStyle[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  containerStyle,
  label,
  labelStyle,
  type,
  typeStyle,
}) => {
  const { fonts } = useTheme();
  const [modal, setModal] = useState<boolean>(false);
  return (
    <>
      <TouchableOpacity style={containerStyle} onPress={() => setModal(true)}>
        <View style={[Styles.flex]}>
          <Text style={[Styles.fs18, fonts.medium, labelStyle]}>{label}</Text>
          <Text style={[Styles.fs14, fonts.regular, typeStyle]}>{type}</Text>
        </View>
      </TouchableOpacity>
      <Modal
        transparent
        visible={modal}
        onRequestClose={() => setModal(false)} />
    </>
  );
};

export default React.memo(FileUpload);
