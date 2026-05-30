import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notificationService';
import { verifyAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get unread count
    const count = await NotificationService.getUnreadCount(auth.userId);

    return NextResponse.json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return NextResponse.json(
      { error: 'Failed to get unread count' },
      { status: 500 }
    );
  }
}
