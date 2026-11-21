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
import {
  globalQueueItems,
  SharedQueueItem,
  updateQueueItem,
} from '../../../data/queueStore';

export default function RecordMaintenanceScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Find matching card if opened from an issue or service, otherwise default to first item
  const selectedItem: SharedQueueItem | undefined = id
    ? globalQueueItems.find((item) => item.id === id)
    : undefined;

  // Determine initial type: automatically 'Service' or 'Issue' (Repair) based on item
  const initialType = selectedItem
    ? selectedItem.isService
      ? 'Service'
      : 'Issue'
    : 'Service';

  const [serviceType, setServiceType] = useState<'Issue' | 'Service'>(initialType);
  const [vehiclePlate] = useState(
    selectedItem ? `${selectedItem.province} ${selectedItem.plate}` : 'WP LA-9087'
  );
  const [vehicleModel] = useState(
    selectedItem ? selectedItem.vehicleModel : 'Isuzu NPR 5 t'
  );
  const [date, setDate] = useState('19 Oct 2026');
  const [odometer, setOdometer] = useState(
    selectedItem ? selectedItem.odometer.replace(' km', '') : '102,480'
  );
  const [cost, setCost] = useState(selectedItem?.cost || '18,450');
  const [workDone, setWorkDone] = useState(
    selectedItem?.workDone ||
      (selectedItem?.defaultFix ??
        'Changed engine oil and oil filter. Checked air filter and coolant level. No leaks.')
  );

  const [parts, setParts] = useState(
    selectedItem?.parts || [
      { name: 'Engine oil 15W-40', qty: '7 L' },
      { name: 'Oil filter', qty: '1' },
    ]
  );

  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState('');
  const [showAddPart, setShowAddPart] = useState(false);

  const [nextOdometer, setNextOdometer] = useState(
    selectedItem?.nextOdometer?.replace(' km', '') || '107,480'
  );
  const [nextDate, setNextDate] = useState(selectedItem?.nextDate || '19 Jan 2027');

  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'Invoice_AutoParts_19Oct.pdf', size: '184 KB' },
  ]);

  const handleAddPart = () => {
    if (newPartName.trim()) {
      setParts([...parts, { name: newPartName.trim(), qty: newPartQty.trim() || '1' }]);
      setNewPartName('');
      setNewPartQty('');
      setShowAddPart(false);
    }
  };

  const handleSave = () => {
    // If saving from a live card, update its work done/fix description and store details
    if (selectedItem) {
      updateQueueItem(selectedItem.id, {
        defaultFix: workDone,
        workDone,
        cost,
        parts,
        nextOdometer: `${nextOdometer} km`,
        nextDate,
      });

      // Navigate back to the Resolve Issue screen for this issue
      router.replace(`/issues/${selectedItem.id}`);
    } else {
      // If opened standalone without an issue ID, return to resolve issue 1 (or maintenance history)
      router.replace('/issues/1');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Record maintenance</Text>
          <Text style={styles.headerSubtitle}>
            {vehiclePlate} · {vehicleModel}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD 1: MAINTENANCE DETAILS */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>MAINTENANCE DETAILS</Text>

          {/* Row 1: Type Selection (Auto selected: Issue vs Service) & Date */}
          <View style={styles.formRow}>
            <View style={styles.fieldCol}>
              <Text style={styles.fieldLabel}>Maintenance Type</Text>
              <View style={styles.typeToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeToggleBtn,
                    serviceType === 'Issue' && styles.typeToggleBtnActiveIssue,
                  ]}
                  onPress={() => setServiceType('Issue')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.typeToggleText,
                      serviceType === 'Issue' && styles.typeToggleTextActiveIssue,
                    ]}
                  >
                    Issue
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeToggleBtn,
                    serviceType === 'Service' && styles.typeToggleBtnActiveService,
                  ]}
                  onPress={() => setServiceType('Service')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.typeToggleText,
                      serviceType === 'Service' && styles.typeToggleTextActiveService,
                    ]}
                  >
                    Service
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldCol}>
              <Text style={styles.fieldLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="DD Mon YYYY"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Row 2: Odometer & Cost */}
          <View style={styles.formRow}>
            <View style={styles.fieldCol}>
              <Text style={styles.fieldLabel}>Odometer (km)</Text>
              <TextInput
                style={styles.input}
                value={odometer}
                onChangeText={setOdometer}
                keyboardType="numeric"
                placeholder="e.g. 84,310"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.fieldCol}>
              <Text style={styles.fieldLabel}>Cost (LKR)</Text>
              <TextInput
                style={styles.input}
                value={cost}
                onChangeText={setCost}
                keyboardType="numeric"
                placeholder="e.g. 15,000"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Work Done */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Work done</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={3}
              value={workDone}
              onChangeText={setWorkDone}
              placeholder="Describe work performed, inspections, and adjustments..."
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Parts Used */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Parts used</Text>
            {parts.map((p, idx) => (
              <View key={idx} style={styles.partItemRow}>
                <Text style={styles.partName}>{p.name}</Text>
                <Text style={styles.partQty}>{p.qty}</Text>
              </View>
            ))}

            {showAddPart ? (
              <View style={styles.addPartForm}>
                <TextInput
                  style={[styles.input, { flex: 2 }]}
                  placeholder="Part name"
                  placeholderTextColor="#94A3B8"
                  value={newPartName}
                  onChangeText={setNewPartName}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Qty"
                  placeholderTextColor="#94A3B8"
                  value={newPartQty}
                  onChangeText={setNewPartQty}
                />
                <TouchableOpacity style={styles.addPartConfirmBtn} onPress={handleAddPart}>
                  <Text style={styles.addPartConfirmText}>Add</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addPartBtn}
                activeOpacity={0.7}
                onPress={() => setShowAddPart(true)}
              >
                <Text style={styles.addPartText}>+ Add part</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* CARD 2: NEXT SERVICE */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>NEXT SERVICE</Text>

          <View style={styles.formRow}>
            <View style={styles.fieldCol}>
              <Text style={styles.fieldLabel}>At odometer (km)</Text>
              <TextInput
                style={styles.input}
                value={nextOdometer}
                onChangeText={setNextOdometer}
                keyboardType="numeric"
                placeholder="e.g. 90,000"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.fieldCol}>
              <Text style={styles.fieldLabel}>Or by date</Text>
              <TextInput
                style={styles.input}
                value={nextDate}
                onChangeText={setNextDate}
                placeholder="e.g. 19 Jan 2027"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <Text style={styles.helperNotice}>
            Whichever comes first. The vehicle shows as Due soon 500 km or 7 days before.
          </Text>
        </View>

        {/* CARD 3: DOCUMENTS */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>DOCUMENTS</Text>

          {uploadedFiles.map((file, idx) => (
            <View key={idx} style={styles.uploadedFileRow}>
              <View style={styles.pdfBadge}>
                <Text style={styles.pdfBadgeText}>PDF</Text>
              </View>
              <View style={styles.fileDetails}>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileStatus}>{file.size} · uploaded</Text>
              </View>
              <TouchableOpacity
                onPress={() => setUploadedFiles([])}
                style={styles.removeFileBtn}
              >
                <Text style={styles.removeFileText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Dashed Add Document Box */}
          <TouchableOpacity style={styles.dashedUploadBox} activeOpacity={0.7}>
            <Text style={styles.uploadIcon}>📤</Text>
            <Text style={styles.uploadMainText}>Add photo or PDF</Text>
            <Text style={styles.uploadSubText}>Invoices, job cards, photos · up to 10 MB</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveRecordBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveRecordBtnText}>Save record</Text>
        </TouchableOpacity>
        <Text style={styles.bottomNoticeText}>Saved to the vehicle&apos;s maintenance history.</Text>
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
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  fieldCol: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
  },
  typeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  typeToggleBtnActiveIssue: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  typeToggleBtnActiveService: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  typeToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  typeToggleTextActiveIssue: {
    color: '#B45309',
    fontWeight: '700',
  },
  typeToggleTextActiveService: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  partItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
  },
  partName: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  partQty: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  addPartBtn: {
    marginTop: 4,
    paddingVertical: 4,
  },
  addPartText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  addPartForm: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  addPartConfirmBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addPartConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  helperNotice: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
  },
  uploadedFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 10,
  },
  pdfBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pdfBadgeText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  fileStatus: {
    fontSize: 11,
    color: '#16A34A',
    marginTop: 1,
  },
  removeFileBtn: {
    padding: 6,
  },
  removeFileText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  dashedUploadBox: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  uploadMainText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  uploadSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
  saveRecordBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  saveRecordBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomNoticeText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
