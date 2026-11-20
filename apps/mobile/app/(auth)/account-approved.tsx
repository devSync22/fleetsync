import { View, Text, StyleSheet } from 'react-native';
export default function AccountApprovedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Account Approved</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F5F7' },
  label: { fontSize: 16, color: '#6B7280' },
});
