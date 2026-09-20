import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { colors } from "../theme/colors";
import HomeScreen from "../screens/HomeScreen";
import ShopScreen from "../screens/ShopScreen";
import PetsScreen from "../screens/PetsScreen";
import VetScreen from "../screens/VetScreen";
import CartScreen from "../screens/CartScreen";

export type RootTabParamList = {
  Home: undefined;
  Shop: undefined;
  Pets: undefined;
  "Web Vet": undefined;
  Cart: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, string> = {
  Home: "🏠",
  Shop: "🛍️",
  Pets: "🐾",
  "Web Vet": "🩺",
  Cart: "🛒",
};

export default function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border, height: 58, paddingBottom: 6, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{TAB_ICONS[route.name as keyof RootTabParamList]}</Text>,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Pets" component={PetsScreen} />
      <Tab.Screen name="Web Vet" component={VetScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
    </Tab.Navigator>
  );
}
