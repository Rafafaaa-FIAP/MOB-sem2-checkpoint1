import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: 'Interclasse Digital',
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#ED145B",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    />
  );
}