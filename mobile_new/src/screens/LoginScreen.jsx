import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, layout, shadows } from '../utils/theme';

export const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { loginWithSession } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        // For this assignment, primary mobile login is via QR.
        // Email/password login here is kept as a no-op stub or can be wired to backend if desired.
        Alert.alert(
            'Use QR Login',
            'Please log in on the web app first and then use "Scan QR Code" to log in on mobile.'
        );
        // Example if you later add a real API:
        // const result = await ApiService.loginWithEmailPassword(email, password);
        // loginWithSession(result);
        // navigation.replace('Chat');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>💬</Text>
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue chatting</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="user@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.qrButton}
                        onPress={() => navigation.navigate('QRScan')}
                    >
                        <Text style={styles.qrButtonText}>📷 Scan QR Code</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: layout.spacing.l,
    },
    header: {
        alignItems: 'center',
        marginBottom: layout.spacing.xl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layout.spacing.m,
        ...shadows.medium,
    },
    logoText: {
        fontSize: 40,
        color: colors.textInverted,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: layout.spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: layout.borderRadius.l,
        padding: layout.spacing.l,
        ...shadows.medium,
    },
    inputContainer: {
        marginBottom: layout.spacing.m,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: layout.spacing.xs,
        marginLeft: layout.spacing.xs,
    },
    input: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: layout.borderRadius.m,
        padding: layout.spacing.m,
        fontSize: 16,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    loginButton: {
        backgroundColor: colors.primary,
        borderRadius: layout.borderRadius.m,
        padding: layout.spacing.m,
        alignItems: 'center',
        marginTop: layout.spacing.s,
        ...shadows.small,
    },
    loginButtonText: {
        color: colors.textInverted,
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: layout.spacing.l,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        marginHorizontal: layout.spacing.m,
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    qrButton: {
        backgroundColor: colors.surface,
        borderRadius: layout.borderRadius.m,
        padding: layout.spacing.m,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    qrButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '700',
    },
});
