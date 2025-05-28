import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function Nav({ userName }: { userName: string }) {
  const { logout } = useAuth();
  const navItems = [
    { title: 'Inicio', route: '/(tabs)' },
    { title: 'Crear Evento', route: '/(tabs)/create-event' },
    { title: 'Ver Eventos', route: '/(tabs)/events' },
    { title: 'Mis Participaciones', route: '/(tabs)/participations' },
    { title: 'Historial', route: '/(tabs)/history' },
    { title: 'Estadísticas', route: '/(tabs)/statistics' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>Bienvenido: {userName}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.nav}>
        {navItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => router.push(item.route as any)}
          >
            <Text style={styles.navText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  userInfo: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  logoutText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  nav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  navItem: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  navText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});