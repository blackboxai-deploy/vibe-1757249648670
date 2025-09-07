import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import path from 'path';
import { Link, Visit } from '@/types/tracking';

// Initialize database
const dbPath = path.join(process.cwd(), 'tracking.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    shortCode TEXT UNIQUE NOT NULL,
    destinationUrl TEXT NOT NULL,
    alias TEXT,
    createdAt TEXT NOT NULL,
    expiresAt TEXT,
    isActive INTEGER DEFAULT 1,
    visitCount INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY,
    linkId TEXT NOT NULL,
    ipAddress TEXT NOT NULL,
    country TEXT,
    region TEXT,
    city TEXT,
    latitude REAL,
    longitude REAL,
    userAgent TEXT NOT NULL,
    referrer TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (linkId) REFERENCES links (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_links_shortCode ON links(shortCode);
  CREATE INDEX IF NOT EXISTS idx_visits_linkId ON visits(linkId);
  CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON visits(timestamp);
`);

// Prepared statements
const insertLinkStmt = db.prepare(`
  INSERT INTO links (id, shortCode, destinationUrl, alias, createdAt, expiresAt, isActive, visitCount)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const getLinkByShortCodeStmt = db.prepare(`
  SELECT * FROM links WHERE shortCode = ? AND isActive = 1
`);

const getAllLinksStmt = db.prepare(`
  SELECT * FROM links ORDER BY createdAt DESC
`);

const insertVisitStmt = db.prepare(`
  INSERT INTO visits (id, linkId, ipAddress, country, region, city, latitude, longitude, userAgent, referrer, timestamp)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const incrementVisitCountStmt = db.prepare(`
  UPDATE links SET visitCount = visitCount + 1 WHERE id = ?
`);

const getVisitsByLinkIdStmt = db.prepare(`
  SELECT * FROM visits WHERE linkId = ? ORDER BY timestamp DESC
`);

const deleteLinkStmt = db.prepare(`
  DELETE FROM links WHERE id = ?
`);

const updateLinkStmt = db.prepare(`
  UPDATE links SET destinationUrl = ?, alias = ?, expiresAt = ? WHERE id = ?
`);

// Database functions
export const dbOperations = {
  // Create a new tracking link
  createLink: (destinationUrl: string, alias?: string, expiresAt?: string): Link => {
    const id = nanoid();
    const shortCode = alias || nanoid(8);
    const createdAt = new Date().toISOString();
    
    const link: Link = {
      id,
      shortCode,
      destinationUrl,
      alias,
      createdAt,
      expiresAt,
      isActive: true,
      visitCount: 0
    };

    insertLinkStmt.run(id, shortCode, destinationUrl, alias, createdAt, expiresAt, 1, 0);
    return link;
  },

  // Get link by short code
  getLinkByShortCode: (shortCode: string): Link | null => {
    const result = getLinkByShortCodeStmt.get(shortCode) as any;
    if (!result) return null;

    // Check if link is expired
    if (result.expiresAt && new Date(result.expiresAt) < new Date()) {
      return null;
    }

    return {
      ...result,
      isActive: Boolean(result.isActive)
    };
  },

  // Get all links
  getAllLinks: (): Link[] => {
    const results = getAllLinksStmt.all() as any[];
    return results.map(result => ({
      ...result,
      isActive: Boolean(result.isActive)
    }));
  },

  // Log a visit
  logVisit: (
    linkId: string,
    ipAddress: string,
    userAgent: string,
    referrer?: string,
    locationData?: {
      country?: string;
      region?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
    }
  ): Visit => {
    const id = nanoid();
    const timestamp = new Date().toISOString();

    const visit: Visit = {
      id,
      linkId,
      ipAddress,
      country: locationData?.country,
      region: locationData?.region,
      city: locationData?.city,
      latitude: locationData?.latitude,
      longitude: locationData?.longitude,
      userAgent,
      referrer,
      timestamp
    };

    // Insert visit and increment counter in a transaction
    const transaction = db.transaction(() => {
      insertVisitStmt.run(
        id, linkId, ipAddress,
        locationData?.country, locationData?.region, locationData?.city,
        locationData?.latitude, locationData?.longitude,
        userAgent, referrer, timestamp
      );
      incrementVisitCountStmt.run(linkId);
    });

    transaction();
    return visit;
  },

  // Get visits for a link
  getVisitsByLinkId: (linkId: string): Visit[] => {
    return getVisitsByLinkIdStmt.all(linkId) as Visit[];
  },

  // Delete a link
  deleteLink: (id: string): boolean => {
    const result = deleteLinkStmt.run(id);
    return result.changes > 0;
  },

  // Update a link
  updateLink: (id: string, destinationUrl: string, alias?: string, expiresAt?: string): boolean => {
    const result = updateLinkStmt.run(destinationUrl, alias, expiresAt, id);
    return result.changes > 0;
  }
};

// Close database connection on process exit
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));