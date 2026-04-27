import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LeadsScreen from '../screens/LeadsScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

export type MainTabsParamList = {
  Leads: undefined;
  Pipeline: undefined;
  Alerts: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

function tabLabel(focused: boolean, label: string) {
  return (
    <Text style={[styles.tabLbl, focused ? styles.tabOn : styles.tabOff]} numberOfLines={1}>
      {label}
    </Text>
  );
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            height: 60 + insets.bottom,
          },
        ],
        tabBarShowLabel: true,
        tabBarIcon: () => null,
        tabBarItemStyle: {
          paddingTop: 10,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: '#FF5C00',
        tabBarInactiveTintColor: '#333',
      }}
    >
      <Tab.Screen
        name="Leads"
        component={LeadsScreen}
        options={{
          tabBarLabel: ({ focused }) => tabLabel(focused, 'LEADS'),
        }}
      />
      <Tab.Screen
        name="Pipeline"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: ({ focused }) => tabLabel(focused, 'PIPELINE'),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: ({ focused }) => tabLabel(focused, 'ALERTES'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: ({ focused }) => tabLabel(focused, 'PROFIL'),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0D0D0D',
    borderTopColor: '#1A1A1A',
  },
  tabLbl: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  tabOn: { color: '#FF5C00' },
  tabOff: { color: '#333' },
});
