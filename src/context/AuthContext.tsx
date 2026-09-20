import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthUser, Address } from '../types/auth';
import { CartItem, Order } from '../types/ecommerce';
import * as authService from '../services/authService';

interface PlaceOrderInput {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  shippingAddress: Order['shippingAddress'];
  paymentMethod: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  orders: Order[];
  authError: string | null;
  isSubmitting: boolean;
  register: (input: { fullName: string; email: string; phone: string; password: string }) => Promise<boolean>;
  login: (input: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: { fullName?: string; phone?: string }) => Promise<boolean>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<boolean>;
  updateAddress: (addressId: string, updates: Partial<Omit<Address, 'id'>>) => Promise<boolean>;
  removeAddress: (addressId: string) => Promise<boolean>;
  setDefaultAddress: (addressId: string) => Promise<boolean>;
  placeOrder: (input: PlaceOrderInput) => Order;
  clearAuthError: () => void;
  // Global login/register popup, triggered from anywhere (cart, wishlist, buy now, header…)
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  authModalReason: string | null;
  openAuthModal: (reason?: string, tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultDefaultAddress = (addresses: Address[]) => addresses.find((a) => a.isDefault) ?? addresses[0];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getSession());
  const [orders, setOrders] = useState<Order[]>(() => {
    const session = authService.getSession();
    return session ? authService.getUserOrders(session.id) : [];
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);

  useEffect(() => {
    setOrders(user ? authService.getUserOrders(user.id) : []);
  }, [user]);

  const openAuthModal = useCallback((reason?: string, tab: 'login' | 'register' = 'login') => {
    setAuthError(null);
    setAuthModalReason(reason ?? null);
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
    setAuthError(null);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const register: AuthContextType['register'] = async (input) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const newUser = await authService.registerUser(input);
      setUser(newUser);
      closeAuthModal();
      return true;
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Could not create your account. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const login: AuthContextType['login'] = async (input) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const loggedInUser = await authService.loginUser(input);
      setUser(loggedInUser);
      closeAuthModal();
      return true;
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Could not sign you in. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    authService.logoutSession();
    setUser(null);
    setOrders([]);
  };

  const updateProfile: AuthContextType['updateProfile'] = async (updates) => {
    if (!user) return false;
    try {
      const updated = await authService.updateUserProfile(user.id, updates);
      setUser(updated);
      return true;
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Could not update your profile.');
      return false;
    }
  };

  const addAddress: AuthContextType['addAddress'] = async (address) => {
    if (!user) return false;
    try {
      const updated = await authService.addUserAddress(user.id, address);
      setUser(updated);
      return true;
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Could not save this address.');
      return false;
    }
  };

  const updateAddress: AuthContextType['updateAddress'] = async (addressId, updates) => {
    if (!user) return false;
    try {
      const updated = await authService.updateUserAddress(user.id, addressId, updates);
      setUser(updated);
      return true;
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Could not update this address.');
      return false;
    }
  };

  const removeAddress: AuthContextType['removeAddress'] = async (addressId) => {
    if (!user) return false;
    try {
      const updated = await authService.removeUserAddress(user.id, addressId);
      setUser(updated);
      return true;
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Could not remove this address.');
      return false;
    }
  };

  const setDefaultAddress: AuthContextType['setDefaultAddress'] = async (addressId) => {
    if (!user) return false;
    try {
      const updated = await authService.setDefaultUserAddress(user.id, addressId);
      setUser(updated);
      return true;
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Could not update your default address.');
      return false;
    }
  };

  const placeOrder: AuthContextType['placeOrder'] = (input) => {
    if (!user) throw new Error('You must be signed in to place an order.');
    const now = new Date();
    const order: Order = {
      id: `VA-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: now.toISOString(),
      items: input.items,
      subtotal: input.subtotal,
      discountAmount: input.discountAmount,
      shippingFee: input.shippingFee,
      total: input.total,
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod,
      status: 'Placed',
      trackingNumber: `VS-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDelivery: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toDateString(),
    };
    const saved = authService.createUserOrder(user.id, order);
    setOrders((prev) => [saved, ...prev]);
    return saved;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        orders,
        authError,
        isSubmitting,
        register,
        login,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,
        placeOrder,
        clearAuthError,
        isAuthModalOpen,
        authModalTab,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

/** Convenience helper — the address a form should be pre-filled with. */
export const getDefaultAddress = (user: AuthUser | null): Address | undefined =>
  user ? defaultDefaultAddress(user.addresses) : undefined;