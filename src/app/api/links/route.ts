import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';
import { isValidUrl } from '@/lib/geolocation';
import { CreateLinkRequest } from '@/types/tracking';

// GET - Fetch all links
export async function GET() {
  try {
    const links = dbOperations.getAllLinks();
    return NextResponse.json({ success: true, links });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST - Create new tracking link
export async function POST(request: NextRequest) {
  try {
    const body: CreateLinkRequest = await request.json();
    const { destinationUrl, alias, expiresAt } = body;

    // Validation
    if (!destinationUrl) {
      return NextResponse.json(
        { success: false, error: 'Destination URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(destinationUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid destination URL format' },
        { status: 400 }
      );
    }

    // Validate alias if provided
    if (alias) {
      if (alias.length < 3 || alias.length > 20) {
        return NextResponse.json(
          { success: false, error: 'Alias must be between 3-20 characters' },
          { status: 400 }
        );
      }
      
      // Check if alias already exists
      const existingLink = dbOperations.getLinkByShortCode(alias);
      if (existingLink) {
        return NextResponse.json(
          { success: false, error: 'Alias already exists' },
          { status: 400 }
        );
      }
    }

    // Validate expiration date if provided
    if (expiresAt) {
      const expireDate = new Date(expiresAt);
      if (expireDate <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'Expiration date must be in the future' },
          { status: 400 }
        );
      }
    }

    // Create the link
    const link = dbOperations.createLink(destinationUrl, alias, expiresAt);
    
    return NextResponse.json({ 
      success: true, 
      link,
      trackingUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/t/${link.shortCode}`
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create link' },
      { status: 500 }
    );
  }
}