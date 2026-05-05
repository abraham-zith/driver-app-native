import React, { useEffect } from 'react';
import {
    Modal,
    View,
    Image,
    StyleSheet,
    Pressable,
    Dimensions,
    StatusBar,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';

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
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isVisible) {
            scale.value = withSpring(1, { damping: 15, stiffness: 100 });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            scale.value = withTiming(0.8, { duration: 200 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [isVisible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const handleClose = () => {
        scale.value = withTiming(0.8, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(onClose)();
        });
    };

    if (!isVisible && opacity.value === 0) {
        return null;
    }

    const sourceUri = imageUri
        ? (imageUri.startsWith('http') || imageUri.startsWith('file://') || imageUri.startsWith('data:')
            ? imageUri
            : 'file://' + imageUri)
        : null;

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="black" />
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="dark"
                    blurAmount={10}
                    reducedTransparencyFallbackColor="black"
                />
                <Pressable style={styles.backdrop} onPress={handleClose}>
                    <Animated.View style={[styles.imageContainer, animatedStyle]}>
                        <Pressable onPress={() => { }}>
                            {sourceUri && (
                                <Image
                                    source={{ uri: sourceUri }}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            )}
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: width * 0.9,
        height: height * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    image: {
        width: width * 0.9,
        height: height * 0.7,
        borderRadius: 20,
    },
});

export default ImageZoomModal;
