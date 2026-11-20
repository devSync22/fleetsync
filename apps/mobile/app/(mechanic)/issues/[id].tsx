import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { globalQueueItems, updateItemOutcome, SharedQueueItem } from '../../../src/data/queueStore';

export default function ResolveIssueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Lookup the specific issue from our shared data store
  const issue = globalQueueItems.find((item: SharedQueueItem) => item.id === id) || globalQueueItems[0];

  // State for diagnosis and work done
  const [fixDescription, setFixDescription] = useState(issue.defaultFix);

  // State for the Outcome selection: 'resolved' vs 'needs_more_work'
  const [outcome, setOutcome] = useState<'resolved' | 'needs_more_work'>(
    issue.status === 'In progress' ? 'needs_more_work' : 'resolved'
  );

  // Handle Back Button navigation: navigates directly to the Issues screen
  const handleBack = () => {
    router.replace('/(mechanic)/issues');
  };

  // Handle Mark as resolved / Save submission
  const handleDone = () => {
    // 1. Update the state in our central queue store
    updateItemOutcome(issue.id, outcome, fixDescription);

    // 2. Route according to the selected outcome:
    if (outcome === 'resolved') {
      router.replace('/(mechanic)/maintenance');
    } else {
      router.replace('/(mechanic)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* 1. TOP HEADER WITH CHEVRON BACK */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.chevronLeft}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Resolve issue</Text>
          <Text style={styles.headerSubtitle}>
            {issue.province} {issue.plate} · {issue.vehicleModel}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. CARD: REPORTED BY THE DRIVER */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardSectionLabel}>REPORTED BY THE DRIVER</Text>
            <View style={styles.reportedBadge}>
              <Text style={styles.reportedBadgeText}>Reported</Text>
            </View>
          </View>

          {/* Chips: Category + Impact */}
          <View style={styles.chipsRow}>
            <View style={styles.chipGrey}>
              <Text style={styles.chipGreyText}>{issue.category}</Text>
            </View>
            <View style={styles.chipAmber}>
              <Text style={styles.chipAmberText}>{issue.impactTag}</Text>
            </View>
          </View>

          {/* Quoted Driver description */}
          <Text style={styles.driverQuoteText}>“{issue.description}”</Text>

          {/* Grey 3-column Box for Driver / Trip / Odometer */}
          <View style={styles.metaBoxRow}>
            <View style={styles.metaBoxCol}>
              <Text style={styles.metaBoxLabel}>Driver</Text>
              <Text style={styles.metaBoxValue}>
                {issue.driverName ? issue.driverName.split(' ')[0] + ' ' + (issue.driverName.split(' ')[1] ? issue.driverName.split(' ')[1][0] + '.' : '') : 'Kasun J.'}
              </Text>
            </View>

            <View style={styles.metaBoxCol}>
              <Text style={styles.metaBoxLabel}>Trip</Text>
              <Text style={styles.metaBoxValue}>{issue.tripId}</Text>
            </View>

            <View style={styles.metaBoxCol}>
              <Text style={styles.metaBoxLabel}>Odometer</Text>
              <Text style={styles.metaBoxValue}>{issue.odometer}</Text>
            </View>
          </View>
        </View>

        {/* 3. SECTION: What did you find and fix? */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>What did you find and fix?</Text>
          <TextInput
            style={styles.purpleInputBox}
            multiline
            numberOfLines={4}
            value={fixDescription}
            onChangeText={setFixDescription}
            placeholder="Describe what was repaired or checked..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* 4. SECTION: Outcome */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Outcome</Text>

          {/* Green Option: Resolved, vehicle is safe to use */}
          <TouchableOpacity
            style={[
              styles.outcomeCard,
              outcome === 'resolved' ? styles.outcomeCardGreen : styles.outcomeCardDefault,
            ]}
            onPress={() => setOutcome('resolved')}
            activeOpacity={0.85}
          >
            <View style={[styles.radioCircle, outcome === 'resolved' ? styles.radioCircleGreen : styles.radioCircleDefault]}>
              {outcome === 'resolved' && <View style={styles.radioDotGreen} />}
            </View>
            <View style={styles.outcomeContent}>
              <Text style={[styles.outcomeTitle, outcome === 'resolved' && styles.outcomeTitleGreen]}>
                Resolved, vehicle is safe to use
              </Text>
              <Text style={styles.outcomeSub}>Back in the availability list</Text>
            </View>
          </TouchableOpacity>

          {/* Option: Needs more work */}
          <TouchableOpacity
            style={[
              styles.outcomeCard,
              outcome === 'needs_more_work' ? styles.outcomeCardActive : styles.outcomeCardDefault,
            ]}
            onPress={() => setOutcome('needs_more_work')}
            activeOpacity={0.85}
          >
            <View style={[styles.radioCircle, outcome === 'needs_more_work' ? styles.radioCircleActive : styles.radioCircleDefault]}>
              {outcome === 'needs_more_work' && <View style={styles.radioDotDark} />}
            </View>
            <View style={styles.outcomeContent}>
              <Text style={styles.outcomeTitle}>Needs more work</Text>
              <Text style={styles.outcomeSub}>Keep the vehicle in maintenance</Text>
            </View>
          </TouchableOpacity>

          {/* Link: + Also add a full maintenance record */}
          <TouchableOpacity
            style={styles.addRecordLink}
            onPress={() => router.push(`/(mechanic)/maintenance/record?id=${issue.id}`)}
            activeOpacity={0.7}
          >
            <Text style={styles.addRecordLinkText}>+ Also add a full maintenance record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 5. STICKY BOTTOM BAR: Mark as resolved */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.markResolvedBtn}
          onPress={handleDone}
          activeOpacity={0.85}
        >
          <Text style={styles.markResolvedBtnText}>
            {outcome === 'resolved' ? 'Mark as resolved' : 'Update status'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.bottomBarNotice}>
          Kasun and the coordinator will see the issue as {outcome === 'resolved' ? 'Resolved' : 'In progress'}.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  chevronLeft: {
    fontSize: 28,
    color: '#0F172A',
    lineHeight: 28,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  reportedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reportedBadgeText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  chipGrey: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipGreyText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  chipAmber: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipAmberText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },
  driverQuoteText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 19,
    fontStyle: 'normal',
    marginBottom: 14,
  },
  metaBoxRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 12,
  },
  metaBoxCol: {
    flex: 1,
  },
  metaBoxLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
    fontWeight: '500',
  },
  metaBoxValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionContainer: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  purpleInputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#6366F1', // Indigo / Purple outline matching the screenshot
    borderRadius: 12,
    padding: 14,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 88,
    textAlignVertical: 'top',
    lineHeight: 18,
  },
  outcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  outcomeCardGreen: {
    backgroundColor: '#DCFCE7', // Soft green background
    borderColor: '#22C55E',     // Green border
  },
  outcomeCardActive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#0F172A',
  },
  outcomeCardDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleGreen: {
    borderColor: '#16A34A',
    backgroundColor: '#FFFFFF',
  },
  radioCircleActive: {
    borderColor: '#0F172A',
  },
  radioCircleDefault: {
    borderColor: '#CBD5E1',
  },
  radioDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
  },
  radioDotDark: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F172A',
  },
  outcomeContent: {
    flex: 1,
  },
  outcomeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  outcomeTitleGreen: {
    color: '#15803D',
  },
  outcomeSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  addRecordLink: {
    paddingVertical: 6,
    marginTop: 2,
  },
  addRecordLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5', // Indigo link
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    alignItems: 'center',
  },
  markResolvedBtn: {
    backgroundColor: '#0F172A', // Dark navy/black
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
  },
  markResolvedBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomBarNotice: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
});
