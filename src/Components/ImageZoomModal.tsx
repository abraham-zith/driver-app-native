import React from 'react';
import {
    Modal,
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

interface ImageZoomModalProps {
    isVisible: boolean;
    imageUri?: string;
    onClose: () => void;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
    isVisible,
    imageUri,
    onClose,
}) => {
    if (!imageUri) {return null;}

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <Ionicons name="close" size={30} color="#fff" />
                </TouchableOpacity>

                <Image
                    source={{ uri: imageUri.startsWith('file://') ? imageUri : 'file://' + imageUri }}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 25,
    },
    image: {
        width: width,
        height: height * 0.8,
    },
});

export default ImageZoomModal;
