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
import { router, Link } from 'expo-router';
import { globalQueueItems } from '../../src/data/queueStore';

export default function MechanicQueueScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'reports' | 'services'>('all');

  // Filter items that are still active (not yet resolved) in the Queue
  const activeQueue = globalQueueItems.filter((item) => item.status !== 'Resolved');

  const filteredItems = activeQueue.filter((item) => {
    if (activeTab === 'reports') return item.type === 'DRIVER REPORT';
    if (activeTab === 'services') return item.type === 'SERVICE';
    return true;
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Reported':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'In progress':
        return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'Overdue':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'Due soon':
        return { bg: '#FEF3C7', text: '#92400E' };
      default:
        return { bg: '#F1F5F9', text: '#334155' };
    }
  };

  const driverIssuesCount = activeQueue.filter((i) => i.type === 'DRIVER REPORT').length;
  const overdueCount = activeQueue.filter((i) => i.status === 'Overdue').length;
  const dueThisWeekCount = activeQueue.filter((i) => i.status === 'Due soon').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitles}>
            <Text style={styles.mainTitle}>Maintenance queue</Text>
            <Text style={styles.subTitle}>Ishara Bandara · Colombo depot</Text>
          </View>

          <View style={styles.headerActions}>
            {/* Chat Icon Button */}
            <TouchableOpacity
              style={styles.chatButton}
              activeOpacity={0.7}
              onPress={() => router.push('/chat')}
            >
              <View style={styles.chatIconOutline}>
                <View style={styles.chatIconTail} />
              </View>
            </TouchableOpacity>

            {/* User Avatar Circle */}
            <TouchableOpacity
              style={styles.avatarCircle}
              activeOpacity={0.7}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.avatarText}>IB</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3 Summary Metric Cards */}
        <View style={styles.metricsRow}>
          {/* Driver issues (yellow) */}
          <View style={[styles.metricCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.metricNumber, { color: '#92400E' }]}>
              {driverIssuesCount}
            </Text>
            <Text style={[styles.metricLabel, { color: '#92400E' }]}>Driver issues</Text>
          </View>

          {/* Overdue (pink/red) */}
          <View style={[styles.metricCard, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.metricNumber, { color: '#B91C1C' }]}>
              {overdueCount}
            </Text>
            <Text style={[styles.metricLabel, { color: '#B91C1C' }]}>Overdue</Text>
          </View>

          {/* Due this week (light blue) */}
          <View style={[styles.metricCard, { backgroundColor: '#DBEAFE' }]}>
            <Text style={[styles.metricNumber, { color: '#1D4ED8' }]}>
              {dueThisWeekCount}
            </Text>
            <Text style={[styles.metricLabel, { color: '#1D4ED8' }]}>Due this week</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeTab === 'all' ? styles.filterPillActiveDark : styles.filterPillInactive,
            ]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeTab === 'all' ? styles.filterTextActiveDark : styles.filterTextInactive,
              ]}
            >
              All {activeQueue.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeTab === 'reports' ? styles.filterPillActiveDark : styles.filterPillInactive,
            ]}
            onPress={() => setActiveTab('reports')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeTab === 'reports' ? styles.filterTextActiveDark : styles.filterTextInactive,
              ]}
            >
              Driver reports
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeTab === 'services' ? styles.filterPillActiveDark : styles.filterPillInactive,
            ]}
            onPress={() => setActiveTab('services')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeTab === 'services' ? styles.filterTextActiveDark : styles.filterTextInactive,
              ]}
            >
              Services
            </Text>
          </TouchableOpacity>
        </View>

        {/* Queue Cards List */}
        <View style={styles.listContainer}>
          {filteredItems.map((item) => {
            const badge = getStatusBadgeStyle(item.status);
            const isService = item.type === 'SERVICE';
            const targetRoute = isService
              ? `/(mechanic)/services/${item.id}`
              : `/(mechanic)/issues/${item.id}`;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => router.push(targetRoute as any)}
              >
                {/* Left Colored Accent Strip */}
                <View
                  style={[
                    styles.accentStrip,
                    { backgroundColor: item.stripColor },
                  ]}
                />

                {/* Card Main Body */}
                <View style={styles.cardContent}>
                  {/* Top row: Plate + Type + Status Badge */}
                  <View style={styles.cardTopRow}>
                    <View style={styles.plateContainer}>
                      <Text style={styles.provinceText}>{item.province} </Text>
                      <Text style={styles.plateNumberText}>{item.plate}</Text>
                      <Text style={styles.typeText}>  {item.type}</Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* Title (Bold fault or service name) */}
                  <Text style={styles.serviceTitle}>{item.title}</Text>

                  {/* Subtitle (Driver, time, overdue km, etc) */}
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  headerTitles: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subTitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIconOutline: {
    width: 17,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.7,
    borderColor: '#334155',
    position: 'relative',
  },
  chatIconTail: {
    position: 'absolute',
    bottom: -3.5,
    left: 2.5,
    width: 4,
    height: 4,
    backgroundColor: '#334155',
    transform: [{ rotate: '45deg' }],
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 15,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    justifyContent: 'center',
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActiveDark: {
    backgroundColor: '#1E293B',
  },
  filterPillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActiveDark: {
    color: '#FFFFFF',
  },
  filterTextInactive: {
    color: '#334155',
  },
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 14,
    paddingLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  accentStrip: {
    width: 4.5,
    borderRadius: 3,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  provinceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  plateNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
