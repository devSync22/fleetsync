import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import {
  globalHistoryItems,
  SharedHistoryItem,
  HistoryAttachment,
} from '../../../src/data/queueStore';

export default function MaintenanceHistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Lookup the specific history item
  const item: SharedHistoryItem =
    globalHistoryItems.find((h: SharedHistoryItem) => h.id === id) ||
    globalHistoryItems[0];

  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  const handleBack = () => {
    router.replace('/(mechanic)/maintenance');
  };

  const handleDownload = (filename: string) => {
    setDownloadingFile(filename);
    setTimeout(() => {
      setDownloadingFile(null);
      setDownloadSuccessMessage(`Downloaded "${filename}" to device storage.`);
      setTimeout(() => {
        setDownloadSuccessMessage(null);
      }, 3500);
    }, 1000);
  };

  const getTagStyle = (tag: SharedHistoryItem['tag']) => {
    switch (tag) {
      case 'Resolved':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'Service':
        return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'Repair':
        return { bg: '#F1F5F9', text: '#334155' };
      default:
        return { bg: '#F1F5F9', text: '#334155' };
    }
  };

  const tagStyle = getTagStyle(item.tag);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Service Report</Text>
          <Text style={styles.headerSubtitle}>
            {item.vehiclePlate} · {item.vehicleModel}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Download Success Banner */}
        {downloadSuccessMessage && (
          <View style={styles.successBanner}>
            <View style={styles.successIconCircle}>
              <Text style={styles.successCheckIcon}>✓</Text>
            </View>
            <Text style={styles.successBannerText}>{downloadSuccessMessage}</Text>
          </View>
        )}

        {/* Card 1: Overview & Metadata */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
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

          <Text style={styles.reportTitle}>{item.title}</Text>
          <Text style={styles.reportSubtitle}>{item.subtitle}</Text>

          {/* 3-column Metadata Box */}
          <View style={styles.metaBoxRow}>
            <View style={styles.metaBoxCol}>
              <Text style={styles.metaBoxLabel}>Date</Text>
              <Text style={styles.metaBoxValue}>{item.date}</Text>
            </View>

            <View style={styles.metaBoxCol}>
              <Text style={styles.metaBoxLabel}>Odometer</Text>
              <Text style={styles.metaBoxValue}>{item.odometer}</Text>
            </View>

            <View style={styles.metaBoxCol}>
              <Text style={styles.metaBoxLabel}>Technician</Text>
              <Text style={styles.metaBoxValue} numberOfLines={1}>
                {item.mechanicName}
              </Text>
            </View>
          </View>
        </View>

        {/* Card 2: Work Done & Technical Notes */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>WORK PERFORMED & TECHNICAL NOTES</Text>
          <Text style={styles.workDoneText}>
            {item.workDone || item.subtitle}
          </Text>

          {item.parts && item.parts.length > 0 && (
            <View style={styles.partsSection}>
              <Text style={styles.partsHeader}>Parts & Consumables Used:</Text>
              {item.parts.map((part: { name: string; qty: string }, idx: number) => (
                <View key={idx} style={styles.partRow}>
                  <Text style={styles.partBullet}>•</Text>
                  <Text style={styles.partName}>{part.name}</Text>
                  <Text style={styles.partQty}>{part.qty}</Text>
                </View>
              ))}
            </View>
          )}

          {item.cost && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Total Service & Parts Cost</Text>
              <Text style={styles.costValue}>LKR {item.cost}</Text>
            </View>
          )}

          {item.nextOdometer && (
            <View style={styles.nextIntervalBox}>
              <Text style={styles.nextIntervalTitle}>Next Service Scheduled</Text>
              <Text style={styles.nextIntervalSubtitle}>
                At {item.nextOdometer} or {item.nextDate || '6 months'}
              </Text>
            </View>
          )}
        </View>

        {/* Card 3: Documents & Service Report Download */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>ATTACHED DOCUMENTS & INVOICES</Text>

          {item.attachments && item.attachments.length > 0 ? (
            item.attachments.map((file: HistoryAttachment, idx: number) => {
              const isPdf = file.type === 'pdf' || file.name.endsWith('.pdf');
              const isDownloading = downloadingFile === file.name;

              return (
                <View key={idx} style={styles.documentItemRow}>
                  <View
                    style={[
                      styles.typeBadge,
                      isPdf ? styles.pdfBadge : styles.jpgBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        isPdf ? styles.pdfBadgeText : styles.jpgBadgeText,
                      ]}
                    >
                      {isPdf ? 'PDF' : 'JPG'}
                    </Text>
                  </View>

                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileSize}>{file.size} · Attached</Text>
                  </View>

                  {/* Download Action Button */}
                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => handleDownload(file.name)}
                    activeOpacity={0.7}
                    disabled={isDownloading}
                  >
                    <Text style={styles.downloadIcon}>
                      {isDownloading ? '⏳' : '⤓'}
                    </Text>
                    <Text style={styles.downloadText}>
                      {isDownloading ? 'Saving...' : 'Download'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.noDocumentsBox}>
              <Text style={styles.noDocumentsText}>
                No separate invoice attached for this maintenance log.
              </Text>
            </View>
          )}

          {/* Quick link to view all vehicle documents */}
          <TouchableOpacity
            style={styles.viewAllDocsLink}
            onPress={() => router.push('/documents')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllDocsText}>
              Browse all fleet documents & invoices →
            </Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    paddingRight: 12,
    paddingVertical: 2,
  },
  backChevron: {
    fontSize: 28,
    color: '#0F172A',
    lineHeight: 28,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  successIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCheckIcon: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  successBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#15803D',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  plateNumberText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  modelText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  reportSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  metaBoxRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 10,
    marginTop: 14,
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
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  workDoneText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  partsSection: {
    marginTop: 14,
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
    paddingVertical: 3,
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
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  costLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  costValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  nextIntervalBox: {
    marginTop: 12,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
  },
  nextIntervalTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  nextIntervalSubtitle: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
  },
  documentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  pdfBadge: {
    backgroundColor: '#FEE2E2',
  },
  pdfBadgeText: {
    color: '#DC2626',
  },
  jpgBadge: {
    backgroundColor: '#DBEAFE',
  },
  jpgBadgeText: {
    color: '#2563EB',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  fileSize: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  downloadIcon: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '700',
  },
  downloadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  noDocumentsBox: {
    paddingVertical: 10,
  },
  noDocumentsText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  viewAllDocsLink: {
    marginTop: 6,
    paddingVertical: 4,
  },
  viewAllDocsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
});
