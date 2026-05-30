import { NextRequest, NextResponse } from 'next/server';
import UserPreference from '@/lib/models/UserPreference';
import { verifyAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get preferences
    let preferences = await UserPreference.findOne({
      userId: new mongoose.Types.ObjectId(auth.userId),
    });

    // Create default preferences if not found
    if (!preferences) {
      preferences = new UserPreference({
        userId: new mongoose.Types.ObjectId(auth.userId),
      });
      await preferences.save();
    }

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Update preferences
    const preferences = await UserPreference.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(auth.userId) },
      body,
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
