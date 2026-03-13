import type { RiskLevel } from './types/actions';
import { storage } from './storage';

export async function checkSitePermission(
  url: string
): Promise<'allow' | 'ask' | 'deny'> {
  const settings = await storage.getSettings();
  const hostname = new URL(url).hostname;

  for (const [pattern, permission] of Object.entries(
    settings.sitePermissions
  )) {
    if (hostname === pattern || hostname.endsWith('.' + pattern)) {
      return permission;
    }
  }
  return 'ask';
}

export function shouldAutoApprove(
  riskLevel: RiskLevel,
  autoApproveReadOnly: boolean
): boolean {
  if (riskLevel === 'safe' && autoApproveReadOnly) return true;
  return false;
}
