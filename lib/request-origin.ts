function firstHeaderValue(value: string | null): string | undefined {
  return value?.split(",")[0]?.trim().toLocaleLowerCase("en-US") || undefined;
}

export function requestHost(requestHeaders: Headers): string | undefined {
  return firstHeaderValue(requestHeaders.get("x-forwarded-host")) ?? firstHeaderValue(requestHeaders.get("host"));
}

export function isTrustedRequestOrigin(requestHeaders: Headers, allowedHosts: string[] = []): boolean {
  const origin = requestHeaders.get("origin");
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host.toLocaleLowerCase("en-US");
    const trustedHosts = [requestHost(requestHeaders), ...allowedHosts.map((host) => host.toLocaleLowerCase("en-US"))].filter(Boolean);
    return trustedHosts.includes(originHost);
  } catch {
    return false;
  }
}
