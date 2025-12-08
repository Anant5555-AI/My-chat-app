import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Share, Modal, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, layout, shadows } from '../utils/theme';
import { database } from '../database';
import SocketService from '../services/SocketService';
import { EncryptionService } from '../services/EncryptionService';
import { ApiService } from '../services/ApiService';

export const ChatScreen = () => {
    const { user, accessToken, sharedSecret } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [backupModalVisible, setBackupModalVisible] = useState(false);
    const [importText, setImportText] = useState('');

    useEffect(() => {
        const loadMessages = async () => {
            try {
                // 1. Fetch from API
                const history = await ApiService.fetchMessages(accessToken);

                // 2. Sync local DB with API
                await database.write(async () => {
                    const messagesCollection = database.get('messages');
                    const existing = await messagesCollection.query().fetch();
                    const existingMap = new Map(existing.map(m => [m.id, m]));
                    const historyIds = new Set(history.map(m => m.id));

                    // A. Remove messages that are in local DB (synced) but NOT in API history (deleted remotely)
                    // Only if we have some history returned (to avoid wiping if offline/API fails empty)
                    // But fetchMessages throws if fail, so history is valid array.
                    for (const msg of existing) {
                        if (msg.isSynced && !historyIds.has(msg.id)) {
                            await messagesCollection.delete(msg.id);
                        }
                    }

                    // B. Add new messages from API
                    for (const msg of history) {
                        if (existingMap.has(msg.id)) continue;

                        // Decrypt if it's encrypted and we have the key
                        let content = msg.content;
                        if (msg.ciphertext && msg.iv && msg.authTag && sharedSecret) {
                            try {
                                const secretBuffer = Buffer.from(sharedSecret, 'hex');
                                content = EncryptionService.decrypt(
                                    msg.ciphertext,
                                    msg.iv,
                                    msg.authTag,
                                    secretBuffer
                                );
                            } catch (e) {
                                console.log('Failed to decrypt message', msg.id);
                                content = "🔒 Decryption failed";
                            }
                        }

                        await messagesCollection.create((message) => {
                            message.id = msg.id;
                            message.content = content;
                            message.senderId = msg.senderId;
                            message.createdAt = new Date(msg.createdAt);
                            message.isSynced = true;
                        });
                    }
                });

                // 3. Load from local DB
                const messagesCollection = database.get('messages');
                const allMessages = await messagesCollection.query().fetch();

                const formattedMessages = allMessages
                    .map(msg => ({
                        id: msg.id,
                        content: msg.content,
                        senderId: msg.senderId,
                        createdAt: msg.createdAt,
                    }))
                    .filter(m => m.id) // Ensure ID exists
                    .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i) // Deduplicate
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                setMessages(formattedMessages);
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        };

        if (sharedSecret) {
            loadMessages();
        }
    }, [sharedSecret]);

    useEffect(() => {
        if (!accessToken) return;

        const socket = SocketService.connect(accessToken);

        SocketService.on('connect', () => {
            setIsSocketConnected(true);
        });

        SocketService.on('disconnect', () => {
            setIsSocketConnected(false);
        });

        SocketService.on('message', async (payload) => {
            console.log('[Mobile Chat] Received socket message:', payload);
            try {
                // Check for duplicates
                const messagesCollection = database.get('messages');
                const existing = await messagesCollection.query().fetch();
                if (existing.some(m => m.id === payload.id)) {
                    console.log('[Mobile Chat] Duplicate message ignored:', payload.id);
                    return;
                }

                let content = payload.content;
                if (sharedSecret && payload.ciphertext && payload.iv && payload.authTag) {
                    console.log('[Mobile Chat] Decrypting message...');
                    const secretBuffer = Buffer.from(sharedSecret, 'hex');
                    content = EncryptionService.decrypt(
                        payload.ciphertext,
                        payload.iv,
                        payload.authTag,
                        secretBuffer,
                    );
                    console.log('[Mobile Chat] Decrypted content:', content);
                } else {
                    console.log('[Mobile Chat] Using plaintext content (No encryption/secret or missing fields)');
                }

                await database.write(async () => {
                    await messagesCollection.create((message) => {
                        message.id = payload.id;
                        message.content = content;
                        message.senderId = payload.senderId;
                        message.createdAt = new Date(payload.createdAt);
                        message.isSynced = true;
                    });
                });
                console.log('[Mobile Chat] Message saved to local DB');

                const allMessages = await messagesCollection.query().fetch();
                const formattedMessages = allMessages
                    .map(msg => ({
                        id: msg.id,
                        content: msg.content,
                        senderId: msg.senderId,
                        createdAt: msg.createdAt,
                    }))
                    .filter(m => m.id)
                    .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                setMessages(formattedMessages);
            } catch (e) {
                console.error('Error handling incoming socket message', e);
            }
        });

        SocketService.on('deleteMessage', async (id) => {
            await database.write(async () => {
                const messagesCollection = database.get('messages');
                await messagesCollection.delete(id);
            });
            setMessages(prev => prev.filter(m => m.id !== id));
        });

        return () => {
            SocketService.disconnect();
        };
    }, [accessToken, sharedSecret]);

    const reloadMessages = async () => {
        try {
            const messagesCollection = database.get('messages');
            const allMessages = await messagesCollection.query().fetch();

            const formattedMessages = allMessages
                .map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    senderId: msg.senderId,
                    createdAt: msg.createdAt,
                }))
                .filter(m => m.id)
                .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            setMessages(formattedMessages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleDeleteMessage = (message) => {
        if (!message || !message.id) {
            console.error("Attempted to delete invalid message", message);
            return;
        }

        Alert.alert(
            "Delete Message",
            "Are you sure you want to delete this message?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // 1. Delete locally
                            await database.write(async () => {
                                const messagesCollection = database.get('messages');
                                await messagesCollection.delete(message.id);
                            });
                            setMessages(prev => prev.filter(m => m.id !== message.id));

                            // 2. Call API
                            await ApiService.deleteMessage(message.id, accessToken);

                            // 3. Emit socket event
                            if (SocketService && isSocketConnected) {
                                SocketService.emit('deleteMessage', message.id);
                            }
                        } catch (e) {
                            // If API returns 404 (Not Found), it means message is already gone or wasn't synced.
                            // We can consider this a success for the user.
                            if (e.status === 404) {
                                console.log("Message not found on server, assuming deleted.");
                            } else {
                                console.error("Failed to delete", e);
                                Alert.alert("Error", "Failed to delete message");
                            }
                        }
                    }
                }
            ]
        );
    };

    const sendMessage = async () => {
        const trimmed = inputText.trim();
        if (!trimmed) return;

        const createdAt = new Date();
        const messageId = Math.random().toString(36).substring(2, 15);
        let ciphertextPayload = null;

        try {
            if (sharedSecret) {
                const secretBuffer = Buffer.from(sharedSecret, 'hex');
                const encrypted = EncryptionService.encrypt(trimmed, secretBuffer);
                ciphertextPayload = encrypted;
            }

            await database.write(async () => {
                const messagesCollection = database.get('messages');
                await messagesCollection.create((message) => {
                    message.id = messageId;
                    message.content = trimmed;
                    message.senderId = user?.id || 'me';
                    message.createdAt = createdAt;
                    message.isSynced = false;
                });
            });

            setInputText('');
            reloadMessages();

            if (SocketService && isSocketConnected) {
                SocketService.emit('message', {
                    id: messageId,
                    content: trimmed,
                    senderId: user?.id || 'me',
                    createdAt: createdAt.toISOString(),
                    ...(ciphertextPayload
                        ? {
                            ciphertext: ciphertextPayload.encrypted,
                            iv: ciphertextPayload.iv,
                            authTag: ciphertextPayload.authTag,
                        }
                        : {}),
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const renderMessage = ({ item }) => {
        const isMine = item.senderId === (user?.id || 'me');

        return (
            <TouchableOpacity
                onLongPress={() => isMine && handleDeleteMessage(item)}
                delayLongPress={500}
                activeOpacity={0.8}
            >
                <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.theirMessage]}>
                    <Text style={[styles.messageText, isMine && styles.myMessageText]}>
                        {item.content || "<Empty Message>"}
                    </Text>
                    <Text style={[styles.timeText, isMine && styles.myTimeText]}>
                        {new Date(item.createdAt).toLocaleTimeString()}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                inverted={false}
            />

            <View style={styles.statusBar}>
                <Text style={styles.statusText}>
                    {isSocketConnected ? 'Online' : 'Offline - messages will sync when back online'}
                </Text>
                <View style={styles.backupActions}>
                    <TouchableOpacity onPress={async () => {
                        try {
                            const messagesCollection = database.get('messages');
                            const allMessages = await messagesCollection.query().fetch();
                            const exportData = allMessages
                                .map(msg => ({
                                    content: msg.content,
                                    senderId: msg.senderId,
                                    createdAt: msg.createdAt,
                                }))
                                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                            const json = JSON.stringify(exportData, null, 2);
                            await Share.share({ message: json });
                        } catch (e) {
                            console.error('Failed to export backup', e);
                        }
                    }}>
                        <Text style={styles.backupActionText}>Export</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setBackupModalVisible(true)}>
                        <Text style={styles.backupActionText}>Import</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={backupModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setBackupModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Import Backup</Text>
                        <Text style={styles.modalSubtitle}>
                            Paste your backup JSON below to restore messages. Existing messages will remain.
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            value={importText}
                            onChangeText={setImportText}
                            multiline
                            placeholder="Paste backup JSON here"
                            placeholderTextColor={colors.textSecondary}
                        />
                        <View style={styles.modalActions}>
                            <Pressable onPress={() => setBackupModalVisible(false)} style={styles.modalButton}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={async () => {
                                    try {
                                        const parsed = JSON.parse(importText || '[]');
                                        if (!Array.isArray(parsed)) {
                                            throw new Error('Backup data must be an array');
                                        }
                                        await database.write(async () => {
                                            const messagesCollection = database.get('messages');
                                            for (const m of parsed) {
                                                await messagesCollection.create((message) => {
                                                    message.content = m.content || '';
                                                    message.senderId = m.senderId || 'unknown';
                                                    message.createdAt = m.createdAt ? new Date(m.createdAt) : new Date();
                                                    message.isSynced = false;
                                                });
                                            }
                                        });
                                        setImportText('');
                                        setBackupModalVisible(false);
                                        reloadMessages();
                                    } catch (e) {
                                        console.error('Failed to import backup', e);
                                    }
                                }}
                                style={[styles.modalButton, styles.modalPrimaryButton]}
                            >
                                <Text style={[styles.modalButtonText, styles.modalPrimaryButtonText]}>Import</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    messagesList: {
        paddingHorizontal: layout.spacing.m,
        paddingTop: layout.spacing.m,
        paddingBottom: layout.spacing.xl,
    },
    statusBar: {
        paddingHorizontal: layout.spacing.m,
        paddingVertical: layout.spacing.s,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...shadows.small,
        zIndex: 1,
    },
    statusText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: layout.spacing.xs,
        textAlign: 'center',
    },
    backupActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: layout.spacing.m,
        marginTop: layout.spacing.xs,
    },
    backupActionText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
    },
    messageContainer: {
        maxWidth: '80%',
        marginVertical: 6,
        padding: 12,
        borderRadius: 20,
        ...shadows.small,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surface,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        color: colors.textPrimary,
        lineHeight: 22,
    },
    myMessageText: {
        color: colors.textInverted,
    },
    timeText: {
        fontSize: 10,
        color: colors.textSecondary,
        marginTop: 4,
        alignSelf: 'flex-end',
        opacity: 0.8,
    },
    myTimeText: {
        color: colors.textInverted,
        opacity: 0.7,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: layout.spacing.s,
        margin: layout.spacing.m,
        backgroundColor: colors.surface,
        borderRadius: 30,
        ...shadows.medium,
        marginBottom: Platform.OS === 'ios' ? layout.spacing.l : layout.spacing.m,
    },
    input: {
        flex: 1,
        backgroundColor: colors.surfaceAlt,
        borderRadius: 20,
        paddingHorizontal: layout.spacing.m,
        paddingVertical: 10,
        marginRight: layout.spacing.s,
        maxHeight: 100,
        fontSize: 16,
        color: colors.textPrimary,
    },
    sendButton: {
        backgroundColor: colors.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.small,
    },
    sendButtonText: {
        color: colors.textInverted,
        fontWeight: '700',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: colors.surface,
        borderRadius: layout.borderRadius.l,
        padding: layout.spacing.l,
        ...shadows.large,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: layout.spacing.s,
    },
    modalSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: layout.spacing.m,
        lineHeight: 20,
    },
    modalInput: {
        minHeight: 120,
        maxHeight: 260,
        borderRadius: layout.borderRadius.m,
        borderWidth: 1,
        borderColor: colors.border,
        padding: layout.spacing.m,
        textAlignVertical: 'top',
        marginBottom: layout.spacing.l,
        backgroundColor: colors.surfaceAlt,
        color: colors.textPrimary,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: layout.spacing.m,
    },
    modalButton: {
        paddingHorizontal: layout.spacing.l,
        paddingVertical: 10,
        borderRadius: layout.borderRadius.m,
        backgroundColor: colors.surfaceAlt,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    modalPrimaryButton: {
        backgroundColor: colors.primary,
    },
    modalPrimaryButtonText: {
        color: colors.textInverted,
    },
});
