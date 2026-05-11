import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';

import {
    HomeScreen,
    TransactionsScreen,
    CategoriesScreen,
    SettingsScreen,
    OpenFinanceScreen,
} from './src/screens';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { TransactionsProvider } from './src/context/TransactionsContext';

const Tab = createBottomTabNavigator();

function AppNavigator() {
    const { theme, isDark } = useTheme();

    // ⭐ Fallback seguro
    const safeTheme = theme || {
        primary: '#00D4FF',
        backgroundCard: '#141414',
        textMuted: '#666666',
    };

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
                <Tab.Navigator
                    screenOptions={{
                        headerShown: false,
                        tabBarStyle: {
                            backgroundColor: safeTheme.backgroundCard,
                            borderTopWidth: 0,
                            elevation: 0,
                            height: 60,
                            paddingBottom: 8,
                            paddingTop: 8,
                        },
                        tabBarActiveTintColor: safeTheme.primary,
                        tabBarInactiveTintColor: safeTheme.textMuted,
                        tabBarLabelStyle: {
                            fontSize: 12,
                            fontWeight: '600',
                        },
                    }}
                >
                    <Tab.Screen
                        name="Dashboard"
                        component={HomeScreen}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <FontAwesome5 name="home" size={size} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Transações"
                        component={TransactionsScreen}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <FontAwesome5 name="exchange-alt" size={size} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Categorias"
                        component={CategoriesScreen}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <FontAwesome5 name="tags" size={size} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Open Finance"
                        component={OpenFinanceScreen}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <FontAwesome5 name="university" size={size} color={color} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Configurações"
                        component={SettingsScreen}
                        options={{
                            tabBarIcon: ({ color, size }) => (
                                <FontAwesome5 name="cog" size={size} color={color} />
                            ),
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </>
    );
}

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <TransactionsProvider>
                        <AppNavigator />
                    </TransactionsProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
