"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  UserCredential,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  getAdditionalUserInfo,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/services/firebase/firebase";

const USER_INFO_COLLECTION = "user_information";

export type SignUpExtraInfo = {
  mobileNumber: string | null;
  referralCode: string | null;
  whatsappNotifications: boolean;
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  fullname: string,
  extra: SignUpExtraInfo,
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const { user } = userCredential;

  try {
    await updateProfile(user, { displayName: fullname });

    await setDoc(doc(db, USER_INFO_COLLECTION, user.uid), {
      uid: user.uid,
      fullName: fullname,
      email,
      phoneNumber: extra.mobileNumber,
      date_of_birth: null,
      gender: null,
      city: null,
      bio: null,
      referralCode: extra.referralCode,
      whatsappNotifications: extra.whatsappNotifications,
      provider: "password",
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Roll back the auth user so we never keep an account without its profile document
    console.error(
      "[Auth] Failed to save user_information, rolling back account:",
      error,
    );
    try {
      await user.delete();
    } catch (deleteError) {
      console.error("[Auth] Rollback (delete user) failed:", deleteError);
    }
    throw error;
  }

  return userCredential;
};

export const signInWithEmail = async (
  email: string,
  password: string,
  rememberDevice = true,
): Promise<UserCredential> => {
  await setPersistence(
    auth,
    rememberDevice ? browserLocalPersistence : browserSessionPersistence,
  );
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async (
  rememberDevice = true,
): Promise<UserCredential> => {
  await setPersistence(
    auth,
    rememberDevice ? browserLocalPersistence : browserSessionPersistence,
  );

  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  // First-time Google users get a user_information document too
  if (getAdditionalUserInfo(result)?.isNewUser) {
    const { user } = result;
    await setDoc(doc(db, USER_INFO_COLLECTION, user.uid), {
      uid: user.uid,
      fullName: user.displayName ?? "",
      email: user.email,
      mobileNumber: null,
      referralCode: null,
      whatsappConsent: false,
      provider: "google",
      createdAt: serverTimestamp(),
    });
  }

  return result;
};

export const logout = () => signOut(auth);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new Error("No signed-in user");
  }

  // Google-only accounts have no password to change
  const hasPasswordProvider = user.providerData.some(
    (p) => p.providerId === "password",
  );
  if (!hasPasswordProvider) {
    throw Object.assign(new Error("Account has no password"), {
      code: "auth/no-password-provider",
    });
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};

export const hasPasswordProvider = (): boolean =>
  !!auth.currentUser?.providerData.some((p) => p.providerId === "password");
