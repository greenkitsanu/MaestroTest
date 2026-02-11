import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#6C63FF" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: "#F5F5F5" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Login", headerShown: false }}
        />
        <Stack.Screen
          name="dashboard"
          options={{ title: "Dashboard", headerBackVisible: false }}
        />
        <Stack.Screen
          name="detail/[id]"
          options={{ title: "Detail" }}
        />
      </Stack>
    </>
  );
}
