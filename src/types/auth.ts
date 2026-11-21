import type { FieldErrors, FieldTouched } from "./form";

/** Raw values held in the signup form's state. */
export interface SignupFormValues {
  fullName: string;
  email: string;
  password: string;
  mobileNumber: string;
  referralCode: string;
}

export type SignupFieldName = keyof SignupFormValues;
export type SignupFormErrors = FieldErrors<SignupFormValues>;
export type SignupFormTouched = FieldTouched<SignupFormValues>;

/** Cleaned data sent to the sign-up request. */
export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  mobileNumber: string | null;
  referralCode: string | null;
  whatsappNotifications: boolean;
}

/** Extra profile data saved alongside the Firebase Auth account. */
export type SignupProfileExtras = Pick<
  SignupPayload,
  "mobileNumber" | "referralCode" | "whatsappNotifications"
>;
