import type { SignupFormValues, SignupPayload } from "@/types/auth";

export const EMPTY_SIGNUP_VALUES: SignupFormValues = {
  fullName: "",
  email: "",
  password: "",
  mobileNumber: "",
  referralCode: "",
};

interface BuildSignupPayloadOptions {
  referralEnabled: boolean;
  whatsappConsent: boolean;
}

export function buildSignupPayload(
  values: SignupFormValues,
  { referralEnabled, whatsappConsent }: BuildSignupPayloadOptions,
): SignupPayload {
  const mobile = values.mobileNumber.trim();
  const referral = values.referralCode.trim().toUpperCase();

  return {
    fullName: values.fullName.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password,
    mobileNumber: mobile || null,
    referralCode: referralEnabled ? referral || null : null,
    // WhatsApp consent only makes sense when a number was provided
    whatsappNotifications: whatsappConsent && Boolean(mobile),
  };
}
