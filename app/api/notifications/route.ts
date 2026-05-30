import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notificationService';
import { verifyAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';

/**
 * GET /api/notifications
 * Get user's notifications
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    // Get notifications
    const { notifications, total } = await NotificationService.getUserNotifications(
      auth.userId,
      limit,
      skip
    );

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        total,
        limit,
        skip,
      },
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a notification (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, type, title, body: notificationBody, data } = body;

    if (!userId || !type || !title || !notificationBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = await NotificationService.createNotification(
      userId,
      type,
      title,
      notificationBody,
      data || {}
    );

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete a notification
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID required' },
        { status: 400 }
      );
    }

    // Delete notification
    const success = await NotificationService.deleteNotification(notificationId);

    if (!success) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
