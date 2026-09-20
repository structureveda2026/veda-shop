/**
 * Shapes mirror the `User` / `Address` models already defined in prisma/schema.prisma,
 * so a real backend (or Shopify Customer Account API) can be swapped in behind
 * src/services/authService.ts without touching any component that uses AuthContext.
 */

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  addresses: Address[];
}