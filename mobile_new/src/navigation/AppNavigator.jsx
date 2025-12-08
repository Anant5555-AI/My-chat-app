import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { QRScanScreen } from '../screens/QRScanScreen';

import { colors } from '../utils/theme';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.primary,
                    },
                    headerTintColor: colors.textInverted,
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="QRScan" component={QRScanScreen} options={{ title: 'Scan QR Code' }} />
                <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Messages' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
