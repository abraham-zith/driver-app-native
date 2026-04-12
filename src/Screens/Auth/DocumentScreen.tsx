import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { RootState } from '../../redux/store';
import { Text } from '../../Components';
import Button from '../../Components/Button';
import {
  useSubmitDocumentsMutation,
  useGetDriverDocumentsQuery,
} from '../../service/driverApi';
import { useAppTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../redux/userSlice';
import { ActivityIndicator, Modal, RefreshControl, ScrollView } from 'react-native';
import AppStatusBar from '../../Components/AppStatusBar';

import {
  AadharCard,
  DrivingLicence,
  PanCard,
  PoliceVerification,
} from '../../assets/svg';

import {
  DocumentUploadScreen_Nav,
  Dashboard_Nav,
} from '../../Navigations/navigations';

/* ================= TYPES ================= */



interface DocumentItem {
  key: 'Driving_License' | 'Pan_Card' | 'Aadhar_Card' | 'Police_Verification' | 'Profile_Selfie';
  backendType: 'driving_license' | 'pan_card' | 'aadhaar_card' | 'police_verification' | 'profile_selfie';
  label: string;
  Logo: React.ComponentType<any>;
  type: string;
  hint: string;
  side: ('front' | 'back')[];
}

/* ================= DOCUMENT CONFIG ================= */

const DOCUMENTS: DocumentItem[] = [
  {
    key: 'Driving_License',
    backendType: 'driving_license',
    label: 'Driving License',
    Logo: DrivingLicence,
    type: 'Front & Back',
    hint: 'Must be valid and clearly visible',
    side: ['front', 'back'],
  },
  {
    key: 'Pan_Card',
    backendType: 'pan_card',
    label: 'PAN Card',
    Logo: PanCard,
    type: 'Front photo',
    hint: 'Name should match profile',
    side: ['front'],
  },
  {
    key: 'Aadhar_Card',
    backendType: 'aadhaar_card',
    label: 'Aadhar Card',
    Logo: AadharCard,
    type: 'Front & Back',
    hint: 'Avoid glare & blur',
    side: ['front', 'back'],
  },
  {
    key: 'Police_Verification',
    backendType: 'police_verification',
    label: 'Police Verification',
    Logo: PoliceVerification,
    type: 'Certificate',
    hint: 'Recent document only',
    side: ['front'],
  },
  {
    key: 'Profile_Selfie',
    backendType: 'profile_selfie',
    label: 'Profile Selfie',
    Logo: () => <Ionicons name="person-circle-outline" size={34} color="#1D4ED8" />,
    type: 'Head-shot photo',
    hint: 'Clear face without sunglasses',
    side: ['front'],
  },
];

/* ================= SCREEN ================= */

const DocumentScreen = ({ navigation }: any) => {
  const { colors, fonts } = useTheme();
  // const insets = useSafeAreaInsets();
  //  const { theme, isDark } = useAppTheme();
  const { showAlert } = useAlert();
  const dispatch = useDispatch();

  const [submitDocuments, { isLoading: isSubmitting }] = useSubmitDocumentsMutation();

  const user = useSelector((state: RootState) => state.userSlice.user);
  const { data: remoteDocs, refetch, isFetching } = useGetDriverDocumentsQuery(user?.driverId || '', {
    skip: !user?.driverId,
    refetchOnMountOrArgChange: true,
  });


  const isWaitingForAdmin = user?.onboarding_status === 'DOCS_SUBMITTED';

  /* ---------------- PROGRESS ---------------- */

  // Merge Local Redux Uploads with Backend States
  const getDocState = React.useCallback((doc: DocumentItem) => {
    // 1. Check Backend first — safely extract array from response
    const docsArray = Array.isArray(remoteDocs) ? remoteDocs : (remoteDocs?.data ?? []);
    const remoteDoc = docsArray.find((d: any) => d.document_type === doc.backendType);
    if (remoteDoc) {
      return {
        status: remoteDoc.status, // 'pending', 'verified', 'rejected'
        preview: remoteDoc.document_url?.front || remoteDoc.document_url, // simplify preview
        rejection_reason: remoteDoc.rejection_reason || remoteDoc.remarks,
      };
    }
    // 2. Fallback to Local Redux
    const docs = user?.documents || {};
    return docs?.[doc.key] || {};
  }, [remoteDocs, user?.documents]);

  const uploadedCount = useMemo(() => {
    return DOCUMENTS.filter(doc => {
      const state = getDocState(doc);
      return state.status === 'UPLOADED' || state.status === 'pending' || state.status === 'verified';
    }).length;
  }, [getDocState]);

  const progress = Math.round(
    (uploadedCount / DOCUMENTS.length) * 100
  );

  const allUploaded = uploadedCount === DOCUMENTS.length;

  const handleSubmit = async () => {
    if (!user?.driverId) { return; }

    try {
      await submitDocuments(user.driverId).unwrap();

      // Update local state and navigate
      dispatch(setUser({ onboarding_status: 'DOCS_SUBMITTED' }));
      showAlert({
        title: 'Success',
        message: 'Documents submitted for verification.',
        singleButton: true,
        icon: 'checkmark-circle-outline',
        onConfirm: () => {
          navigation.replace(Dashboard_Nav);
        }
      });
    } catch (error: any) {
      console.error('Failed to submit docs:', error);
      // setIsSubmitting(false); // Assuming setIsSubmitting is part of a useState hook
      showAlert({
        title: 'Submission Failed',
        message: error?.data?.message || 'Please make sure all mandatory documents are uploaded.',
        singleButton: true,
        icon: 'alert-circle-outline',
      });
    }
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      <AppStatusBar />
      {/* --- WAITING MODAL --- */}
      <Modal visible={isWaitingForAdmin} animationType="slide">
        <View style={styles.waitingContainer}>
          <Ionicons name="time-outline" size={80} color={colors.primary} />
          <Text style={[fonts.bold, styles.waitingTitle]}>Documents Under Review</Text>
          <Text style={[fonts.regular, styles.waitingText]}>
            We have received your documents successfully. Our team is verifying your details. This process usually takes 24-48 hours.
          </Text>
          <Button onPress={refetch} disabled={isFetching} style={{ width: '80%', marginTop: 30 }}>
            {isFetching ? <ActivityIndicator color="#fff" /> : 'Refresh Status'}
          </Button>
        </View>
      </Modal>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      >
        <Text style={[fonts.regular, styles.step]}>
          Step 4 of 4 • Documents
        </Text>

        <Text style={[fonts.bold, styles.title, { color: colors.primary }]}>
          Upload documents
        </Text>

        <Text style={[fonts.regular, styles.subtitle]}>
          Clear images help faster verification
        </Text>

        {/* Progress */}
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>

        <Text style={styles.progressText}>
          {uploadedCount} / {DOCUMENTS.length} uploaded
        </Text>

        {/* Document Cards */}
        <View style={{ marginTop: 16, paddingBottom: 20 }}>
          {DOCUMENTS.map(doc => {
            const docData = getDocState(doc);
            const status = docData.status || 'NONE';
            const preview = docData.preview;
            const rejectionReason = docData.rejection_reason;

            const isUploadedLocal = status === 'UPLOADED';
            const isPendingRemote = status === 'pending';
            const isVerifiedRemote = status === 'verified';
            const isRejectedRemote = status === 'rejected';

            // If it's pending or verified, we lock it so user can't click
            const isLocked = isPendingRemote || isVerifiedRemote;

            // Re-upload logic
            const showRed = isRejectedRemote;
            const showGreen = isUploadedLocal || isPendingRemote || isVerifiedRemote;

            return (
              <TouchableOpacity
                key={doc.key}
                disabled={isLocked}
                style={[
                  styles.card,
                  {
                    borderColor: showRed ? '#DC2626' : showGreen ? '#2E7D32' : '#E5E7EB',
                    opacity: isLocked ? 0.7 : 1,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate(DocumentUploadScreen_Nav, {
                    label: doc.key,
                    backendType: doc.backendType,
                    side: doc.side,
                  })
                }
              >
                {/* ICON / PREVIEW */}
                <View style={styles.iconWrap}>
                  {preview ? (
                    <Image
                      source={{ uri: preview }}
                      style={styles.preview}
                    />
                  ) : (
                    <doc.Logo />
                  )}
                </View>

                {/* TEXT */}
                <View style={{ flex: 1 }}>
                  <Text style={[fonts.medium, styles.docTitle, showRed && { color: '#DC2626' }]}>
                    {doc.label} {isLocked && <Ionicons name="lock-closed" size={14} color="#9CA3AF" />}
                  </Text>
                  <Text style={[styles.docType, showRed && { color: '#DC2626' }]}>{doc.type}</Text>

                  {showRed && rejectionReason ? (
                    <Text style={styles.errorHint}>{rejectionReason}</Text>
                  ) : (
                    <Text style={styles.docHint}>{doc.hint}</Text>
                  )}
                </View>

                {/* STATUS */}
                <View style={styles.statusWrap}>
                  <Ionicons
                    name={
                      isVerifiedRemote ? 'shield-checkmark' :
                        showRed ? 'alert-circle' :
                          showGreen ? 'checkmark-circle' : 'cloud-upload-outline'
                    }
                    size={22}
                    color={
                      showRed ? '#DC2626' :
                        showGreen ? '#2E7D32' :
                          colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: showRed ? '#DC2626' : showGreen ? '#2E7D32' : colors.primary },
                    ]}
                  >
                    {isVerifiedRemote ? 'Verified' :
                      isRejectedRemote ? 'Rejected' :
                        isPendingRemote ? 'In Review' :
                          isUploadedLocal ? 'Uploaded' : 'Upload'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 20,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderColor: colors.border + '22',
        }}
      >
        <View style={styles.secureRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={colors.border}
          />
          <Text style={styles.secureText}>
            Your documents are encrypted and secure
          </Text>
        </View>
        <Button
          disabled={!allUploaded || isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting ? <ActivityIndicator color="#fff" /> : 'Verify Documents'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default DocumentScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  step: { fontSize: 12, opacity: 0.6, marginBottom: 6 },
  title: { fontSize: 24 },
  subtitle: { fontSize: 14, opacity: 0.7, marginBottom: 16 },

  progressTrack: {
    height: 6,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1D4ED8',
  },

  progressText: {
    fontSize: 13,
    marginTop: 6,
    opacity: 0.7,
  },

  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },

  waitingTitle: {
    fontSize: 22,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },

  waitingText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 22,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },

  preview: {
    width: '100%',
    height: '100%',
  },

  docTitle: { fontSize: 15 },
  docType: { fontSize: 13, opacity: 0.7 },
  docHint: { fontSize: 12, opacity: 0.6 },

  errorHint: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 2,
    fontWeight: '500',
  },

  statusWrap: { alignItems: 'center' },
  statusText: { fontSize: 11, marginTop: 2 },

  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  secureText: {
    fontSize: 13,
    marginLeft: 6,
    opacity: 0.7,
  },
});
