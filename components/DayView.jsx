import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const DayView = () => {
  const [selected, setSelected] = React.useState(new Date());
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState('');
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

  const prevDay = () => {
    setSelected((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
  };
  const nextDay = () => {
    setSelected((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
  };
  const goToday = () => {
    const t = new Date();
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

  const isToday = selected.getFullYear() === today.getFullYear() && selected.getMonth() === today.getMonth() && selected.getDate() === today.getDate();

  const events = eventsByDate[formatDate(selected)] || [];

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerBar}>
        <Pressable onPress={prevDay} style={styles.navBtn}>
          <Text style={styles.navText}>前一天</Text>
        </Pressable>
        <Text style={styles.headerText}>
          {selected.getFullYear()}年 {selected.getMonth() + 1}月 {selected.getDate()}日{isToday ? '（今天）' : ''}
        </Text>
        <Pressable onPress={nextDay} style={styles.navBtn}>
          <Text style={styles.navText}>后一天</Text>
        </Pressable>
      </View>

      <View style={styles.toolBar}>
        <Pressable onPress={goToday} style={styles.navBtn}>
          <Text style={styles.navText}>今天</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>当日日程</Text>
        {events.length === 0 ? (
          <Text style={styles.footerEmpty}>暂无日程</Text>
        ) : (
          events.map((evt) => (
            <View key={evt.id} style={styles.eventItemRow}>
              <Text style={styles.eventTitle}>{evt.title}</Text>
              <Pressable onPress={() => deleteEvent(evt.id)} style={styles.delBtn}>
                <Text style={styles.delText}>删除</Text>
              </Pressable>
            </View>
          ))
        )}
        {!showAddForm ? (
          <Pressable onPress={openAddForm} style={[styles.navBtn, styles.addBtn]}>
            <Text style={styles.navText}>添加日程</Text>
          </Pressable>
        ) : (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>添加日程</Text>
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

export default DayView;

const styles = StyleSheet.create({
  wrapper: { flex: 1, paddingHorizontal: 12, paddingTop: 16 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerText: { fontSize: 18, fontWeight: '600' },
  navBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#f3f4f6' },
  navText: { fontSize: 12, color: '#111' },
  toolBar: { marginBottom: 8, alignItems: 'flex-start' },
  content: { gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '600' },
  footerEmpty: { fontSize: 12, color: '#666' },
  addBtn: { marginTop: 4 },
  addForm: { gap: 8 },
  addFormTitle: { fontSize: 14, fontWeight: '600' },
  addFormLabel: { fontSize: 12, color: '#444' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 6 },
  btnRow: { flexDirection: 'row', gap: 8 },
  primaryBtn: { backgroundColor: '#4f46e5' },
  primaryText: { color: '#fff' },
  eventItemRow: { paddingVertical: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  delBtn: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#fee2e2' },
  delText: { fontSize: 12, color: '#991b1b' },
  eventTitle: { fontSize: 12, color: '#111' },
});