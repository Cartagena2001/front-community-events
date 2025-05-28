import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Comment {
  id: number;
  user_id: number;
  event_id: number;
  comment: string;
  rating: number;
  created_at: string;
  name: string;
}

interface EventCommentsProps {
  eventId: number;
  hasMarkedAttendance: boolean;
}

export default function EventComments({ eventId, hasMarkedAttendance }: EventCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hasAlreadyCommented, setHasAlreadyCommented] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    getUserId();
  }, []);
  
  useEffect(() => {
    if (userId !== null) {
      loadComments();
    }
  }, [userId]);

  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { id } = JSON.parse(userData);
        setUserId(id);
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  };

  const loadComments = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setComments(data);
      
      // Check if user has already commented
      const userComment = data.find((comment: Comment) => comment.user_id === userId);
      setHasAlreadyCommented(!!userComment);
    } catch (error) {
      Alert.alert('Error', 'Failed to load comments');
    }
  };

  const handleSubmitComment = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: rating.toString(),
          comment: newComment,
        }),
      });

      if (response.ok) {
        setNewComment('');
        setRating(0);
        loadComments(); // Reload comments after posting
        Alert.alert('Success', '¡Comentario publicado exitosamente!');
      } else {
        Alert.alert('Error', 'Failed to post comment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  const RatingStars = ({ value, onRatingChange }: { value: number, onRatingChange?: (rating: number) => void }) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange && onRatingChange(star)}
            disabled={!onRatingChange}
          >
            <AntDesign
              name={star <= value ? "star" : "staro"}
              size={24}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comentarios del Evento</Text>
      
      {hasMarkedAttendance && !hasAlreadyCommented && (
        <View style={styles.inputContainer}>
          <Text style={styles.ratingLabel}>Tu calificación:</Text>
          <RatingStars value={rating} onRatingChange={setRating} />
          <TextInput
            style={styles.commentInput}
            placeholder="Escribe tu comentario..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmitComment}
          >
            <Text style={styles.submitButtonText}>Publicar Comentario</Text>
          </TouchableOpacity>
        </View>
      )}

      {!hasMarkedAttendance && (
        <Text style={styles.warningText}>
          Debes marcar tu asistencia al evento para poder comentar.
        </Text>
      )}

      {hasAlreadyCommented && (
        <Text style={styles.infoText}>
          Ya has publicado tu comentario para este evento.
        </Text>
      )}

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentCard}>
            <Text style={styles.userName}>{item.name}</Text>
            <RatingStars value={item.rating} />
            <Text style={styles.commentText}>{item.comment}</Text>
            <Text style={styles.dateText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 15,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    marginVertical: 10,
  },
  dateText: {
    color: '#666',
    fontSize: 12,
  },
  warningText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  infoText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
});