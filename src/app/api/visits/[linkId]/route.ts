import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';
import { LinkStats } from '@/types/tracking';

// GET - Get visits and statistics for a specific link
export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;

    if (!linkId) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      );
    }

    const visits = dbOperations.getVisitsByLinkId(linkId);
    
    // Calculate statistics
    const totalVisits = visits.length;
    const uniqueVisitors = new Set(visits.map(v => v.ipAddress)).size;
    
    // Group visits by country
    const countries: { [key: string]: number } = {};
    visits.forEach(visit => {
      const country = visit.country || 'Unknown';
      countries[country] = (countries[country] || 0) + 1;
    });

    // Group visits by date for daily statistics
    const dailyVisits: { [key: string]: number } = {};
    visits.forEach(visit => {
      const date = new Date(visit.timestamp).toISOString().split('T')[0];
      dailyVisits[date] = (dailyVisits[date] || 0) + 1;
    });

    // Convert to array format for charts
    const dailyVisitsArray = Object.entries(dailyVisits).map(([date, visits]) => ({
      date,
      visits
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Get recent visits (last 10)
    const recentVisits = visits.slice(0, 10);

    const stats: LinkStats = {
      totalVisits,
      uniqueVisitors,
      countries,
      dailyVisits: dailyVisitsArray,
      recentVisits
    };

    return NextResponse.json({ 
      success: true, 
      visits, 
      stats 
    });

  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch visits' },
      { status: 500 }
    );
  }
}