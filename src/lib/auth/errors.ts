export function getAuthErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try logging in instead.";
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters with letters and numbers.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/operation-not-allowed":
      return "Email sign-up is not enabled. Please contact support.";
    default:
      return "Could not create your account. Please try again.";
  }
}

/** Pulls a Firebase-style `code` off an unknown thrown value. */
export function getErrorCode(error: unknown): string {
  return (error as { code?: string })?.code ?? "unknown";
}
