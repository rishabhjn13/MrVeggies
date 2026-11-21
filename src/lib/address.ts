import type { Address } from '@/types/address';

/** Display lines for an address, shared by the Address Book and Checkout */
export const formatAddressLines = (a: Address): string[] => {
    const street = [a.addressLine1, a.addressLine2].filter(Boolean).join(', ');
    const region = [[a.city, a.state].filter(Boolean).join(', '), a.pincode]
        .filter(Boolean)
        .join(' ');
    return [street, region].filter(Boolean);
};

/** Single-line version, e.g. for order summaries */
export const formatAddressInline = (a: Address): string => formatAddressLines(a).join(', ');