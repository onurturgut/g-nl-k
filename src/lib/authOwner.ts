import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

export function isClerkConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

export async function getOwnerId(request?: NextRequest) {
  if (isClerkConfigured()) {
    try {
      const session = await auth();
      if (session.userId) return session.userId;
    } catch {
      // Fall through to local owner id when Clerk is not available in local setup.
    }
  }

  return request?.headers.get('x-owner-id') || process.env.DEFAULT_OWNER_ID || 'local-user';
}
