import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import MonthView from './components/MonthView';

const App = () => {
  return (
    <View style={styles.container}>
      <MonthView />
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
});
