import { Event } from '@/types/event';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://localhost:3000/api/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setEvent({
        ...data,
        date: new Date(data.date),
        time: new Date(`2000-01-01T${data.time}`),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load event');
    }
  };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Format the date properly
      const formattedDate = event?.date ? new Date(event.date).toISOString().split('T')[0] : '';
      const formattedTime = event?.time ? new Date(event.time).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      }) : '';

      const response = await fetch(`http://localhost:3000/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...event,
          date: formattedDate,
          time: formattedTime,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Event updated successfully');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to update event');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update event');
    }
  };

  if (!event) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar evento</Text>

      <TextInput
        style={styles.input}
        placeholder="Event Title"
        value={event.title}
        onChangeText={(text) => setEvent({ ...event, title: text })}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        multiline
        numberOfLines={4}
        value={event.description}
        onChangeText={(text) => setEvent({ ...event, description: text })}
      />

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>Select Date: {new Date(event.date).toLocaleDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(event.date)}
          mode="date"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setEvent({ ...event, date: selectedDate.toISOString() });
            }
          }}
        />
      )}

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text>Select Time: {new Date(event.time).toLocaleTimeString()}</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={new Date(event.time)}
          mode="time"
          onChange={(_, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setEvent({ ...event, time: selectedTime.toISOString() });
            }
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={event.location}
        onChangeText={(text) => setEvent({ ...event, location: text })}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update Event</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});