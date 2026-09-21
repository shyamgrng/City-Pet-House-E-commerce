import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import RootTabs from "./src/navigation/RootTabs";
import WhatsAppButton from "./src/components/WhatsAppButton";

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootTabs />
        <WhatsAppButton />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
