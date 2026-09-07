import { supabaseAuthListUsers, supabaseRestQuery } from '@/lib/supabase-rest';
import { resendRestBatchSendEmails } from '@/lib/resend-rest';

export interface BroadcastEmailInput {
  subject: string;
  html_content: string;
}

export class BroadcastService {
  /**
   * Executes mass email broadcast to verified users via raw Resend REST API and logs audit log in DB.
   */
  static async sendAdminBroadcast(adminUserId: string, input: BroadcastEmailInput) {
    if (!input.subject || !input.html_content) {
      throw new Error('Subject and HTML content are required for broadcast emails.');
    }

    // Fetch registered users via Supabase Auth Admin REST API
    const usersData = await supabaseAuthListUsers();
    const usersList: Array<{ email?: string; email_confirmed_at?: string; app_metadata?: { email_verified?: boolean } }> = usersData.users || usersData;

    const recipientEmails = usersList
      .filter((u) => u.email && (u.email_confirmed_at !== null || u.app_metadata?.email_verified === true))
      .map((u) => u.email as string);

    if (recipientEmails.length === 0) {
      return {
        success: true,
        recipients_count: 0,
        message: 'No verified email addresses found to broadcast.',
      };
    }

    // Batch send emails via Resend Batch REST API
    const batchPayloads = recipientEmails.map((email) => ({
      to: email,
      subject: input.subject,
      html: input.html_content,
    }));

    await resendRestBatchSendEmails(batchPayloads);

    // Insert audit record into broadcast_emails table via PostgREST
    const insertedLog = await supabaseRestQuery<Array<{ id: string; sent_at: string }>>({
      table: 'broadcast_emails',
      method: 'POST',
      body: {
        subject: input.subject,
        body: input.html_content,
        sent_by: adminUserId,
      },
      useServiceRole: true,
    });

    const logRecord = insertedLog && insertedLog.length > 0 ? insertedLog[0] : null;

    return {
      success: true,
      recipients_count: recipientEmails.length,
      broadcast_id: logRecord?.id,
      sent_at: logRecord?.sent_at || new Date().toISOString(),
      message: `Mass broadcast successfully dispatched to ${recipientEmails.length} verified users.`,
    };
  }
}
