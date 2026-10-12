import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  "/api/auth/login": { windowMs: 60_000, maxRequests: 5, message: "Demasiados intentos de login. Intenta en 15 minutos." },
  "/api/auth/register": { windowMs: 60_000, maxRequests: 3, message: "Demasiados registros. Intenta en 1 minuto." },
  "/api/auth/reset-password": { windowMs: 300_000, maxRequests: 2, message: "Demasiadas solicitudes de recuperación. Intenta en 5 minutos." },
  "/api/servicios": { windowMs: 60_000, maxRequests: 30, message: "Demasiadas solicitudes. Intenta en 1 minuto." },
  "/api/contacto": { windowMs: 60_000, maxRequests: 5, message: "Demasiados mensajes. Intenta en 1 minuto." },
  "/api/calificaciones": { windowMs: 60_000, maxRequests: 10, message: "Demasiadas calificaciones. Intenta en 1 minuto." },
};

const ipCache = new Map<string, { count: number; resetTime: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  return cfConnectingIp || realIp || forwarded?.split(",")[0]?.trim() || "unknown";
}

function checkRateLimit(ip: string, path: string): { allowed: boolean; retryAfter?: number; message?: string } {
  const config = rateLimitConfigs[path];
  if (!config) return { allowed: true };

  const now = Date.now();
  const key = `${ip}:${path}`;
  const record = ipCache.get(key);

  if (!record || now > record.resetTime) {
    ipCache.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true };
  }

  if (record.count >= config.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter, message: config.message };
  }

  record.count++;
  return { allowed: true };
}

async function getUserFromSession(
  request: NextRequest,
  response: NextResponse
): Promise<{ id: string; tipo?: string } | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  return {
    id: user.id,
    tipo: user.user_metadata?.tipo as string | undefined,
  };
}

export async function middleware(request: NextRequest) {
  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;

  const rateLimitResult = checkRateLimit(ip, path);
  if (!rateLimitResult.allowed) {
    return new NextResponse(
      JSON.stringify({ error: rateLimitResult.message, retryAfter: rateLimitResult.retryAfter }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateLimitResult.retryAfter || 60),
          "X-RateLimit-Limit": String(rateLimitConfigs[path]?.maxRequests || 0),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil((Date.now() + (rateLimitResult.retryAfter || 60) * 1000) / 1000)),
        },
      }
    );
  }

  const config = rateLimitConfigs[path];
  const response = NextResponse.next();
  
  if (config) {
    const key = `${ip}:${path}`;
    const record = ipCache.get(key);
    const remaining = config.maxRequests - (record?.count || 0);
    
    response.headers.set("X-RateLimit-Limit", String(config.maxRequests));
    response.headers.set("X-RateLimit-Remaining", String(Math.max(0, remaining)));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil((record?.resetTime || Date.now() + config.windowMs) / 1000)));
  }

  const user = await getUserFromSession(request, response);
  if (user) {
    response.headers.set("x-user-id", user.id);
    if (user.tipo) {
      response.headers.set("x-user-tipo", user.tipo);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/api/auth/:path*",
    "/api/servicios/:path*",
    "/api/contacto/:path*",
    "/api/calificaciones/:path*",
    "/api/terms-acceptance/:path*",
    "/auth/callback/:path*",
  ],
  runtime: "nodejs",
};