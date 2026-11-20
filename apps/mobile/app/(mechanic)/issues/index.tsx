import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import { globalQueueItems, SharedQueueItem } from '../../../src/data/queueStore';

export default function DriverIssuesScreen() {
  // Only show active, unresolved driver issues
  const openIssues = globalQueueItems.filter(
    (item: SharedQueueItem) => !item.isService && item.status !== 'Resolved'
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Reported':
        return { bg: '#FEF3C7', text: '#D97706' }; // soft amber/orange
      case 'In progress':
        return { bg: '#DBEAFE', text: '#2563EB' }; // soft blue
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Driver-reported issues</Text>
        </View>

        {/* Open Issues Count Pill */}
        <View style={styles.pillRow}>
          <View style={styles.openPill}>
            <Text style={styles.openPillText}>Open · {openIssues.length}</Text>
          </View>
        </View>

        {/* Issue Cards */}
        <View style={styles.listContainer}>
          {openIssues.map((issue: SharedQueueItem) => {
            const badge = getStatusBadge(issue.status);

            return (
              <View key={issue.id} style={styles.card}>
                {/* Top Row: Plate + Vehicle Model + Status Badge */}
                <View style={styles.cardTopRow}>
                  <View>
                    <View style={styles.plateRow}>
                      <Text style={styles.provinceText}>{issue.province} </Text>
                      <Text style={styles.plateNumberText}>{issue.plate}</Text>
                    </View>
                    <Text style={styles.modelOdometerText}>
                      {issue.vehicleModel} · {issue.odometer}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {issue.status}
                    </Text>
                  </View>
                </View>

                {/* Chips Row: Category + Impact */}
                <View style={styles.chipsRow}>
                  <View style={styles.chipGrey}>
                    <Text style={styles.chipGreyText}>{issue.category}</Text>
                  </View>
                  <View style={styles.chipAmber}>
                    <Text style={styles.chipAmberText}>{issue.impactTag}</Text>
                  </View>
                </View>

                {/* Fault Description Snippet */}
                <Text style={styles.descriptionText} numberOfLines={2}>
                  {issue.description}
                </Text>

                {/* Driver Meta Line */}
                <View style={styles.driverMetaRow}>
                  <Text style={styles.driverMetaText}>
                    👤 {issue.driverName} · {issue.tripId} · {issue.reportedTime}
                  </Text>
                </View>

                {/* Action Button: Open and resolve */}
                <Link href={`/issues/${issue.id}`} asChild>
                  <TouchableOpacity
                    style={styles.actionButton}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionButtonText}>Open and resolve</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  },
  header: {
    marginBottom: 12,
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pillRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  openPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  openPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  listContainer: {
    gap: 14,
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
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  provinceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  plateNumberText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  modelOdometerText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
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
  descriptionText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 12,
  },
  driverMetaRow: {
    paddingTop: 4,
    marginBottom: 14,
  },
  driverMetaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#0F172A', // Dark navy/black button
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
