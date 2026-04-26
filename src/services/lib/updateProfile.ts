import { useAuthStore } from "@/store/useAuthStore";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const updateProfile = async (profileData: {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  photoURL?: string | null;
}) => {
  const { user, setUser } = useAuthStore.getState();
  if (!user) throw new Error("No authenticated user found.");

  try {
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(
      userDocRef,
      {
        displayName: profileData.displayName,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        dateOfBirth: profileData.dateOfBirth,
        photoURL: profileData.photoURL,
      },
      { merge: true },
    );
    setUser({
      ...user,
      displayName: profileData.displayName,
      email: profileData.email ?? user.email,
      phoneNumber: profileData.phoneNumber ?? user.phoneNumber,
      dateOfBirth: profileData.dateOfBirth ?? user.dateOfBirth,
      photoURL: profileData.photoURL ?? user.photoURL,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
