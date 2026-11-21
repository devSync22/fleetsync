import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

// 1. Data Contract for Individual Messages
interface Message {
  id: string;
  sender: 'system' | 'mechanic' | 'other';
  senderName: string;
  text: string;
  time: string;
  status?: string; // e.g. "Seen"
}

// 2. Data Contract for a Trip Incident
interface TripData {
  id: string;
  title: string;
  vehiclePlate: string;
  issueType: string;
  severity: 'Can continue carefully' | 'Immediate Attention' | 'Safe at depot';
  estimatedDelay: string;
  driver: { name: string; initials: string; role: string };
  coordinator: { name: string; initials: string; role: string };
  // Separate channels for Driver vs Central Coordinator
  driverMessages: Message[];
  coordinatorMessages: Message[];
}

const INITIAL_TRIPS: TripData[] = [
  {
    id: 'TRP-2208',
    title: 'Colombo Pharma',
    vehiclePlate: 'WP LB-7702',
    issueType: 'Tyre pressure low (Front right)',
    severity: 'Can continue carefully',
    estimatedDelay: '~20 mins delay',
    driver: { name: 'Kasun', initials: 'KJ', role: 'Driver' },
    coordinator: { name: 'Nimal', initials: 'NP', role: 'Coordinator' },
    driverMessages: [
      {
        id: '1',
        sender: 'system',
        senderName: 'Fleet Alert',
        text: 'Issue reported 10:15 · Tyres · can continue carefully',
        time: '10:15',
      },
      {
        id: '2',
        sender: 'mechanic',
        senderName: 'Ishara (Mechanic)',
        text: 'Saw your report. Is the tyre flat or just low?',
        time: '10:16',
      },
      {
        id: '3',
        sender: 'other',
        senderName: 'Kasun (Driver)',
        text: 'Just low. Warning light is on, still holding.',
        time: '10:17',
      },
      {
        id: '4',
        sender: 'mechanic',
        senderName: 'Ishara (Mechanic)',
        text: 'OK. Keep under 50 km/h. There is a tyre shop at Ja-Ela on your route if it gets worse. I will check it when you are back.',
        time: '10:18',
        status: 'Seen',
      },
      {
        id: '5',
        sender: 'other',
        senderName: 'Kasun (Driver)',
        text: 'Thanks, will do.',
        time: '10:19',
      },
    ],
    coordinatorMessages: [
      {
        id: 'c1',
        sender: 'system',
        senderName: 'System Log',
        text: 'Trip incident created: Tyre pressure low on vehicle WP LB-7702',
        time: '10:15',
      },
      {
        id: 'c2',
        sender: 'other',
        senderName: 'Nimal (Coordinator)',
        text: 'Hey Ishara, will Kasun make the 11:30 delivery window to Colombo Pharma?',
        time: '10:20',
      },
      {
        id: 'c3',
        sender: 'mechanic',
        senderName: 'Ishara (Mechanic)',
        text: 'Tyre is holding pressure. Told him to keep under 50 km/h. Expected delay is around 15–20 minutes maximum.',
        time: '10:22',
        status: 'Seen',
      },
      {
        id: 'c4',
        sender: 'other',
        senderName: 'Nimal (Coordinator)',
        text: 'Great, I will notify the recipient customer now. Keep me posted.',
        time: '10:23',
      },
    ],
  },
  {
    id: 'TRP-2215',
    title: 'Ceylon Cold Stores Express',
    vehiclePlate: 'WP LE-3316',
    issueType: 'Refrigeration unit not cooling (+8°C)',
    severity: 'Immediate Attention',
    estimatedDelay: 'Critical perishable cargo',
    driver: { name: 'Dinesh', initials: 'DW', role: 'Driver' },
    coordinator: { name: 'Nimal', initials: 'NP', role: 'Coordinator' },
    driverMessages: [
      {
        id: 'd201',
        sender: 'system',
        senderName: 'Fleet Alert',
        text: 'Cooling Unit Alert: Cargo bay temperature exceeded +5°C threshold',
        time: '10:30',
      },
      {
        id: 'd202',
        sender: 'other',
        senderName: 'Dinesh (Driver)',
        text: 'The compressor is clicking every 30 seconds but the fan won\'t spin.',
        time: '10:31',
      },
    ],
    coordinatorMessages: [
      {
        id: 'c201',
        sender: 'other',
        senderName: 'Nimal (Coordinator)',
        text: 'Dairy cargo on board worth 850,000 LKR. Need an urgent repair ETA or swap truck!',
        time: '10:32',
      },
    ],
  },
];

