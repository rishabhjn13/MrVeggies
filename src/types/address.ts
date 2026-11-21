export type AddressType = 'Home' | 'Work' | 'Other';

/**
 * Single source of truth for an address, shared by the Address Book,
 * the address form modal and Checkout. Fields mirror the form.
 */
export interface Address {
    id: string;
    type: AddressType;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
}

/** What the form produces. The id and default bookkeeping belong to the store. */
export type AddressInput = Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean };