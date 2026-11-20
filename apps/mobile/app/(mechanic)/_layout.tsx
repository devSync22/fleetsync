import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

// Custom lightweight SVG/vector-like icons for bottom tab bar
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const color = focused ? '#4F46E5' : '#64748B';

  switch (name) {
    case 'queue':
      return (
        <View style={styles.iconContainer}>
          <Text style={[styles.symbolIcon, { color }]}>🔧</Text>
        </View>
      );
    case 'issues':
      return (
        <View style={styles.iconContainer}>
          <Text style={[styles.symbolIcon, { color }]}>⚠️</Text>
        </View>
      );
    case 'services':
      return (
        <View style={styles.iconContainer}>
          <Text style={[styles.symbolIcon, { color }]}>📅</Text>
        </View>
      );
    case 'history':
      return (
        <View style={styles.iconContainer}>
          <Text style={[styles.symbolIcon, { color }]}>📜</Text>
        </View>
      );
    default:
      return null;
  }
}

export default function MechanicLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* 4 PRIMARY CORE TABS */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Queue',
          tabBarIcon: ({ focused }) => <TabIcon name="queue" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="issues"
        options={{
          title: 'Issues',
          tabBarIcon: ({ focused }) => <TabIcon name="issues" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ focused }) => <TabIcon name="services" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon name="history" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolIcon: {
    fontSize: 18,
  },
});
