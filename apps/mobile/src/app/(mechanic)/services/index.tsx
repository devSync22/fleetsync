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
import { router } from 'expo-router';

interface ServiceItem {
  id: string;
  province: string;
  plate: string;
  serviceTitle: string;
  subtitle: string;
  status: 'Overdue' | 'Due soon' | 'Scheduled';
  progressPercent: number; // 0 to 100 for the indicator bar
  barColor: string;
}

const OVERDUE_SERVICES: ServiceItem[] = [
  {
    id: '3',
    province: 'WP',
    plate: 'LA-9087',
    serviceTitle: 'Engine oil & filter',
    subtitle: '1,200 km past 101,280 km',
    status: 'Overdue',
    progressPercent: 100,
    barColor: '#DC2626', // Red
  },
  {
    id: '4',
    province: 'WP',
    plate: 'LC-4410',
    serviceTitle: 'Tyre rotation',
    subtitle: 'Due 13 Oct · 6 days late',
    status: 'Overdue',
    progressPercent: 100,
    barColor: '#DC2626', // Red
  },
];

const UPCOMING_SERVICES: ServiceItem[] = [
  {
    id: '5',
    province: 'NW',
    plate: 'LE-7730',
    serviceTitle: 'Brake service',
    subtitle: '900 km left · booked Wed 22 Oct',
    status: 'Due soon',
    progressPercent: 78,
    barColor: '#D97706', // Amber / Brown
  },
  {
    id: 's4',
    province: 'WP',
    plate: 'LB-4521',
    serviceTitle: 'Full service',
    subtitle: '2,400 km left · at 210,000 km',
    status: 'Scheduled',
    progressPercent: 55,
    barColor: '#2563EB', // Blue
  },
  {
    id: 's5',
    province: 'WP',
    plate: 'LC-1188',
    serviceTitle: 'Brake inspection',
    subtitle: '5,100 km left · at 152,000 km',
    status: 'Scheduled',
    progressPercent: 40,
    barColor: '#2563EB', // Blue
  },
  {
    id: 's6',
    province: 'WP',
    plate: 'LB-7702',
    serviceTitle: 'Full service',
    subtitle: '5,726 km left · at 90,000 km',
    status: 'Scheduled',
    progressPercent: 32,
    barColor: '#2563EB', // Blue
  },
];

export default function ServicesScreen() {
  const getBadgeStyle = (status: ServiceItem['status']) => {
    switch (status) {
      case 'Overdue':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'Due soon':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'Scheduled':
        return { bg: '#DBEAFE', text: '#1D4ED8' };
    }
  };

  const renderServiceCard = (item: ServiceItem) => {
    const badge = getBadgeStyle(item.status);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push(`/(mechanic)/services/${item.id}`)}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.cardInfo}>
            <Text style={styles.plateAndTitle}>
              <Text style={styles.provinceText}>{item.province} </Text>
              <Text style={styles.plateText}>{item.plate}</Text>
              <Text style={styles.titleText}> · {item.serviceTitle}</Text>
            </Text>
            <Text style={styles.subtitleText}>{item.subtitle}</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Progress Tracker Bar */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${item.progressPercent}%`, backgroundColor: item.barColor },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Services</Text>
        </View>

        {/* SECTION 1: OVERDUE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>
            OVERDUE · {OVERDUE_SERVICES.length}
          </Text>
        </View>
        <View style={styles.listContainer}>
          {OVERDUE_SERVICES.map(renderServiceCard)}
        </View>

        {/* SECTION 2: UPCOMING */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionHeaderTitle}>
            UPCOMING · {UPCOMING_SERVICES.length}
          </Text>
        </View>
        <View style={styles.listContainer}>
          {UPCOMING_SERVICES.map(renderServiceCard)}
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
    marginBottom: 16,
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardInfo: {
    flex: 1,
    paddingRight: 8,
  },
  plateAndTitle: {
    fontSize: 14,
    color: '#0F172A',
  },
  provinceText: {
    fontWeight: '700',
    fontSize: 13,
  },
  plateText: {
    fontWeight: '800',
    fontSize: 14,
  },
  titleText: {
    fontWeight: '700',
    fontSize: 14,
  },
  subtitleText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 4.5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
