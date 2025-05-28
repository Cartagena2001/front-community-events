import { Nav } from '@/components/Nav';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { name } = JSON.parse(userData);
        setUserName(name);
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Nav userName={userName} />
        <View style={styles.content}>
          <Stack>
            <Stack.Screen 
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="create-event" 
              options={{
                title: 'Create Event',
                headerShown: true,
              }}
            />
            <Stack.Screen 
              name="events" 
              options={{
                title: 'Events',
                headerShown: true,
              }}
            />
            <Stack.Screen 
              name="participations" 
              options={{
                title: 'My Participations',
                headerShown: true,
              }}
            />
            <Stack.Screen 
              name="history" 
              options={{
                title: 'History',
                headerShown: true,
              }}
            />
            <Stack.Screen 
              name="statistics" 
              options={{
                title: 'Statistics',
                headerShown: true,
              }}
            />
            <Stack.Screen 
              name="view-event/[id]" 
              options={{
                title: 'View Event',
                headerShown: true,
              }}
            />
          </Stack>
        </View>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
});
