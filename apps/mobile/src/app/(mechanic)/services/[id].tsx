import React from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { globalQueueItems, SharedQueueItem } from '../../../data/queueStore';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Lookup the specific service item from globalQueueItems
  const item: SharedQueueItem =
    globalQueueItems.find((q: SharedQueueItem) => q.id === id) ||
    globalQueueItems.find((q: SharedQueueItem) => q.type === 'SERVICE') ||
    globalQueueItems[0];

  // Handle Back Button navigation: navigates directly to the Services screen
  const handleBack = () => {
    router.replace('/(mechanic)/services');
  };

  const isOverdue = item.status === 'Overdue';

  const getStatusBadgeStyle = () => {
    switch (item.status) {
      case 'Overdue':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'Due soon':
        return { bg: '#FEF3C7', text: '#92400E' };
      default:
        return { bg: '#DBEAFE', text: '#1D4ED8' };
    }
  };

  const badgeStyle = getStatusBadgeStyle();

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
          <Text style={styles.headerTitle}>Service details</Text>
          <Text style={styles.headerSubtitle}>
            {item.province} {item.plate} · {item.vehicleModel}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. CARD: SERVICE SUMMARY */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardSectionLabel}>SCHEDULED SERVICE</Text>
            <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
              <Text style={[styles.statusBadgeText, { color: badgeStyle.text }]}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Chips: Category + Impact */}
          <View style={styles.chipsRow}>
            <View style={styles.chipGrey}>
              <Text style={styles.chipGreyText}>{item.category || item.title}</Text>
            </View>
            <View style={isOverdue ? styles.chipRed : styles.chipAmber}>
              <Text style={isOverdue ? styles.chipRedText : styles.chipAmberText}>
                {item.impactTag || item.subtitle}
              </Text>
            </View>
          </View>

          <Text style={styles.serviceMainTitle}>{item.title}</Text>
          <Text style={styles.serviceSubtitle}>{item.subtitle}</Text>

          {/* Grey 3-column Box for Vehicle / Odometer / Interval */}
          <View style={styles.metaBoxRow}>
            <View style={styles.metaBoxCol}>
              <Text style={styles.metaBoxLabel}>Vehicle</Text>
              <Text style={styles.metaBoxValue} numberOfLines={1}>
                {item.vehicleModel}
              </Text>
            </View>

            <View style={styles.metaBoxCol}>
              <Text style={styles.metaBoxLabel}>Odometer</Text>
              <Text style={styles.metaBoxValue}>{item.odometer}</Text>
            </View>

            <View style={styles.metaBoxCol}>
              <Text style={styles.metaBoxLabel}>Due / Interval</Text>
              <Text style={[styles.metaBoxValue, isOverdue && { color: '#B91C1C' }]}>
                {item.impactTag || 'Scheduled'}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. CARD: MAINTENANCE SCOPE */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>MAINTENANCE SCOPE & INSTRUCTIONS</Text>
          <Text style={styles.descriptionText}>
            {item.description ||
              'Scheduled periodic maintenance inspection and replacement of consumable wear items according to manufacturer specifications.'}
          </Text>

          {item.parts && item.parts.length > 0 && (
            <View style={styles.partsSection}>
              <Text style={styles.partsHeader}>Required parts & consumables:</Text>
              {item.parts.map((p: { name: string; qty: string }, idx: number) => (
                <View key={idx} style={styles.partRow}>
                  <Text style={styles.partBullet}>•</Text>
                  <Text style={styles.partName}>{p.name}</Text>
                  <Text style={styles.partQty}>{p.qty}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 4. CARD: LOCATION & DEPOT ASSIGNMENT */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>DEPOT & WORKSHOP</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assigned depot</Text>
            <Text style={styles.infoValue}>Colombo Central Depot</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Technician</Text>
            <Text style={styles.infoValue}>Ishara Bandara (MEC-012)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estimated time</Text>
            <Text style={styles.infoValue}>~1.5 hours</Text>
          </View>
        </View>
      </ScrollView>

      {/* 5. STICKY BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push(`/(mechanic)/maintenance/record?id=${item.id}`)}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>+ Record service maintenance</Text>
        </TouchableOpacity>
        <Text style={styles.bottomBarNotice}>
          Will log parts, labour, and update vehicle service interval to history.
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
    gap: 14,
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
  chipRed: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipRedText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '700',
  },
  serviceMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  serviceSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
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
  descriptionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginTop: 8,
  },
  partsSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  partsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  partBullet: {
    fontSize: 12,
    color: '#94A3B8',
    marginRight: 6,
  },
  partName: {
    fontSize: 13,
    color: '#1E293B',
    flex: 1,
  },
  partQty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
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
  actionBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
  },
  actionBtnText: {
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
