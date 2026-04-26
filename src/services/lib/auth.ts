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
} from "firebase/auth";
import { auth } from "../firebase/firebase";

export const signUpWithEmail = async (
  email: string,
  password: string,
  fullname: string,
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  await updateProfile(userCredential.user, { displayName: fullname });
  return userCredential;
};

export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};
export const logout = () => signOut(auth);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);
