import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';
import { getClientIP, getLocationFromIP } from '@/lib/geolocation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shortCode, referrer, userAgent } = body;

    if (!shortCode) {
      return NextResponse.json(
        { success: false, error: 'Short code is required' },
        { status: 400 }
      );
    }

    // Find the link
    const link = dbOperations.getLinkByShortCode(shortCode);
    
    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found or expired' },
        { status: 404 }
      );
    }

    // Get client IP
    const ipAddress = getClientIP(request);
    
    // Get location data (async, but we don't want to delay the redirect)
    let locationData = null;
    try {
      locationData = await getLocationFromIP(ipAddress);
    } catch (error) {
      console.error('Error fetching location:', error);
      // Continue without location data
    }

    // Log the visit
    dbOperations.logVisit(
      link.id,
      ipAddress,
      userAgent || request.headers.get('user-agent') || 'Unknown',
      referrer,
      locationData || undefined
    );

    return NextResponse.json({
      success: true,
      destinationUrl: link.destinationUrl
    });

  } catch (error) {
    console.error('Error tracking visit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track visit' },
      { status: 500 }
    );
  }
}