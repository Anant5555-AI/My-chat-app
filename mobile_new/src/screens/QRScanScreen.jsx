import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/ApiService';
import { colors, layout, shadows } from '../utils/theme';

export const QRScanScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { loginWithSession, keys } = useAuth();
    const hasScannedRef = useRef(false);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    const handleQrLogin = async (qrToken) => {
        if (!keys) {
            Alert.alert('Error', 'Encryption keys are not ready yet. Please try again.');
            return;
        }

        try {
            setIsLoggingIn(true);
            const result = await ApiService.loginWithQrToken(qrToken, keys.publicKey);
            loginWithSession(result);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Chat' }],
            });
        } catch (error) {
            console.error('QR login failed', error);
            Alert.alert('Login failed', error.message || 'Invalid or expired QR code. Please try again.');
            hasScannedRef.current = false; // allow retry
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleBarcodeScanned = ({ data }) => {
        if (data && !hasScannedRef.current && !isLoggingIn) {
            hasScannedRef.current = true;
            handleQrLogin(data);
        }
    };

    if (!permission) {
        // Camera permissions are still loading
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>No access to camera</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={isLoggingIn ? undefined : handleBarcodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />
            <View style={styles.overlay}>
                <Text style={styles.overlayText}>Scan QR Code to Login</Text>
                {isLoggingIn && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#fff" />
                        <Text style={styles.loadingText}>Logging you in...</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isLoggingIn}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: colors.textInverted,
        fontSize: 16,
        marginBottom: layout.spacing.m,
    },
    overlay: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    overlayText: {
        color: colors.textInverted,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: layout.spacing.l,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layout.spacing.m,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: layout.spacing.s,
        borderRadius: layout.borderRadius.m,
    },
    loadingText: {
        color: colors.textInverted,
        marginLeft: layout.spacing.s,
        fontSize: 14,
        fontWeight: '500',
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: layout.spacing.l,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: layout.borderRadius.l,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    cancelText: {
        color: colors.textInverted,
        fontSize: 16,
        fontWeight: '600',
    },
    permissionButton: {
        marginTop: layout.spacing.l,
        paddingVertical: 12,
        paddingHorizontal: layout.spacing.l,
        backgroundColor: colors.primary,
        borderRadius: layout.borderRadius.m,
        ...shadows.medium,
    },
    permissionButtonText: {
        color: colors.textInverted,
        fontSize: 16,
        fontWeight: '700',
    },
});
