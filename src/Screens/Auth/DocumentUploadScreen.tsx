import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Styles } from '../../lib/styles';
import { Text } from '../../Components';
import Button from '../../Components/Button';
import { setUser } from '../../redux/userSlice';
import { useGetDocUploadUrlMutation, useSaveDocumentMutation } from '../../service/driverApi';
import { documentApi } from '../../api/documentApi';
import { Platform } from 'react-native';
import AppStatusBar from '../../Components/AppStatusBar';
import { useAlert } from '../../context/AlertContext';
import { useAppTheme } from '../../context/ThemeContext';

/* ================= SCREEN ================= */

const DocumentUploadScreen: React.FC<any> = ({ navigation, route }) => {
  const { side, label, backendType } = route.params;
  const { colors, fonts } = useTheme();
  const { theme } = useAppTheme();
  const { showAlert } = useAlert();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.userSlice.user);

  const [images, setImages] = useState<Record<string, string>>({});
  const [uploadingSide, setUploadingSide] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [getUploadUrl] = useGetDocUploadUrlMutation();
  const [saveDocument] = useSaveDocumentMutation();

  /* ---------------- PICK IMAGE ---------------- */
  const pickImage = async (sideName: string, fromCamera = false) => {
    if (!ImagePicker) {
      showAlert({
        title: 'Error',
        message: 'Image Picker module is not available. Please restart the app or check native linking.',
        singleButton: true,
        icon: 'alert-circle-outline',
      });
      return;
    }
    try {
      setUploadingSide(sideName);

      const res = fromCamera
        ? await ImagePicker.openCamera({
          width: 900,
          height: 1200,
          cropping: true,
          compressImageQuality: 0.8,
          useFrontCamera: label === 'Profile_Selfie',
        })
        : await ImagePicker.openPicker({
          width: 900,
          height: 1200,
          cropping: true,
          compressImageQuality: 0.8,
        });

      setImages(prev => ({
        ...prev,
        [sideName]: res.path,
      }));
    } catch {
      // cancelled
    } finally {
      setUploadingSide(null);
    }
  };

  /* ---------------- SOURCE SELECT ---------------- */
  const chooseSource = (sideName: string) => {
    showAlert({
      title: 'Upload document',
      message: 'Choose image source',
      confirmText: 'Camera',
      cancelText: 'Gallery',
      onConfirm: () => pickImage(sideName, true),
      onCancel: () => pickImage(sideName, false),
      icon: 'camera-outline',
    });
  };

  /* ---------------- CONTINUE ---------------- */
  const handleContinue = async () => {
    if (Object.keys(images).length !== side.length) {
      showAlert({
        title: 'Incomplete upload',
        message: 'Please upload all required document sides',
        singleButton: true,
        icon: 'information-circle-outline',
      });
      return;
    }

    if (!user?.driverId) {
      showAlert({
        title: 'Error',
        message: 'Driver ID missing',
        singleButton: true,
        icon: 'alert-circle-outline',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const documentUrl: Record<string, string> = {};

      // 1. Upload each side to S3
      for (const s of side) {
        const filePath = images[s];
        const mime = 'image/jpeg';


        // Get Presigned URL
        const { data: uploadData } = await getUploadUrl({
          driverId: user.driverId,
          documentType: backendType, // Use the proper backend enum
          contentType: mime,
        }).unwrap();

        let uploadUrl = uploadData.uploadUrl;
        const fileUrl = uploadData.fileUrl || uploadUrl.split('?')[0];

        if (Platform.OS === 'android' && uploadUrl.includes('localhost')) {
          uploadUrl = uploadUrl.replace('localhost', '10.0.2.2');
        }

        // Upload to S3
        await documentApi.uploadToS3(uploadUrl, filePath, mime);
        documentUrl[s] = fileUrl;
      }

      // 2. Save Document to Backend
      await saveDocument({
        driverId: user.driverId,
        documentType: backendType, // Use the proper backend enum
        documentUrl,
      }).unwrap();

      // 3. Update Local Redux State (for immediate UI reflection)
      const payload: Record<string, any> = {};
      payload[label] = 'Uploaded';
      side.forEach((s: string) => {
        payload[`${label}_${s}_image`] = images[s];
      });

      // Update nested documents object in Redux
      const updatedDocs = { ...(user.documents || {}) };
      updatedDocs[label] = {
        status: 'UPLOADED',
        preview: documentUrl.front || documentUrl.back || images.front || images.photo,
      };

      dispatch(setUser({ documents: updatedDocs }));

      setIsSubmitting(false);
      navigation.goBack();
    } catch (error) {
      setIsSubmitting(false);
      console.error('Upload Error:', error);
      showAlert({
        title: 'Upload Failed',
        message: 'There was an error uploading your document.',
        singleButton: true,
        icon: 'close-circle-outline',
      });
    }
  };

  /* ---------------- HELPERS ---------------- */
  const getTitle = () => label.replaceAll('_', ' ');

  const getSideLabel = (s: string) =>
    s === 'front' ? 'Front Side' : s === 'back' ? 'Back Side' : 'Photo';

  const getTip = () => {
    if (label.includes('Driving')) { return 'Ensure license text is readable'; }
    if (label.includes('Aadhar')) { return 'No glare, all corners visible'; }
    if (label.includes('Pan')) { return 'Upload original PAN card only'; }
    return 'Upload a clear, valid document';
  };

  /* ================= UI ================= */
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppStatusBar />
      <View style={[Styles.flex, styles.container]}>
        {/* HEADER */}
        <Text style={[fonts.bold, styles.title]}>
          Upload {getTitle()}
        </Text>

        <Text style={styles.subtitle}>{getTip()}</Text>

        {/* UPLOAD BOXES */}
        <View style={styles.row}>
          {side.map((s: string) => {
            const hasImage = !!images[s];
            const isUploading = uploadingSide === s;

            return (
              <View key={s} style={styles.col}>
                <Text style={styles.sideLabel}>{getSideLabel(s)}</Text>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => chooseSource(s)}
                  style={[
                    styles.uploadBox,
                    {
                      borderColor: hasImage
                        ? '#2E7D32'
                        : colors.border,
                    },
                  ]}
                >
                  {hasImage ? (
                    <>
                      <Image
                        source={{ uri: 'file://' + images[s] }}
                        style={styles.image}
                      />

                      {/* RETAKE */}
                      <TouchableOpacity
                        style={styles.retake}
                        onPress={() => chooseSource(s)}
                      >
                        <Ionicons name="refresh" size={18} color="#fff" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.placeholder}>
                      {isUploading ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : (
                        <>
                          <Ionicons
                            name="camera-outline"
                            size={26}
                            color={colors.border}
                          />
                          <Text style={styles.placeholderText}>
                            Tap to upload
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* SECURITY */}
        <View style={styles.secureRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={colors.border}
          />
          <Text style={styles.secureText}>
            Documents are encrypted & secure
          </Text>
        </View>

        {/* CONTINUE */}
        <Button
          disabled={Object.keys(images).length !== side.length || isSubmitting}
          onPress={handleContinue}
        >
          {isSubmitting ? <ActivityIndicator color="#fff" /> : 'Save & Continue'}
        </Button>
      </View>
    </View>
  );
};

export default DocumentUploadScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  col: {
    flex: 1,
  },
  sideLabel: {
    fontSize: 13,
    marginBottom: 6,
    opacity: 0.7,
  },
  uploadBox: {
    height: 220,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 13,
    opacity: 0.6,
  },
  retake: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#000000AA',
    padding: 8,
    borderRadius: 20,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  secureText: {
    marginLeft: 6,
    fontSize: 12,
    opacity: 0.6,
  },
});
