import { onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";
import { auth, db } from "../services/firebase/firebase";
import { doc, getDoc } from "@firebase/firestore";

export interface User {
  uid: string;
  email: string | null;
  displayName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  photoURL?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  clearAuth: () => set({ user: null }),
}));

export const initializeAuth = () => {
  const { setUser, setLoading } = useAuthStore.getState();

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      const firestoreData = userDoc.exists() ? userDoc.data() : {};

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName:
          firestoreData.displayName ?? firebaseUser.displayName ?? undefined,
        phoneNumber:
          firestoreData.phoneNumber ?? firebaseUser.phoneNumber ?? undefined,
        photoURL: firestoreData.photoURL ?? firebaseUser.photoURL ?? undefined,
        dateOfBirth: firestoreData.dateOfBirth ?? undefined,
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  });

  return unsubscribe;
};
