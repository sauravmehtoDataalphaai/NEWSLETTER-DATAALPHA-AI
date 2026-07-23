export const REDIRECT_SECONDS = 5;

/**
 * Only allow safe absolute http(s) URLs for post-action redirect.
 */
export function isSafeExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Resolve where to send the user after success:
 * 1) ?returnUrl=... (most reliable for LinkedIn / shared links)
 * 2) document.referrer if it's an external site
 * 3) null → caller may try history.back()
 */
export function resolveReturnTarget(returnUrlParam) {
  if (returnUrlParam && isSafeExternalUrl(returnUrlParam)) {
    return returnUrlParam;
  }

  const referrer = document.referrer;
  if (referrer && isSafeExternalUrl(referrer)) {
    try {
      const refHost = new URL(referrer).hostname;
      const selfHost = window.location.hostname;
      if (refHost !== selfHost) return referrer;
    } catch {
      // ignore bad referrer
    }
  }

  return null;
}

/**
 * Navigate back to returnUrl / referrer / history.
 * Returns true if a navigation was attempted, false otherwise.
 */
export function navigateReturnOrBack(returnUrlParam) {
  const target = resolveReturnTarget(returnUrlParam);

  if (target) {
    window.location.assign(target);
    return true;
  }

  if (window.history.length > 1) {
    window.history.back();
    return true;
  }

  return false;
}

export function canAutoRedirect(returnUrlParam) {
  return Boolean(resolveReturnTarget(returnUrlParam)) || window.history.length > 1;
}
