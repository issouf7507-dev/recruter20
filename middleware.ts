import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory store — works for single-server deployments.
// For multi-server production, replace with Upstash Redis (@upstash/ratelimit).
const store = new Map<string, { count: number; resetTime: number }>();

const LIMITS: Record<string, { windowMs: number; max: number }> = {
  "/api/auth/forgot-password": { windowMs: 15 * 60 * 1000, max: 5 },
  "/api/auth":                 { windowMs: 15 * 60 * 1000, max: 20 },
};

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous"
  );
}

function isRateLimited(
  key: string,
  windowMs: number,
  max: number,
): boolean {
  const now = Date.now();
  const record = store.get(key) ?? { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }
  record.count++;
  store.set(key, record);

  return record.count > max;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate-limit POST requests on auth routes
  if (request.method !== "POST") return NextResponse.next();

  for (const [route, limit] of Object.entries(LIMITS)) {
    if (pathname.startsWith(route)) {
      const ip = getIp(request);
      const key = `${route}:${ip}`;

      if (isRateLimited(key, limit.windowMs, limit.max)) {
        return NextResponse.json(
          { error: "Trop de tentatives. Réessayez dans 15 minutes." },
          { status: 429 },
        );
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/:path*"],
};
