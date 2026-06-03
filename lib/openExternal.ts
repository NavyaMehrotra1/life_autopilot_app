import { Linking, Platform } from 'react-native';

/**
 * Open an external URL safely from any platform.
 *
 * On web, react-native-web's Linking.openURL can navigate the current tab
 * (especially in standalone PWA mode), which unmounts the app and loses
 * any in-memory state like a draft cart. We always open in a new tab.
 *
 * On native, Linking.openURL hands off to the system, which deep-links into
 * the matching app (e.g. Instacart) if installed, falling back to a browser.
 */
export function openExternal(url: string) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  Linking.openURL(url).catch(() => {});
}

/**
 * Best-effort clipboard copy. Web uses the Async Clipboard API directly
 * (works in the PWA too). Native silently no-ops — we don't pull in
 * expo-clipboard for an MVP affordance. Returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (Platform.OS !== 'web') return false;
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
