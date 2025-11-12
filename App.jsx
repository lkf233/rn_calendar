import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';

const App = () => {
  const [mode, setMode] = React.useState('month');
  return (
    <View style={styles.container}>
      <View style={styles.modeBar}>
        <Pressable onPress={() => setMode('month')} style={[styles.modeBtn, mode === 'month' && styles.modeBtnActive]}>
          <Text style={[styles.modeText, mode === 'month' && styles.modeTextActive]}>月视图</Text>
        </Pressable>
        <Pressable onPress={() => setMode('week')} style={[styles.modeBtn, mode === 'week' && styles.modeBtnActive]}>
          <Text style={[styles.modeText, mode === 'week' && styles.modeTextActive]}>周视图</Text>
        </Pressable>
      </View>
      {mode === 'month' ? <MonthView /> : <WeekView />}
      <StatusBar style="auto" />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  modeBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 },
  modeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#f3f4f6' },
  modeBtnActive: { backgroundColor: '#eef2ff' },
  modeText: { fontSize: 12, color: '#111' },
  modeTextActive: { fontWeight: '700', color: '#1f2937' },
});
