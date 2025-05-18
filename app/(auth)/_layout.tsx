import { AuthRedirect } from '@/components/AuthRedirect';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <AuthRedirect>
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            title: 'Login',
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: 'Register',
          }}
        />
      </Stack>
    </AuthRedirect>
  );
}