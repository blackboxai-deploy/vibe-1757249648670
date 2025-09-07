import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

// DELETE - Delete a tracking link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      );
    }

    const success = dbOperations.deleteLink(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}

// PUT - Update a tracking link
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { destinationUrl, alias, expiresAt } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      );
    }

    if (!destinationUrl) {
      return NextResponse.json(
        { success: false, error: 'Destination URL is required' },
        { status: 400 }
      );
    }

    const success = dbOperations.updateLink(id, destinationUrl, alias, expiresAt);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update link' },
      { status: 500 }
    );
  }
}