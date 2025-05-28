import EventComments from "@/components/EventComments";
import { Event } from "@/types/event";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ViewEventScreen() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isParticipating, setIsParticipating] = useState(false);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadEvent();
      handleGetMarkedAttendance();
    }
  }, [userId, id]);

  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const { id } = JSON.parse(userData);
        setUserId(id);
      }
    } catch (error) {
      console.error("Error getting user data:", error);
    }
  };

  const loadEvent = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const [eventResponse, participantsResponse] = await Promise.all([
        fetch(`http://localhost:3000/api/events/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`http://localhost:3000/api/events/${id}/participants`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const eventData = await eventResponse.json();
      const participantsData = await participantsResponse.json();

      setEvent(eventData);

      // Verificar participación usando el userId actual
      const userParticipating = participantsData.some(
        (participant: any) => participant.user_id === userId
      );
      setIsParticipating(userParticipating);
    } catch (error) {
      Alert.alert("Error", "Failed to load event");
    }
  };

  const handleJoinEvent = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `http://localhost:3000/api/events/${id}/participants`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            rsvp_status: "yes",
          }),
        }
      );

      if (response.ok) {
        setIsParticipating(true);
        Alert.alert("Success", "Successfully joined the event!");
      } else {
        const data = await response.json();
        Alert.alert("Error", data.message || "Failed to join event");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to join event");
    }
  };

  const handleCancelParticipation = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `http://localhost:3000/api/events/${id}/participants`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setIsParticipating(false);
        Alert.alert("Success", "¡Has cancelado tu participación!");
      } else {
        const data = await response.json();
        Alert.alert("Error", data.message || "Failed to cancel participation");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to cancel participation");
    }
  };

  // Add this state to track attendance status
  const [hasMarkedAttendance, setHasMarkedAttendance] = useState(false);

  // Modify your handleMarkAttendance function
  const handleMarkAttendance = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `http://localhost:3000/api/events/${id}/participants/${userId}/attendance`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attended: "1",
          }),
        }
      );

      if (response.ok) {
        setHasMarkedAttendance(true);
        Alert.alert("Success", "¡Asistencia marcada correctamente!");
      } else {
        const data = await response.json();
        Alert.alert("Error", data.message || "Failed to mark attendance");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to mark attendance");
    }
  };

  const handleGetMarkedAttendance = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `http://localhost:3000/api/events/${id}/participants/my-participation`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.ok) {
        const participationData = await response.json();
        setHasMarkedAttendance(participationData.attended === 1);
      } else {
        console.error("Error en la respuesta:", response.status);
      }
    } catch (error) {
      console.error("Error getting attendance:", error);
    }
  };

  // Update where you render EventComments
  <EventComments
    eventId={parseInt(id as string)}
    hasMarkedAttendance={hasMarkedAttendance}
  />;

  // Add this function to check if event has passed
  const isEventPassed = () => {
    if (!event) return false;

    try {
      // Ensure date is in YYYY-MM-DD format
      const [year, month, day] = event.date.split("-");
      // Ensure time is in HH:mm:ss format and get hours and minutes
      const [hours, minutes] = event.time.split(":");

      // Create a new date with the components
      const eventDate = new Date(
        parseInt(year),
        parseInt(month) - 1, // Months are 0-based in JavaScript
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );

      const currentDate = new Date();

      return eventDate < currentDate;
    } catch (error) {
      console.error("Error parsing date:", error);
      return false;
    }
  };

  if (!event) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.eventCard}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>Date: {event.date}</Text>
          <Text style={styles.detailText}>Time: {event.time}</Text>
          <Text style={styles.detailText}>Location: {event.location}</Text>
        </View>

        {userId !== event.organizer_id &&
          (isEventPassed() ? (
            <>
              {!hasMarkedAttendance ? (
                <TouchableOpacity
                  style={styles.attendanceButton}
                  onPress={handleMarkAttendance}
                >
                  <Text style={styles.attendanceButtonText}>
                    Marcar asistencia
                  </Text>
                </TouchableOpacity>
              ) : (
                <EventComments
                  eventId={parseInt(id as string)}
                  hasMarkedAttendance={hasMarkedAttendance}
                />
              )}
            </>
          ) : isParticipating ? (
            <View style={styles.participationContainer}>
              <View style={styles.alreadyJoinedContainer}>
                <Text style={styles.alreadyJoinedText}>
                  ¡Ya estás apuntado a este evento!
                </Text>
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelParticipation}
              >
                <Text style={styles.cancelButtonText}>
                  Cancelar participación
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoinEvent}
            >
              <Text style={styles.joinButtonText}>Apuntarme al evento!!</Text>
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );
}

// Add these new styles to your existing StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  eventCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
  },
  joinButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  alreadyJoinedContainer: {
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  alreadyJoinedText: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "bold",
  },
  participationContainer: {
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  attendanceButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  attendanceButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
