'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TrackingRedirect() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState('Redirecting...');
  const shortCode = params.shortCode as string;

  useEffect(() => {
    async function handleRedirect() {
      try {
        // Track the visit and get redirect URL
        const response = await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            shortCode,
            referrer: document.referrer,
            userAgent: navigator.userAgent
          }),
        });

        const data = await response.json();

        if (data.success && data.destinationUrl) {
          // Redirect to the destination URL
          window.location.href = data.destinationUrl;
        } else {
          setStatus('Link not found or expired');
          // Redirect to home page after 3 seconds
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (error) {
        console.error('Tracking error:', error);
        setStatus('Error occurred while redirecting');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    }

    if (shortCode) {
      handleRedirect();
    }
  }, [shortCode, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {status}
          </h2>
          <p className="text-gray-600">
            {status === 'Redirecting...' 
              ? 'Please wait while we redirect you...'
              : 'You will be redirected to the homepage shortly.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}