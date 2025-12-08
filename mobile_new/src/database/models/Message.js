import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class Message extends Model {
    static table = 'messages';

    @text('content') content;
    @text('sender_id') senderId;
    @date('created_at') createdAt;
    @field('is_synced') isSynced;
}
