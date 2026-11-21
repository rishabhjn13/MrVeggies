"use client";

import { useMemo, useState } from "react";
import { useAddressStore } from "@/store/useAddressStore";
import type { Address, AddressInput } from "@/types/address";

/** All Address Book behaviour: data from the store plus modal / edit state. */
export function useAddressBook() {
  const addresses = useAddressStore((s) => s.addresses);
  const addAddress = useAddressStore((s) => s.addAddress);
  const updateAddress = useAddressStore((s) => s.updateAddress);
  const removeAddress = useAddressStore((s) => s.removeAddress);
  const setDefault = useAddressStore((s) => s.setDefault);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  /* Default address first */
  const sorted = useMemo(
    () =>
      [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
    [addresses],
  );

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (address: Address) => {
    setEditing(address);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const save = (input: AddressInput) => {
    if (editing) updateAddress(editing.id, input);
    else addAddress(input);
    closeModal();
  };

  return {
    addresses: sorted,
    modalOpen,
    editing,
    openAdd,
    openEdit,
    closeModal,
    save,
    remove: removeAddress,
    makeDefault: setDefault,
  };
}
