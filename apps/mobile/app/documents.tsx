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
import { router } from 'expo-router';

interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'jpg';
  category: 'invoice' | 'report' | 'photo';
  subtitle: string;
  size?: string;
  authorDate?: string;
}

const DOCUMENTS_LIST: DocumentItem[] = [
  {
    id: 'd1',
    name: 'Invoice_2Sep.pdf',
    type: 'pdf',
    category: 'invoice',
    subtitle: 'Full service · 2 Sep',
  },
  {
    id: 'd2',
    name: 'Invoice_14Jul.pdf',
    type: 'pdf',
    category: 'invoice',
    subtitle: 'Brake pads · 14 Jul',
  },
  {
    id: 'd3',
    name: 'Tyre_valve_19Oct.jpg',
    type: 'jpg',
    category: 'photo',
    subtitle: 'Tyre valve · today',
  },
];

export default function DocumentsScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'invoices' | 'reports' | 'photos'>('all');

  const filteredDocs = DOCUMENTS_LIST.filter((doc) => {
    if (activeFilter === 'invoices') return doc.category === 'invoice';
    if (activeFilter === 'reports') return doc.category === 'report';
    if (activeFilter === 'photos') return doc.category === 'photo';
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Documents</Text>
          <Text style={styles.headerSubtitle}>WP LB-7702 · 6 files</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === 'all' ? styles.filterPillActiveDark : styles.filterPillInactive,
            ]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'all' ? styles.filterTextActiveDark : styles.filterTextInactive,
              ]}
            >
              All 6
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === 'invoices' ? styles.filterPillActiveDark : styles.filterPillInactive,
            ]}
            onPress={() => setActiveFilter('invoices')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'invoices' ? styles.filterTextActiveDark : styles.filterTextInactive,
              ]}
            >
              Invoices 3
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === 'reports' ? styles.filterPillActiveDark : styles.filterPillInactive,
            ]}
            onPress={() => setActiveFilter('reports')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'reports' ? styles.filterTextActiveDark : styles.filterTextInactive,
              ]}
            >
              Reports 2
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === 'photos' ? styles.filterPillActiveDark : styles.filterPillInactive,
            ]}
            onPress={() => setActiveFilter('photos')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'photos' ? styles.filterTextActiveDark : styles.filterTextInactive,
              ]}
            >
              Photos 1
            </Text>
          </TouchableOpacity>
        </View>

        {/* FEATURED SERVICE REPORT PREVIEW CARD */}
        {(activeFilter === 'all' || activeFilter === 'reports') && (
          <View style={styles.previewCard}>
            {/* Visual Document Skeleton / Thumbnail Container */}
            <View style={styles.skeletonContainer}>
              <Text style={styles.skeletonLabel}>SERVICE REPORT</Text>
              <Text style={styles.skeletonTitle}>WP LB-7702 · 80,000 km service</Text>

              {/* Decorative document line bars */}
              <View style={[styles.skeletonLine, { width: '85%' }]} />
              <View style={[styles.skeletonLine, { width: '95%' }]} />
              <View style={[styles.skeletonLine, { width: '70%' }]} />
              <View style={[styles.skeletonLine, { width: '90%' }]} />
              <View style={[styles.skeletonLine, { width: '60%' }]} />
            </View>

            {/* Document Info */}
            <Text style={styles.previewFilename}>Service_report_2Sep.pdf</Text>
            <Text style={styles.previewMeta}>Sampath Kumara · 2 Sep 2026 · 412 KB</Text>

            {/* Action Buttons: Open & Download */}
            <View style={styles.actionBtnRow}>
              <TouchableOpacity style={styles.openBtn} activeOpacity={0.7}>
                <Text style={styles.openBtnText}>Open</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.7}>
                <Text style={styles.downloadBtnText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ATTACHMENTS LIST CARD */}
        <View style={styles.filesCard}>
          {filteredDocs.map((item, index) => {
            const isLast = index === filteredDocs.length - 1;
            const isPdf = item.type === 'pdf';

            return (
              <View
                key={item.id}
                style={[styles.fileRow, !isLast && styles.fileRowBorder]}
              >
                {/* File Type Badge (PDF vs JPG) */}
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

                {/* File Details */}
                <View style={styles.fileInfo}>
                  <Text style={styles.fileNameText}>{item.name}</Text>
                  <Text style={styles.fileSubText}>{item.subtitle}</Text>
                </View>

                {/* Download Action Icon */}
                <TouchableOpacity style={styles.downloadIconBtn} activeOpacity={0.7}>
                  <Text style={styles.downloadArrowIcon}>⤓</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.85}>
          <Text style={styles.uploadBtnText}>Upload document</Text>
        </TouchableOpacity>
        <Text style={styles.bottomSubtitle}>
          PDF or photo, linked to a maintenance record.
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
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    paddingRight: 12,
    paddingVertical: 2,
  },
  backChevron: {
    fontSize: 26,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 26,
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActiveDark: {
    backgroundColor: '#0F172A',
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
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  skeletonContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  skeletonLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  skeletonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
    marginBottom: 10,
  },
  skeletonLine: {
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    marginBottom: 6,
  },
  previewFilename: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  previewMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  openBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  openBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  downloadBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  downloadBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  filesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  fileRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
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
    fontSize: 10,
    fontWeight: '800',
  },
  jpgBadge: {
    backgroundColor: '#DBEAFE',
  },
  jpgBadgeText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
  },
  fileInfo: {
    flex: 1,
  },
  fileNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  fileSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  downloadIconBtn: {
    padding: 6,
  },
  downloadArrowIcon: {
    fontSize: 18,
    color: '#4F46E5',
    fontWeight: '700',
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
  uploadBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
