import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notificationService';
import { verifyAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';

/**
 * POST /api/notifications/mark-read
 * Mark notification as read
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID required' },
        { status: 400 }
      );
    }

    // Mark as read
    const notification = await NotificationService.markAsRead(notificationId);

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
