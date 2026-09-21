import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { useCart } from "../context/CartContext";
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

function TabIcon({ name }: { name: keyof RootTabParamList }) {
  const { count } = useCart();
  return (
    <View>
      <Text style={{ fontSize: 18 }}>{TAB_ICONS[name]}</Text>
      {name === "Cart" && count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

export default function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border, height: 58, paddingBottom: 6, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: () => <TabIcon name={route.name as keyof RootTabParamList} />,
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

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: "#D64545",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: "700" },
});
