import { db } from "@/services/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { CartItem } from "@/types/database";

export async function fetchUserCart(userId: string): Promise<CartItem[]> {
  if (!userId) return [];
  try {
    const cartRef = doc(db, "user_carts", userId);
    const snapshot = await getDoc(cartRef);
    if (snapshot.exists()) {
      return snapshot.data().items || [];
    }
    return [];
  } catch (error) {
    console.error("[CartService] Failed to fetch cart:", error);
    return [];
  }
}

export async function saveUserCart(
  userId: string,
  items: CartItem[],
): Promise<void> {
  if (!userId) return;
  try {
    const cartRef = doc(db, "user_carts", userId);
    await setDoc(
      cartRef,
      { items, updatedAt: new Date().toISOString() },
      { merge: true },
    );
  } catch (error) {
    console.error("[CartService] Failed to save cart:", error);
  }
}
