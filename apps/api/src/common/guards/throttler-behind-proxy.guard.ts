import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

interface ProxyRequest extends Record<string, unknown> {
  headers?: Record<string, string | string[] | undefined>;
  ip?: string;
}

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(request: ProxyRequest): Promise<string> {
    const forwarded = request.headers?.["x-forwarded-for"];
    const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const firstProxy = value?.split(",")[0]?.trim();

    return firstProxy || request.ip || "unknown";
  }
}
