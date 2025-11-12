import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

const getMonthGrid = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstDay = firstOfMonth.getDay(); // 0-6 (Sun-Sat)
  const mondayIndex = (firstDay + 6) % 7; // convert to Monday-based index
  const start = new Date(year, month, 1 - mondayIndex);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    days.push({
      date: d,
      inMonth: d.getMonth() === month,
    });
  }
  return days;
};

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const MonthView = ({ initialDate }) => {
  const [current, setCurrent] = React.useState(new Date());
  const [selected, setSelected] = React.useState(new Date());
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState('');
  const [eventsByDate, setEventsByDate] = React.useState({});
  const days = getMonthGrid(current);
  const today = new Date();

  React.useEffect(() => {
    if (initialDate instanceof Date) {
      const d = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
      setCurrent(d);
      setSelected(initialDate);
    }
  }, [initialDate]);

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

  React.useEffect(() => {
    const saveEvents = async () => {
      try {
        await AsyncStorage.setItem('@eventsByDate', JSON.stringify(eventsByDate));
      } catch (e) {
        // noop
      }
    };
    saveEvents();
  }, [eventsByDate]);

  const prevMonth = () => {
    setCurrent((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrent((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const goToday = () => {
    const t = new Date();
    setCurrent(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelected(t);
  };
  const openAddForm = () => setShowAddForm(true);
  const closeAddForm = () => { setShowAddForm(false); setDraftTitle(''); };
  const addEvent = () => {
    const title = draftTitle.trim();
    if (!title) return;
    const key = formatDate(selected);
    setEventsByDate((prev) => {
      const list = prev[key] || [];
      const newEvt = { id: Date.now().toString(), title };
      return { ...prev, [key]: [...list, newEvt] };
    });
    closeAddForm();
  };
  const deleteEvent = (id) => {
    const key = formatDate(selected);
    setEventsByDate((prev) => {
      const list = prev[key] || [];
      return { ...prev, [key]: list.filter((evt) => evt.id !== id) };
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerBar}>
        <Pressable onPress={prevMonth} style={styles.navBtn}>
          <Text style={styles.navText}>上一月</Text>
        </Pressable>
        <Text style={styles.headerText}>{current.getFullYear()}年 {current.getMonth() + 1}月</Text>
        <Pressable onPress={nextMonth} style={styles.navBtn}>
          <Text style={styles.navText}>下一月</Text>
        </Pressable>
      </View>
      <View style={styles.weekHeader}>
        {WEEK_LABELS.map((label) => (
          <View key={label} style={styles.weekCell}>
            <Text style={styles.weekLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.toolBar}>
        <Pressable onPress={goToday} style={styles.navBtn}>
          <Text style={styles.navText}>今天</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {days.map((item, idx) => {
          const d = item.date;
          const isToday = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
          const isSelected = d.getFullYear() === selected.getFullYear() && d.getMonth() === selected.getMonth() && d.getDate() === selected.getDate();
          const hasEvents = (eventsByDate[formatDate(d)] || []).length > 0;
          return (
            <Pressable
              key={idx}
              onPress={() => setSelected(d)}
              onLongPress={() => { setSelected(d); openAddForm(); }}
              style={[styles.cell, !item.inMonth && styles.outMonthCell, isToday && styles.todayCell, isSelected && styles.selectedCell]}
            >
              <Text style={[styles.dayText, !item.inMonth && styles.outMonthText, isToday && styles.todayText]}>
                {d.getDate()}
              </Text>
              {hasEvents && <View style={styles.eventDot} />}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerDate}>选中：{formatDate(selected)}</Text>
        {!showAddForm ? (
          <View style={styles.footerList}>
            {((eventsByDate[formatDate(selected)] || []).length === 0) ? (
              <Text style={styles.footerEmpty}>暂无日程</Text>
            ) : (
              (eventsByDate[formatDate(selected)] || []).map((evt) => (
                <View key={evt.id} style={styles.eventItemRow}>
                  <Text style={styles.eventTitle}>{evt.title}</Text>
                  <Pressable onPress={() => deleteEvent(evt.id)} style={styles.delBtn}>
                    <Text style={styles.delText}>删除</Text>
                  </Pressable>
                </View>
              ))
            )}
            <Pressable onPress={openAddForm} style={[styles.navBtn, styles.addBtn]}>
              <Text style={styles.navText}>添加日程</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>添加日程（占位）</Text>
            <Text style={styles.addFormLabel}>日期：{formatDate(selected)}</Text>
            <TextInput
              style={styles.input}
              placeholder="标题"
              value={draftTitle}
              onChangeText={setDraftTitle}
            />
            <View style={styles.btnRow}>
              <Pressable onPress={closeAddForm} style={styles.navBtn}>
                <Text style={styles.navText}>取消</Text>
              </Pressable>
              <Pressable onPress={addEvent} style={[styles.navBtn, styles.primaryBtn]}>
                <Text style={[styles.navText, styles.primaryText]}>保存</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default MonthView;

const styles = StyleSheet.create({
  wrapper: { flex: 1, paddingHorizontal: 12, paddingTop: 16 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerText: { fontSize: 18, fontWeight: '600' },
  navBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#f3f4f6' },
  navText: { fontSize: 12, color: '#111' },
  weekHeader: { flexDirection: 'row' },
  weekCell: { width: '14.2857%', alignItems: 'center', paddingVertical: 6 },
  weekLabel: { fontSize: 12, color: '#666' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', height: 56, borderColor: '#eee', borderWidth: 1, padding: 4, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 14, color: '#222', textAlign: 'center' },
  outMonthCell: { backgroundColor: '#fafafa' },
  outMonthText: { color: '#999' },
  todayCell: { borderColor: '#4f46e5', borderWidth: 2 },
  todayText: { color: '#111', fontWeight: '700' },
  selectedCell: { backgroundColor: '#eef2ff' },
  toolBar: { marginBottom: 8, alignItems: 'flex-start' },
  footer: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  footerDate: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  footerList: { minHeight: 40, alignItems: 'center', justifyContent: 'center', gap: 6 },
  footerEmpty: { fontSize: 12, color: '#666' },
  addBtn: { marginTop: 4 },
  addForm: { gap: 8 },
  addFormTitle: { fontSize: 14, fontWeight: '600' },
  addFormLabel: { fontSize: 12, color: '#444' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 6 },
  btnRow: { flexDirection: 'row', gap: 8 },
  primaryBtn: { backgroundColor: '#4f46e5' },
  primaryText: { color: '#fff' },
  eventItem: { paddingVertical: 4 },
  eventItemRow: { paddingVertical: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  delBtn: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#fee2e2' },
  delText: { fontSize: 12, color: '#991b1b' },
  eventTitle: { fontSize: 12, color: '#111' },
  eventDot: { position: 'absolute', bottom: 4, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: '#4f46e5' },
});