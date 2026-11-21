import { create } from "zustand";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../services/firebase/firebase";
import { useAuthStore } from "./useAuthStore";
import type { Address, AddressInput } from "@/types/address";

const COLLECTION = "user_addresses";

interface AddressState {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  /** Returns the new address id so callers (e.g. checkout) can select it */
  addAddress: (input: AddressInput) => string;
  updateAddress: (id: string, input: AddressInput) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `addr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/** Firestore rejects `undefined` values, so strip them before writing */
const stripUndefined = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/**
 * Optimistically updates the store, then writes the full list to
 * user_addresses/{uid}. If the write fails, the previous list is restored
 * and `error` is set.
 */
const commit = (next: Address[]) => {
  const uid = useAuthStore.getState().user?.uid;
  if (!uid) throw new Error("You must be signed in to manage addresses");

  const prev = useAddressStore.getState().addresses;
  useAddressStore.setState({ addresses: next, error: null });

  setDoc(doc(db, COLLECTION, uid), {
    addresses: stripUndefined(next),
    updatedAt: serverTimestamp(),
  }).catch((err: Error) => {
    console.error("Failed to save addresses:", err);
    useAddressStore.setState({ addresses: prev, error: err.message });
  });
};

/**
 * Rules kept here so every screen behaves the same:
 * - the first address is always the default
 * - only one default at a time
 * - deleting the default promotes the first remaining address
 *
 * Data lives in Firestore at user_addresses/{uid} -> { addresses: Address[] }
 */
export const useAddressStore = create<AddressState>()((_set, get) => ({
  addresses: [],
  loading: false,
  error: null,

  addAddress: (input) => {
    const id = newId();
    const { addresses } = get();
    const makeDefault = !!input.isDefault || addresses.length === 0;
    const rest = makeDefault
      ? addresses.map((a) => ({ ...a, isDefault: false }))
      : addresses;
    commit([...rest, { ...input, id, isDefault: makeDefault }]);
    return id;
  },

  updateAddress: (id, input) => {
    const makeDefault = !!input.isDefault;
    commit(
      get().addresses.map((a) => {
        if (a.id === id)
          return { ...a, ...input, isDefault: makeDefault || a.isDefault };
        return makeDefault ? { ...a, isDefault: false } : a;
      }),
    );
  },

  removeAddress: (id) => {
    const { addresses } = get();
    const removed = addresses.find((a) => a.id === id);
    const remaining = addresses.filter((a) => a.id !== id);
    if (removed?.isDefault && remaining.length > 0) {
      remaining[0] = { ...remaining[0], isDefault: true };
    }
    commit(remaining);
  },

  setDefault: (id) => {
    commit(get().addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  },
}));

/**
 * Keeps the store in sync with the signed-in user's Firestore document.
 * Call once at app startup (next to initializeAuth) and call the returned
 * function on cleanup.
 */
export const initAddressSync = () => {
  let unsubDoc: (() => void) | null = null;
  let currentUid: string | null = null;

  const attach = (uid: string | null) => {
    if (uid === currentUid) return;
    unsubDoc?.();
    unsubDoc = null;
    currentUid = uid;

    if (!uid) {
      useAddressStore.setState({ addresses: [], loading: false, error: null });
      return;
    }

    useAddressStore.setState({ loading: true });
    unsubDoc = onSnapshot(
      doc(db, COLLECTION, uid),
      (snap) => {
        const data = snap.data();
        useAddressStore.setState({
          addresses: (data?.addresses as Address[] | undefined) ?? [],
          loading: false,
          error: null,
        });
      },
      (err) => useAddressStore.setState({ loading: false, error: err.message }),
    );
  };

  attach(useAuthStore.getState().user?.uid ?? null);
  const unsubAuth = useAuthStore.subscribe((s) => attach(s.user?.uid ?? null));

  return () => {
    unsubAuth();
    unsubDoc?.();
  };
};

/** Default address, falling back to the first one (use in checkout) */
export const selectDefaultAddress = (state: AddressState): Address | null =>
  state.addresses.find((a) => a.isDefault) ?? state.addresses[0] ?? null;
