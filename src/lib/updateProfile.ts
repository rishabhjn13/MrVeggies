import { useAuthStore } from "@/store/useAuthStore";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import type { Gender } from "@/lib/constants/profile";

export type ProfileUpdate = {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  photoURL?: string;
  gender?: Gender;
  city?: string;
  bio?: string;
  whatsappNotifications?: boolean;
};

export const updateProfile = async (profileData: ProfileUpdate) => {
  const { user, setUser } = useAuthStore.getState();
  if (!user) throw new Error("No authenticated user found.");

  const changes = Object.fromEntries(
    Object.entries(profileData).filter(([, value]) => value !== undefined),
  ) as ProfileUpdate;

  try {
    await setDoc(doc(db, "user_information", user.uid), changes, {
      merge: true,
    });
    setUser({ ...user, ...changes });
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
