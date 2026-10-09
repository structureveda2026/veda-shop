import { AuthUser, Address } from '../types/auth';
import { Order } from '../types/ecommerce';
import type { CustomerProfile } from '../types/orders';

/**
 * Registration / Login / Account "backend".
 *
 * INACTIVE REAL BACKEND: this runs entirely on localStorage so registration, login,
 * address book and order history all work today with zero server setup. Every shape
 * used here mirrors the `User` / `Address` / `Order` models already defined in
 * prisma/schema.prisma, and every exported function already returns a Promise (or a
 * plain value that's trivial to wrap in one) — so swapping this file for real
 * `fetch()` calls to a Node/Express + Prisma API is a targeted replacement, not a
 * refactor. AuthContext.tsx (the only file that imports this one) never touches
 * localStorage directly, so nothing above the service layer needs to change.
 *
 * For a storefront-native login instead of a custom backend, this is also the file
 * to swap for Shopify's Customer Account API (customerAccessTokenCreate /
 * customerCreate) — the same account data (name, email, phone, addresses, orders)
 * would then live on the Shopify side instead of here.
 *
 * ⚠️ Passwords are SHA-256 hashed with the browser's Web Crypto API for demo
 * purposes only, so nothing is stored in plain text — but this is NOT a substitute
 * for a real backend. Before going live, authentication must move server-side with
 * bcrypt/argon2 password hashing and HttpOnly session cookies or short-lived JWTs.
 */

interface StoredUser extends AuthUser {
  passwordHash: string;
}

type OrdersStore = Record<string, Order[]>;

const USERS_KEY = 'vedic_auth_users';
const SESSION_KEY = 'vedic_auth_session';
const ORDERS_KEY = 'vedic_auth_orders';

const readUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeUsers = (users: StoredUser[]) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save account', e);
  }
};

const readOrdersStore = (): OrdersStore => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeOrdersStore = (store: OrdersStore) => {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save orders', e);
  }
};

const hashPassword = async (password: string): Promise<string> => {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const genId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const toPublicUser = (u: StoredUser): AuthUser => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...publicUser } = u;
  return publicUser;
};

// -----------------------------------------------------------------------------------
// Registration / Login / Session
// -----------------------------------------------------------------------------------

export const registerUser = async (input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<AuthUser> => {
  const email = input.email.trim().toLowerCase();
  const users = readUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }
  const passwordHash = await hashPassword(input.password);
  const user: StoredUser = {
    id: genId('usr'),
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    createdAt: new Date().toISOString(),
    addresses: [],
    passwordHash,
  };
  writeUsers([...users, user]);
  try {
    localStorage.setItem(SESSION_KEY, user.id);
  } catch {
    /* session just won't persist across reloads */
  }
  return toPublicUser(user);
};

export const loginUser = async (input: { email: string; password: string }): Promise<AuthUser> => {
  const email = input.email.trim().toLowerCase();
  const users = readUsers();
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error('No account found with this email. Please register first.');
  const passwordHash = await hashPassword(input.password);
  if (passwordHash !== user.passwordHash) throw new Error('Incorrect password. Please try again.');
  try {
    localStorage.setItem(SESSION_KEY, user.id);
  } catch {
    /* session just won't persist across reloads */
  }
  return toPublicUser(user);
};

/**
 * Shopify Customer Account sign-in: the identity (id / name / email / phone) comes from Shopify; the
 * profile + address book below keep working unchanged, stored per Shopify customer id. Addresses are only
 * used to pre-fill checkout — Shopify keeps the address that was actually used on every order.
 * (Swap point: Customer Account API `customerAddressCreate / Update / Delete` if you want the address book on Shopify too.)
 */
export const upsertShopifyUser = (profile: CustomerProfile): AuthUser => {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === profile.id);
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  const existing = idx >= 0 ? users[idx] : null;
  const user: StoredUser = {
    id: profile.id,
    fullName: fullName || existing?.fullName || profile.email.split('@')[0],
    email: profile.email.toLowerCase(),
    phone: profile.phone || existing?.phone || '',
    createdAt: existing?.createdAt || new Date().toISOString(),
    addresses: existing?.addresses || [],
    passwordHash: '', // no password — Shopify authenticates this account
  };
  const next = [...users];
  if (idx >= 0) next[idx] = user;
  else next.push(user);
  writeUsers(next);
  try {
    localStorage.setItem(SESSION_KEY, user.id);
  } catch {
    /* session just won't persist across reloads */
  }
  return toPublicUser(user);
};

export const getSession = (): AuthUser | null => {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const user = readUsers().find((u) => u.id === id);
    return user ? toPublicUser(user) : null;
  } catch {
    return null;
  }
};

export const logoutSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};

// -----------------------------------------------------------------------------------
// Profile & Address Book
// -----------------------------------------------------------------------------------

const mutateUser = (userId: string, updater: (u: StoredUser) => StoredUser): AuthUser => {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('Your session has expired. Please sign in again.');
  const updated = updater(users[idx]);
  const next = [...users];
  next[idx] = updated;
  writeUsers(next);
  return toPublicUser(updated);
};

export const updateUserProfile = async (
  userId: string,
  updates: { fullName?: string; phone?: string }
): Promise<AuthUser> =>
  mutateUser(userId, (u) => ({
    ...u,
    fullName: updates.fullName?.trim() || u.fullName,
    phone: updates.phone?.trim() || u.phone,
  }));

export const addUserAddress = async (userId: string, address: Omit<Address, 'id'>): Promise<AuthUser> =>
  mutateUser(userId, (u) => {
    const makeDefault = address.isDefault || u.addresses.length === 0;
    const addresses = makeDefault ? u.addresses.map((a) => ({ ...a, isDefault: false })) : [...u.addresses];
    addresses.push({ ...address, id: genId('addr'), isDefault: makeDefault });
    return { ...u, addresses };
  });

export const updateUserAddress = async (
  userId: string,
  addressId: string,
  updates: Partial<Omit<Address, 'id'>>
): Promise<AuthUser> =>
  mutateUser(userId, (u) => {
    let addresses = u.addresses.map((a) => (a.id === addressId ? { ...a, ...updates } : a));
    if (updates.isDefault) {
      addresses = addresses.map((a) => ({ ...a, isDefault: a.id === addressId }));
    }
    return { ...u, addresses };
  });

export const removeUserAddress = async (userId: string, addressId: string): Promise<AuthUser> =>
  mutateUser(userId, (u) => {
    const remaining = u.addresses.filter((a) => a.id !== addressId);
    if (remaining.length && !remaining.some((a) => a.isDefault)) remaining[0] = { ...remaining[0], isDefault: true };
    return { ...u, addresses: remaining };
  });

export const setDefaultUserAddress = async (userId: string, addressId: string): Promise<AuthUser> =>
  mutateUser(userId, (u) => ({
    ...u,
    addresses: u.addresses.map((a) => ({ ...a, isDefault: a.id === addressId })),
  }));

// -----------------------------------------------------------------------------------
// Orders
// -----------------------------------------------------------------------------------

export const getUserOrders = (userId: string): Order[] => {
  const store = readOrdersStore();
  return (store[userId] || []).slice().reverse(); // newest first
};

export const createUserOrder = (userId: string, order: Order): Order => {
  const store = readOrdersStore();
  store[userId] = [...(store[userId] || []), order];
  writeOrdersStore(store);
  return order;
};