import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

export default function MechanicProfileScreen() {
  // Password updated state (toggles the green banner seen in Image 7)
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSavePassword = () => {
    setIsPasswordModalOpen(false);
    setPasswordUpdated(true);
  };

  const handleSignOut = () => {
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Title with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRightSpacer} />
        </View>

        {/* PASSWORD UPDATED BANNER (IMAGE 7) */}
        {passwordUpdated && (
          <View style={styles.successBanner}>
            <View style={styles.successIconCircle}>
              <Text style={styles.successCheckIcon}>✓</Text>
            </View>
            <View style={styles.successTextContainer}>
              <Text style={styles.successTitle}>Password updated</Text>
              <Text style={styles.successSubtitle}>
                You are still signed in on this phone. Other devices were signed out.
              </Text>
            </View>
          </View>
        )}

        {/* CARD 1: USER AVATAR & IDENTITY */}
        <View style={styles.card}>
          <View style={styles.userRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>IB</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Ishara Bandara</Text>
              <Text style={styles.userSubtitle}>Mechanic · MEC-012 · Colombo depot</Text>
              <View style={styles.badgesRow}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
                <View style={styles.sinceBadge}>
                  <Text style={styles.sinceBadgeText}>Since Jun 2022</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* CARD 2: PERSONAL DETAILS */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderTitle}>PERSONAL DETAILS</Text>
          <Text style={styles.sectionHelperText}>
            Changes are sent to a Fleet Administrator for approval.
          </Text>

          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Mobile</Text>
            <Text style={styles.detailValue}>071 884 2391</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>ishara.b@fleetms.lk</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue}>Wattala</Text>
          </View>

          <TouchableOpacity style={styles.requestLink} activeOpacity={0.7}>
            <Text style={styles.requestLinkText}>✏️ Request a change</Text>
          </TouchableOpacity>
        </View>

        {/* CARD 3: WORK DETAILS */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderTitle}>WORK DETAILS</Text>
          <Text style={styles.sectionHelperText}>Set by the Fleet Administrator.</Text>

          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Speciality</Text>
            <Text style={styles.detailValue}>General repairs</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Workshop</Text>
            <Text style={styles.detailValue}>Colombo depot</Text>
          </View>

          <View style={[styles.detailsRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={styles.detailLabel}>Employee ID</Text>
            <Text style={styles.detailValue}>MEC-012</Text>
          </View>
        </View>

        {/* CARD 4: MY CHANGE REQUESTS */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderTitle}>MY CHANGE REQUESTS</Text>
          <View style={styles.changeRequestRow}>
            <Text style={styles.changeRequestText}>Address change · 18 Oct</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Pending approval</Text>
            </View>
          </View>
        </View>

        {/* CARD 5: SIGN-IN & SECURITY */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderTitle}>SIGN-IN & SECURITY</Text>

          {/* Change Password row */}
          <TouchableOpacity
            style={styles.securityRow}
            activeOpacity={0.7}
            onPress={() => setIsPasswordModalOpen(true)}
          >
            <View style={styles.securityLeft}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>Change password</Text>
            </View>
            <View style={styles.securityRight}>
              {passwordUpdated && (
                <Text style={styles.changedNoticeText}>Changed today, 18:05</Text>
              )}
              <Text style={styles.securityChevron}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Last Sign-In */}
          <View style={styles.lastSignInRow}>
            <Text style={styles.detailLabel}>Last sign-in</Text>
            <Text style={styles.detailValue}>Today, 07:40 · this phone</Text>
          </View>
        </View>

        {/* SIGN OUT BUTTON */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutIcon}>➔</Text>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={isPasswordModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPasswordModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••••"
            />

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Min. 8 characters"
            />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
            />

            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={handleSavePassword}
              activeOpacity={0.85}
            >
              <Text style={styles.modalSaveBtnText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#0F172A',
    lineHeight: 26,
    marginLeft: -2,
  },
  headerRightSpacer: {
    width: 36,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  successBanner: {
    flexDirection: 'row',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  successIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  successCheckIcon: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
  },
  successSubtitle: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 17,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#2563EB',
    fontSize: 22,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  userSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  sinceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sinceBadgeText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  sectionHelperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  requestLink: {
    marginTop: 10,
    paddingVertical: 4,
  },
  requestLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  changeRequestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  changeRequestText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadgeText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    marginTop: 4,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityIcon: {
    fontSize: 14,
  },
  securityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  securityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changedNoticeText: {
    fontSize: 12,
    color: '#64748B',
  },
  securityChevron: {
    fontSize: 18,
    color: '#94A3B8',
  },
  lastSignInRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  signOutBtn: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  signOutIcon: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  signOutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  modalSaveBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
