'use client';

import { useState } from 'react';
import { Link } from '@/types/tracking';

interface LinkCardProps {
  link: Link;
  onDelete: () => void;
}

export default function LinkCard({ link, onDelete }: LinkCardProps) {
  const [copied, setCopied] = useState(false);
  
  const trackingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/t/${link.shortCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              isExpired 
                ? 'bg-gray-400' 
                : link.isActive 
                  ? 'bg-green-400' 
                  : 'bg-red-400'
            }`}></div>
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {link.alias || link.shortCode}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {link.visitCount || 0} visits
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Tracking URL:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded text-blue-600 font-mono">
                {trackingUrl}
              </code>
              <button
                onClick={copyToClipboard}
                className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Destination:</span>
              <a
                href={link.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 truncate max-w-md"
              >
                {link.destinationUrl}
              </a>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Created: {formatDate(link.createdAt)}</span>
              {link.expiresAt && (
                <span className={isExpired ? 'text-red-600' : ''}>
                  Expires: {formatDate(link.expiresAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <a
            href={`/analytics/${link.id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </a>

          <button
            onClick={onDelete}
            className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}