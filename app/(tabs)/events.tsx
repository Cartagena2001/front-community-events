import { Event } from '@/types/event';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadEvents();
    getUserId();
  }, []);

  const getUserId = async () => {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const { id } = JSON.parse(userData);
      setUserId(id);
    }
  };

  const loadEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://localhost:3000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load events');
    }
  };

  const handleDelete = async (eventId: number) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Event deleted successfully');
        loadEvents();
      } else {
        Alert.alert('Error', 'Failed to delete event');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete event');
    }
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDescription}>{item.description}</Text>
      <Text>Date: {item.date}</Text>
      <Text>Time: {item.time}</Text>
      <Text>Location: {item.location}</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, additionalStyles.viewButton]}
          onPress={() => router.push({
            pathname: '/(tabs)/view-event/[id]',
            params: { id: item.id }
          })}
        >
          <Text style={styles.buttonText}>Ver evento</Text>
        </TouchableOpacity>

        {item.organizer_id === userId && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => router.push({
                pathname: '/(tabs)/edit-event/[id]',
                params: { id: item.id }
              })}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => handleDelete(item.id!)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  // Add this to your existing styles
  const additionalStyles = StyleSheet.create({
    viewButton: {
      backgroundColor: '#4CAF50',
    },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id?.toString() || ''}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDescription: {
    marginBottom: 10,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  button: {
    padding: 8,
    borderRadius: 5,
    minWidth: 70,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
});