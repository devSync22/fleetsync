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
import { router } from 'expo-router';
import { globalHistoryItems, SharedHistoryItem } from '../../../data/queueStore';

export default function MaintenanceHistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Sort history items by date descending (Newest on top)
  const allHistory = [...globalHistoryItems].sort(
    (a, b) => b.timestampMs - a.timestampMs
  );

  // 3. Search filter by license plate, date (e.g. "19 Oct", "Sep", "Today"), or fault/service title
  const filteredHistory = allHistory.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const cleanSearchPlate = query.replace(/[\s-]/g, '');
    const cleanItemPlate = item.vehiclePlate.toLowerCase().replace(/[\s-]/g, '');

    const matchesPlate = cleanItemPlate.includes(cleanSearchPlate);
    const matchesDate = item.date.toLowerCase().includes(query);
    const matchesTitle = item.title.toLowerCase().includes(query);

    return matchesPlate || matchesDate || matchesTitle;
  });

  const getTagStyle = (tag: SharedHistoryItem['tag']) => {
    switch (tag) {
      case 'Resolved':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'Service':
        return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'Repair':
        return { bg: '#F1F5F9', text: '#334155' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Maintenance History</Text>
          <Text style={styles.headerSubtitle}>
            Completed repairs, services & fault resolution log ({filteredHistory.length})
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar for License Plate, Date or Defect */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by plate, date (e.g. 19 Oct), or repair..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sorting Indicator Banner */}
        <View style={styles.sortIndicatorRow}>
          <Text style={styles.sortText}>Sorted by Date: Newest & Last Solved on Top</Text>
        </View>

        {/* History Cards List */}
        <View style={styles.listContainer}>
          {filteredHistory.map((item) => {
            const tagStyle = getTagStyle(item.tag);

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.historyCard}
                activeOpacity={0.85}
                onPress={() => router.push(`/(mechanic)/maintenance/${item.id}`)}
              >
                {/* Top Row: Plate + Model + Tag Badge */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.plateNumberText}>{item.vehiclePlate}</Text>
                    <Text style={styles.modelText}>{item.vehicleModel}</Text>
                  </View>

                  <View style={[styles.tagBadge, { backgroundColor: tagStyle.bg }]}>
                    <Text style={[styles.tagBadgeText, { color: tagStyle.text }]}>
                      {item.tag}
                    </Text>
                  </View>
                </View>

                {/* Date & Odometer pill */}
                <View style={styles.dateOdometerRow}>
                  <Text style={styles.dateText}>📅 {item.date}</Text>
                  <Text style={styles.odometerText}>⚡ {item.odometer}</Text>
                </View>

                {/* Title (Repairs / Service done) */}
                <Text style={styles.cardTitle}>{item.title}</Text>

                {/* Subtitle / Diagnosis notes */}
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

                {/* Attachments if any */}
                {item.attachments && (
                  <View style={styles.attachmentRow}>
                    {item.attachments.map((att, i) => (
                      <View
                        key={i}
                        style={styles.attachmentPill}
                      >
                        <Text style={styles.attachmentIcon}>📄</Text>
                        <Text style={styles.attachmentName}>{att.name}</Text>
                        <Text style={styles.attachmentSize}>{att.size}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Footer: Mechanic sign-off & View Report prompt */}
                <View style={styles.cardFooter}>
                  <Text style={styles.mechanicSignText}>
                    Signed off by: {item.mechanicName}
                  </Text>
                  <Text style={styles.viewReportText}>View report →</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredHistory.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No matching vehicle found</Text>
              <Text style={styles.emptySubtitle}>
                No past maintenance records found for &quot;{searchQuery}&quot;.
              </Text>
            </View>
          )}
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },
  sortIndicatorRow: {
    marginBottom: 14,
  },
  sortText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    gap: 14,
  },
  historyCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  plateNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  modelText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateOdometerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  odometerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 12,
  },
  attachmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  attachmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    gap: 4,
  },
  attachmentIcon: {
    fontSize: 12,
  },
  attachmentName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
  attachmentSize: {
    fontSize: 10,
    color: '#94A3B8',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mechanicSignText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  viewReportText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    alignItems: 'center',
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  recordBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
