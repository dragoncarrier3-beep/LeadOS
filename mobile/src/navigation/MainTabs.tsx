import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarIcon: () => null,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tab.Screen
        name="Leads"
        component={LeadsScreen}
        options={{
          tabBarLabel: ({ focused }) => tabLabel(focused, 'Leads'),
        }}
      />
      <Tab.Screen
        name="Pipeline"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: ({ focused }) => tabLabel(focused, 'Pipeline'),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: ({ focused }) => tabLabel(focused, 'Alerts'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: ({ focused }) => tabLabel(focused, 'Profile'),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B',
  },
  tabLbl: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  tabOn: { color: '#2563EB' },
  tabOff: { color: '#64748B' },
});
