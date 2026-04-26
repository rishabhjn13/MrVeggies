import type {
  LoginFormData,
  SignupFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  FormErrors,
} from "../auth/types";
import { isValidEmail, isValidPhone } from "./helpers";

export function validateLogin(data: LoginFormData): FormErrors<LoginFormData> {
  const errors: FormErrors<LoginFormData> = {};

  if (!data.email.trim()) {
    errors.email = { message: "Email is required" };
  } else if (!isValidEmail(data.email)) {
    errors.email = { message: "Enter a valid email address" };
  }

  if (!data.password) {
    errors.password = { message: "Password is required" };
  } else if (data.password.length < 6) {
    errors.password = { message: "Password must be at least 6 characters" };
  }

  return errors;
}

export function validateSignup(
  data: SignupFormData,
): FormErrors<SignupFormData> {
  const errors: FormErrors<SignupFormData> = {};

  if (!data.fullName.trim()) {
    errors.fullName = { message: "Full name is required" };
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = { message: "Name must be at least 2 characters" };
  }

  if (!data.email.trim()) {
    errors.email = { message: "Email is required" };
  } else if (!isValidEmail(data.email)) {
    errors.email = { message: "Enter a valid email address" };
  }

  if (!data.phone.trim()) {
    errors.phone = { message: "Phone number is required" };
  } else if (!isValidPhone(data.phone)) {
    errors.phone = { message: "Enter a valid 10-digit Indian mobile number" };
  }

  if (!data.password) {
    errors.password = { message: "Password is required" };
  } else if (data.password.length < 8) {
    errors.password = { message: "Password must be at least 8 characters" };
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = { message: "Please confirm your password" };
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = { message: "Passwords do not match" };
  }

  if (!data.acceptTerms) {
    errors.acceptTerms = { message: "You must accept the terms to continue" };
  }

  return errors;
}

export function validateForgotPassword(
  data: ForgotPasswordFormData,
): FormErrors<ForgotPasswordFormData> {
  const errors: FormErrors<ForgotPasswordFormData> = {};

  if (!data.email.trim()) {
    errors.email = { message: "Email is required" };
  } else if (!isValidEmail(data.email)) {
    errors.email = { message: "Enter a valid email address" };
  }

  return errors;
}

export function validateResetPassword(
  data: ResetPasswordFormData,
): FormErrors<ResetPasswordFormData> {
  const errors: FormErrors<ResetPasswordFormData> = {};

  if (!data.password) {
    errors.password = { message: "Password is required" };
  } else if (data.password.length < 8) {
    errors.password = { message: "Password must be at least 8 characters" };
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = { message: "Please confirm your password" };
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = { message: "Passwords do not match" };
  }

  return errors;
}
