import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

export default function CreateEventScreen() {
  const [event, setEvent] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: new Date(),
    location: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleCreateEvent = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const token = await AsyncStorage.getItem('userToken');
      
      if (!userData || !token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const { id: organizer_id } = JSON.parse(userData);

      const eventData = {
        ...event,
        organizer_id,
        date: event.date.toISOString().split('T')[0],
        time: event.time.toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }),
      };

      const response = await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Event created successfully');
        router.replace('/events');
      } else {
        Alert.alert('Error', data.message || 'Failed to create event');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear nuevo evento</Text>

      <TextInput
        style={styles.input}
        placeholder="Titulo del evento"
        value={event.title}
        onChangeText={(text) => setEvent({ ...event, title: text })}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripcion del evento"
        multiline
        numberOfLines={4}
        value={event.description}
        onChangeText={(text) => setEvent({ ...event, description: text })}
      />

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>Select Date: {event.date.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={event.date}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setEvent(prev => ({ ...prev, date: selectedDate }));
            }
          }}
        />
      )}

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text>Select Time: {event.time.toLocaleTimeString()}</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={event.time}
          mode="time"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setEvent(prev => ({ ...prev, time: selectedTime }));
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

      <TouchableOpacity style={styles.button} onPress={handleCreateEvent}>
        <Text style={styles.buttonText}>Create Event</Text>
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