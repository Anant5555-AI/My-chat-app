import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EncryptionService } from '../services/EncryptionService';
import { ApiService } from '../services/ApiService';
import SocketService from '../services/SocketService';

const STORAGE_KEY = '@chatapp_auth_state_v1';

const AuthContext = createContext({
    user: null,
    keys: null,
    accessToken: null,
    refreshToken: null,
    sharedSecret: null,
    loginWithSession: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [keys, setKeys] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [sharedSecret, setSharedSecret] = useState(null);
    const refreshIntervalRef = useRef(null);

    // Load persisted auth state on mount
    useEffect(() => {
        const loadAuthState = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setUser(parsed.user || null);
                    setAccessToken(parsed.accessToken || null);
                    setRefreshToken(parsed.refreshToken || null);
                    setSharedSecret(parsed.sharedSecret || null);
                    setKeys(parsed.keys || EncryptionService.generateKeyPair());
                } else {
                    // Generate new keys if none stored yet
                    const newKeys = EncryptionService.generateKeyPair();
                    setKeys(newKeys);
                }
            } catch (e) {
                console.error('Failed to load auth state', e);
                const newKeys = EncryptionService.generateKeyPair();
                setKeys(newKeys);
            }
        };

        loadAuthState();
    }, []);

    // Persist auth state whenever it changes
    useEffect(() => {
        const persist = async () => {
            try {
                const snapshot = JSON.stringify({
                    user,
                    keys,
                    accessToken,
                    refreshToken,
                    sharedSecret,
                });
                await AsyncStorage.setItem(STORAGE_KEY, snapshot);
            } catch (e) {
                console.error('Failed to persist auth state', e);
            }
        };

        if (keys) {
            persist();
        }
    }, [user, keys, accessToken, refreshToken, sharedSecret]);

    // Set up token refresh every 15 minutes
    useEffect(() => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
        }

        if (!refreshToken) {
            return;
        }

        refreshIntervalRef.current = setInterval(async () => {
            try {
                const result = await ApiService.refreshSession(refreshToken);
                setAccessToken(result.accessToken);
                setRefreshToken(result.refreshToken ?? refreshToken);
            } catch (error) {
                console.error('Failed to refresh session, logging out', error);
                handleLogout();
            }
        }, 15 * 60 * 1000); // 15 minutes

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshToken]);

    const loginWithSession = ({ user: userData, accessToken: at, refreshToken: rt, otherPublicKey }) => {
        setUser(userData);
        setAccessToken(at);
        setRefreshToken(rt);

        // Derive shared secret between this device and the web device
        try {
            if (keys && otherPublicKey) {
                const secretBuffer = EncryptionService.computeSharedSecret(keys.privateKey, otherPublicKey);
                // Store as hex string for easy persistence
                setSharedSecret(secretBuffer.toString('hex'));
            }
        } catch (e) {
            console.error('Failed to compute shared secret', e);
        }
    };

    const handleLogout = async () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        setSharedSecret(null);
        SocketService.disconnect();
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear auth storage on logout', e);
        }
    };

    const value = {
        user,
        keys,
        accessToken,
        refreshToken,
        sharedSecret,
        loginWithSession,
        logout: handleLogout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
