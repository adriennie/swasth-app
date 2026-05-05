import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { paddingTop: 10 },
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="supplier-login" />
      <Stack.Screen name="customer-signup" />
      <Stack.Screen name="supplier-signup" />
    </Stack>
  );
}
