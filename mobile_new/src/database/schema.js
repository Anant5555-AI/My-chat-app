import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const mySchema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'users',
            columns: [
                { name: 'username', type: 'string' },
                { name: 'public_key', type: 'string' },
                { name: 'avatar_url', type: 'string', isOptional: true },
            ],
        }),
        tableSchema({
            name: 'messages',
            columns: [
                { name: 'content', type: 'string' },
                { name: 'sender_id', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'is_synced', type: 'boolean' },
            ],
        }),
    ],
});
