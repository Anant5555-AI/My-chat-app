import AsyncStorage from '@react-native-async-storage/async-storage';
import { EncryptionService } from '../services/EncryptionService';

/**
 * Mock Database to replace WatermelonDB for Expo Go compatibility.
 * This allows the app to run without native dependencies.
 * Data is persisted using AsyncStorage.
 */

class MockCollection {
    constructor(name) {
        this.name = name;
    }

    async _getAll() {
        try {
            const data = await AsyncStorage.getItem(`@db_${this.name}`);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`Failed to load ${this.name}`, e);
            return [];
        }
    }

    async _saveAll(items) {
        try {
            await AsyncStorage.setItem(`@db_${this.name}`, JSON.stringify(items));
        } catch (e) {
            console.error(`Failed to save ${this.name}`, e);
        }
    }

    query() {
        return {
            fetch: async () => {
                return await this._getAll();
            }
        };
    }

    async create(updater) {
        const items = await this._getAll();
        const newItem = {
            id: EncryptionService.generateSymmetricKey().slice(0, 16), // Random ID
            _raw: {}, // Mock internal fields if needed
        };

        // Apply updates
        updater(newItem);

        // Check if ID already exists
        if (items.some(item => item.id === newItem.id)) {
            // Already exists, don't add duplicate
            return newItem;
        }

        items.push(newItem);
        await this._saveAll(items);
        return newItem;
    }

    async delete(id) {
        const items = await this._getAll();
        const filtered = items.filter(item => item.id !== id);
        await this._saveAll(filtered);
    }
}

class MockDatabase {
    constructor() {
        this.collections = {};
    }

    get(collectionName) {
        if (!this.collections[collectionName]) {
            this.collections[collectionName] = new MockCollection(collectionName);
        }
        return this.collections[collectionName];
    }

    async write(action) {
        // Just execute the action immediately
        await action();
    }
}

export const database = new MockDatabase();
