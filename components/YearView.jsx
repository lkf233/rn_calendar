import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

const getMonthGrid = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstDay = firstOfMonth.getDay(); // 0-6 (Sun-Sat), 0 is Sunday
  const start = new Date(year, month, 1 - firstDay); // Sunday-based start
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    days.push({ date: d, inMonth: d.getMonth() === month });
  }
  return days;
};

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const YearView = ({ onPickMonth }) => {
  const [current, setCurrent] = React.useState(new Date());
  const [eventsByDate, setEventsByDate] = React.useState({});
  const today = new Date();

  React.useEffect(() => {
    let mounted = true;
    const loadEvents = async () => {
      try {
        const json = await AsyncStorage.getItem('@eventsByDate');
        if (json && mounted) {
          const parsed = JSON.parse(json);
          if (parsed && typeof parsed === 'object') {
            setEventsByDate(parsed);
          }
        }
      } catch (e) {
        // noop
      }
    };
    loadEvents();
    return () => { mounted = false; };
  }, []);

  const prevYear = () => {
    setCurrent((prev) => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
  };
  const nextYear = () => {
    setCurrent((prev) => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
  };
  const goToday = () => {
    const t = new Date();
    setCurrent(new Date(t.getFullYear(), t.getMonth(), 1));
  };

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerBar}>
        <Pressable onPress={prevYear} style={styles.navBtn}>
          <Text style={styles.navText}>上一年</Text>
        </Pressable>
        <Text style={styles.headerText}>{current.getFullYear()}年</Text>
        <Pressable onPress={nextYear} style={styles.navBtn}>
          <Text style={styles.navText}>下一年</Text>
        </Pressable>
      </View>
      <View style={styles.toolBar}>
        <Pressable onPress={goToday} style={styles.navBtn}>
          <Text style={styles.navText}>今天</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.yearGrid}>
        {months.map((m) => {
          const firstOfMonth = new Date(current.getFullYear(), m, 1);
          const days = getMonthGrid(firstOfMonth);
          return (
            <Pressable key={m} style={styles.monthTile} onPress={() => {
              if (typeof onPickMonth === 'function') {
                onPickMonth(current.getFullYear(), m);
              }
            }}>
              <Text style={styles.monthTitle}>{m + 1}月</Text>
              <View style={styles.weekHeader}>
                {WEEK_LABELS.map((label) => (
                  <View key={label} style={styles.weekCell}>
                    <Text style={styles.weekLabel}>{label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.grid}>
                {days.map((item, idx) => {
                  const d = item.date;
                  const isToday = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
                  const hasEvents = (eventsByDate[formatDate(d)] || []).length > 0;
                  return (
                    <View
                      key={idx}
                      style={[styles.cell, !item.inMonth && styles.outMonthCell, isToday && styles.todayCell]}
                    >
                      <Text style={[styles.dayText, !item.inMonth && styles.outMonthText, isToday && styles.todayText]}>
                        {d.getDate()}
                      </Text>
                      {hasEvents && <View style={styles.eventDot} />}
                    </View>
                  );
                })}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default YearView;

const styles = StyleSheet.create({
  wrapper: { flex: 1, paddingHorizontal: 8, paddingTop: 12 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerText: { fontSize: 18, fontWeight: '600' },
  navBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#f3f4f6' },
  navText: { fontSize: 12, color: '#111' },
  toolBar: { marginBottom: 8, alignItems: 'flex-start' },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 12 },
  monthTile: { flexBasis: '33.333%', maxWidth: '33.333%', padding: 6 },
  monthTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  weekHeader: { flexDirection: 'row' },
  weekCell: { width: '14.2857%', alignItems: 'center', paddingVertical: 1 },
  weekLabel: { fontSize: 9, color: '#666' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', height: 18, borderColor: '#eee', borderWidth: 1, padding: 1, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 10, color: '#222', textAlign: 'center' },
  outMonthCell: { backgroundColor: '#fafafa' },
  outMonthText: { color: '#999' },
  todayCell: { borderColor: '#4f46e5', borderWidth: 2 },
  todayText: { color: '#111', fontWeight: '700' },
  eventDot: { position: 'absolute', bottom: 1, right: 1, width: 4, height: 4, borderRadius: 2, backgroundColor: '#4f46e5' },
});