import type {
  SignupFieldName,
  SignupFormErrors,
  SignupFormTouched,
  SignupFormValues,
} from "@/types/auth";
import {
  EMAIL_PATTERN,
  INDIAN_MOBILE_PATTERN,
  PERSON_NAME_PATTERN,
  REFERRAL_CODE_PATTERN,
} from "./patterns";

export const SIGNUP_FIELD_ORDER: readonly SignupFieldName[] = [
  "fullName",
  "email",
  "password",
  "mobileNumber",
  "referralCode",
];

export const ALL_SIGNUP_FIELDS_TOUCHED = Object.fromEntries(
  SIGNUP_FIELD_ORDER.map((field) => [field, true]),
) as SignupFormTouched;

const LIMITS = {
  nameMin: 2,
  nameMax: 60,
  emailMax: 254,
  passwordMin: 8,
  passwordMax: 128,
  mobileDigits: 10,
} as const;

type FieldValidator = (rawValue: string, referralEnabled: boolean) => string;

// Record<SignupFieldName, ...> makes TypeScript complain if a field is missing a validator.
const validators: Record<SignupFieldName, FieldValidator> = {
  fullName: (raw) => {
    const value = raw.trim();
    if (!value) return "Please enter your full name.";
    if (value.length < LIMITS.nameMin)
      return `Name must be at least ${LIMITS.nameMin} characters.`;
    if (value.length > LIMITS.nameMax)
      return `Name must be ${LIMITS.nameMax} characters or fewer.`;
    if (!PERSON_NAME_PATTERN.test(value))
      return "Name can only contain letters, spaces, . ' and -.";
    return "";
  },

  email: (raw) => {
    const value = raw.trim();
    if (!value) return "Please enter your email address.";
    if (value.length > LIMITS.emailMax) return "Email address is too long.";
    if (!EMAIL_PATTERN.test(value))
      return "Enter a valid email like name@example.com.";
    return "";
  },

  password: (raw) => {
    // Not trimmed: spaces are valid password characters
    if (!raw) return "Please create a password.";
    if (raw.length < LIMITS.passwordMin)
      return `Password must be at least ${LIMITS.passwordMin} characters.`;
    if (raw.length > LIMITS.passwordMax)
      return `Password must be ${LIMITS.passwordMax} characters or fewer.`;
    if (!/[A-Za-z]/.test(raw) || !/\d/.test(raw)) {
      return "Password must include at least one letter and one number.";
    }
    return "";
  },

  mobileNumber: (raw) => {
    const value = raw.trim();
    if (!value) return ""; // optional
    if (!/^\d+$/.test(value)) return "Mobile number can only contain digits.";
    if (value.length !== LIMITS.mobileDigits)
      return `Mobile number must be exactly ${LIMITS.mobileDigits} digits.`;
    if (!INDIAN_MOBILE_PATTERN.test(value))
      return "Enter a valid Indian mobile number (starts with 6-9).";
    return "";
  },

  referralCode: (raw, referralEnabled) => {
    const value = raw.trim();
    if (!referralEnabled || !value) return ""; // optional
    if (!REFERRAL_CODE_PATTERN.test(value))
      return "Referral code should be 4-20 letters, numbers or hyphens.";
    return "";
  },
};

export function validateSignupField(
  name: SignupFieldName,
  rawValue: string,
  referralEnabled = true,
): string {
  return validators[name](rawValue, referralEnabled);
}

export function validateSignupForm(
  values: SignupFormValues,
  referralEnabled: boolean,
): SignupFormErrors {
  const errors: SignupFormErrors = {};
  for (const field of SIGNUP_FIELD_ORDER) {
    const message = validateSignupField(field, values[field], referralEnabled);
    if (message) errors[field] = message;
  }
  return errors;
}