export default function MechanicChatScreen() {
  const [trips, setTrips] = useState<TripData[]>(INITIAL_TRIPS);
  const [selectedTripId, setSelectedTripId] = useState<string>('TRP-2208');
  const [activeChannel, setActiveChannel] = useState<'driver' | 'coordinator'>('driver');
  const [isTripPickerOpen, setIsTripPickerOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');

  // Active Trip Object
  const activeTrip = trips.find((t) => t.id === selectedTripId) || trips[0];

  // Active Messages based on selected channel (Driver vs Coordinator)
  const currentMessages =
    activeChannel === 'driver' ? activeTrip.driverMessages : activeTrip.coordinatorMessages;

  const currentRecipientName =
    activeChannel === 'driver' ? activeTrip.driver.name : activeTrip.coordinator.name;

  // Send a new message to the active channel
  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'mechanic',
      senderName: 'Ishara (Mechanic)',
      text: inputText.trim(),
      time: 'Just now',
      status: 'Sent',
    };

    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        if (trip.id === activeTrip.id) {
          if (activeChannel === 'driver') {
            return { ...trip, driverMessages: [...trip.driverMessages, newMessage] };
          } else {
            return { ...trip, coordinatorMessages: [...trip.coordinatorMessages, newMessage] };
          }
        }
        return trip;
      })
    );

    setInputText('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {/* ========================================================= */}
        {/* 1. HEADER SECTION                                         */}
        {/* ========================================================= */}
        <View style={styles.header}>
          {/* Trip Room Selector Pill */}
          <TouchableOpacity
            style={styles.tripDropdown}
            activeOpacity={0.7}
            onPress={() => setIsTripPickerOpen(true)}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.chevronLeft}>‹</Text>
            </TouchableOpacity>

            <View style={styles.tripInfo}>
              <Text style={styles.tripLabel}>Trip room · Tap to switch</Text>
              <Text style={styles.tripTitle}>
                {activeTrip.id} · {activeTrip.title}
              </Text>
            </View>

            <View style={styles.chevronBadge}>
              <Text style={styles.chevronDown}>⌄</Text>
            </View>
          </TouchableOpacity>

          {/* Channel Selector: Driver vs Coordinator */}
          <View style={styles.participantRow}>
            {/* Driver Channel Pill */}
            <TouchableOpacity
              style={[
                styles.participantCard,
                activeChannel === 'driver' && styles.participantCardActive,
              ]}
              onPress={() => setActiveChannel('driver')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.avatarCircle,
                  activeChannel === 'driver'
                    ? styles.avatarCircleActive
                    : styles.avatarCircleInactive,
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    activeChannel === 'driver'
                      ? styles.avatarTextActive
                      : styles.avatarTextInactive,
                  ]}
                >
                  {activeTrip.driver.initials}
                </Text>
              </View>
              <View>
                <Text style={styles.participantName}>{activeTrip.driver.name}</Text>
                <Text style={styles.participantRole}>Driver</Text>
              </View>
            </TouchableOpacity>

            {/* Coordinator Channel Pill */}
            <TouchableOpacity
              style={[
                styles.participantCard,
                activeChannel === 'coordinator' && styles.participantCardActive,
              ]}
              onPress={() => setActiveChannel('coordinator')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.avatarCircle,
                  activeChannel === 'coordinator'
                    ? styles.avatarCircleActive
                    : styles.avatarCircleInactive,
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    activeChannel === 'coordinator'
                      ? styles.avatarTextActive
                      : styles.avatarTextInactive,
                  ]}
                >
                  {activeTrip.coordinator.initials}
                </Text>
              </View>
              <View>
                <Text style={styles.participantName}>{activeTrip.coordinator.name}</Text>
                <Text style={styles.participantRole}>Coordinator</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================= */}
        {/* 2. CHAT FEED AREA                                         */}
        {/* ========================================================= */}
        <ScrollView
          style={styles.chatArea}
          contentContainerStyle={styles.chatScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SPECIAL: In Coordinator Channel, show the Issue Summary Card */}
          {activeChannel === 'coordinator' && (
            <View style={styles.coordinatorSummaryCard}>
              <View style={styles.summaryTopRow}>
                <Text style={styles.summaryBadge}>📋 Incident Dispatch Summary</Text>
                <Text style={styles.summaryPlate}>{activeTrip.vehiclePlate}</Text>
              </View>
              <Text style={styles.summaryFaultTitle}>{activeTrip.issueType}</Text>
              <View style={styles.summaryMetaGrid}>
                <View>
                  <Text style={styles.summaryMetaLabel}>Driver on road</Text>
                  <Text style={styles.summaryMetaValue}>{activeTrip.driver.name}</Text>
                </View>
                <View>
                  <Text style={styles.summaryMetaLabel}>Status Severity</Text>
                  <Text style={styles.summarySeverity}>{activeTrip.severity}</Text>
                </View>
                <View>
                  <Text style={styles.summaryMetaLabel}>Impact / Delay</Text>
                  <Text style={styles.summaryMetaValue}>{activeTrip.estimatedDelay}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Render Active Channel Messages */}
          {currentMessages.map((item) => {
            // Case 1: System Alert
            if (item.sender === 'system') {
              return (
                <View key={item.id} style={styles.systemBubbleContainer}>
                  <View style={styles.systemBubble}>
                    <Text style={styles.systemBubbleText}>{item.text}</Text>
                  </View>
                </View>
              );
            }

            // Case 2: Mechanic Message (Outgoing / Right)
            if (item.sender === 'mechanic') {
              return (
                <View key={item.id} style={styles.mechanicRow}>
                  <View style={styles.mechanicBubble}>
                    <Text style={styles.mechanicText}>{item.text}</Text>
                  </View>
                  <Text style={styles.mechanicTimestamp}>
                    {item.time} {item.status ? `· ${item.status}` : ''}
                  </Text>
                </View>
              );
            }

            // Case 3: Other Party (Driver or Coordinator Incoming / Left)
            return (
              <View key={item.id} style={styles.incomingRow}>
                <View style={styles.incomingBubble}>
                  <Text style={styles.incomingText}>{item.text}</Text>
                </View>
                <Text style={styles.incomingTimestamp}>{item.time}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* ========================================================= */}
        {/* 3. BOTTOM INPUT BAR                                       */}
        {/* ========================================================= */}
        <View style={styles.inputBarContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={`Message ${currentRecipientName}...`}
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ========================================================= */}
      {/* 4. TRIP PICKER MODAL SHEET                                */}
      {/* ========================================================= */}
      <Modal
        visible={isTripPickerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTripPickerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Incident Trip</Text>
                <Text style={styles.modalSubtitle}>
                  Active trips with vehicle assistance requests
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsTripPickerOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              {trips.map((trip) => {
                const isSelected = trip.id === activeTrip.id;
                return (
                  <TouchableOpacity
                    key={trip.id}
                    style={[
                      styles.tripOptionCard,
                      isSelected && styles.tripOptionCardActive,
                    ]}
                    onPress={() => {
                      setSelectedTripId(trip.id);
                      setIsTripPickerOpen(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.tripOptionTop}>
                      <Text style={styles.tripOptionId}>{trip.id}</Text>
                      <Text style={styles.tripOptionPlate}>{trip.vehiclePlate}</Text>
                    </View>
                    <Text style={styles.tripOptionTitle}>{trip.title}</Text>
                    <Text style={styles.tripOptionIssue}>⚠️ {trip.issueType}</Text>
                    <Text style={styles.tripOptionMeta}>
                      Driver: {trip.driver.name} · Coordinator: {trip.coordinator.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  /* --- HEADER STYLES --- */
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tripDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButton: {
    paddingRight: 8,
  },
  chevronLeft: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 24,
  },
  tripInfo: {
    flex: 1,
    marginLeft: 4,
  },
  tripLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  tripTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  chevronBadge: {
    backgroundColor: '#E2E8F0',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronDown: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: -2,
  },
  participantRow: {
    flexDirection: 'row',
    gap: 10,
  },
  participantCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 10,
  },
  participantCardActive: {
    borderColor: '#4F46E5', // active blue outline from design
    backgroundColor: '#EEF2FF', // subtle tinted background
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircleActive: {
    backgroundColor: '#FFFFFF',
  },
  avatarCircleInactive: {
    backgroundColor: '#F1F5F9',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  avatarTextActive: {
    color: '#4F46E5',
  },
  avatarTextInactive: {
    color: '#64748B',
  },
  participantName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  participantRole: {
    fontSize: 11,
    color: '#64748B',
  },

  /* --- CHAT AREA STYLES --- */
  chatArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  chatScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },

  /* Coordinator Incident Summary Card */
  coordinatorSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryPlate: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryFaultTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  summaryMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  summaryMetaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  summaryMetaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  summarySeverity: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 2,
  },

  /* 1. System Alert Bubble */
  systemBubbleContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  systemBubble: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    maxWidth: '92%',
  },
  systemBubbleText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#92400E',
    lineHeight: 18,
    textAlign: 'center',
  },

  /* 2. Mechanic Message (Right) */
  mechanicRow: {
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  mechanicBubble: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    maxWidth: '82%',
  },
  mechanicText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  mechanicTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    marginRight: 4,
  },

  /* 3. Incoming Message (Left) */
  incomingRow: {
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  incomingBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    maxWidth: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  incomingText: {
    color: '#0F172A',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  incomingTimestamp: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    marginLeft: 4,
  },

  /* --- INPUT BAR STYLES --- */
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    transform: [{ rotate: '-10deg' }],
    marginLeft: 2,
  },

  /* --- MODAL STYLES --- */
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  tripOptionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  tripOptionCardActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  tripOptionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tripOptionId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  tripOptionPlate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  tripOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  tripOptionIssue: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '600',
    marginTop: 3,
  },
  tripOptionMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
  },
});
