
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ThemedView style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title" style={{ textAlign: 'center', padding: 20, color: 'black' }}>
        Bienvenido a la Aplicación de Gestión de Eventos Comunitarios
      </ThemedText>
    </ThemedView>
  );
}