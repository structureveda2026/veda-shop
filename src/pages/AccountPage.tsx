import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Star,
  Loader2,
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types/auth';

const emptyAddressForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user, orders, logout, updateProfile, addAddress, updateAddress, removeAddress, setDefaultAddress, openAuthModal } =
    useAuth();

  // ---- Profile form state ----
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // ---- Address form state ----
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressSaving, setAddressSaving] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-vedic-maroon text-vedic-gold flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-bold text-xl text-vedic-maroon">Sign In to View Your Account</h2>
        <p className="text-xs text-vedic-muted">
          Create an account or sign in to manage your profile, track orders and save delivery addresses.
        </p>
        <button
          onClick={() => openAuthModal()}
          className="bg-vedic-maroon text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md hover:bg-vedic-maroonDark transition-colors"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('');
  const memberSince = new Date(user.createdAt).getFullYear();

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSaved(false);
    const ok = await updateProfile(profileForm);
    setProfileSaving(false);
    if (ok) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
  };

  const openNewAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm({ ...emptyAddressForm, fullName: user.fullName, phone: user.phone });
    setAddressFormOpen(true);
  };

  const openEditAddressForm = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
    });
    setAddressFormOpen(true);
  };

  const closeAddressForm = () => {
    setAddressFormOpen(false);
    setEditingAddressId(null);
  };

  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    const ok = editingAddressId
      ? await updateAddress(editingAddressId, addressForm)
      : await addAddress({ ...addressForm, isDefault: user.addresses.length === 0 });
    setAddressSaving(false);
    if (ok) closeAddressForm();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <Breadcrumb items={[{ label: 'My Account' }]} />

      <div className="bg-white rounded-3xl p-6 border border-vedic-gold/20 shadow-card flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-vedic-maroon text-vedic-gold flex items-center justify-center font-bold font-serif text-xl border-2 border-vedic-gold">
            {initials || 'U'}
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-xl text-vedic-maroon">{user.fullName}</h1>
            <p className="text-xs text-vedic-muted">
              {user.email} • Member since {memberSince}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-bold text-vedic-maroon border border-vedic-maroon/30 px-4 py-2 rounded-full hover:bg-vedic-maroon hover:text-white transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="bg-white rounded-3xl p-4 border border-vedic-gold/20 shadow-card space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'profile' ? 'bg-vedic-maroon text-white' : 'text-vedic-dark hover:bg-vedic-ivory'
            }`}
          >
            <User className="w-4 h-4 text-vedic-gold" /> Personal Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'orders' ? 'bg-vedic-maroon text-white' : 'text-vedic-dark hover:bg-vedic-ivory'
            }`}
          >
            <Package className="w-4 h-4 text-vedic-gold" /> My Orders History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'addresses' ? 'bg-vedic-maroon text-white' : 'text-vedic-dark hover:bg-vedic-ivory'
            }`}
          >
            <MapPin className="w-4 h-4 text-vedic-gold" /> Saved Delivery Addresses
          </button>
          <Link
            to="/wishlist"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-vedic-dark hover:bg-vedic-ivory"
          >
            <Heart className="w-4 h-4 text-vedic-gold" /> Wishlist ({wishlistCount})
          </Link>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 bg-white rounded-3xl p-6 md:p-8 border border-vedic-gold/20 shadow-card space-y-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <h3 className="font-serif font-bold text-base text-vedic-maroon border-b border-vedic-beige pb-3">
                Account Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-vedic-dark mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none focus:border-vedic-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-vedic-dark mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none focus:border-vedic-gold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-vedic-dark mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 bg-vedic-beige/60 rounded-xl border border-vedic-gold/20 text-vedic-muted cursor-not-allowed"
                  />
                  <p className="text-[10px] text-vedic-muted mt-1">Email is used to sign in and can't be changed here.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-vedic-maroon text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md hover:bg-vedic-maroonDark transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
                {profileSaved && <span className="text-emerald-700 font-bold">Saved!</span>}
              </div>
            </form>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-base text-vedic-maroon border-b border-vedic-beige pb-3">
                Recent Orders
              </h3>
              {orders.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <Sparkles className="w-8 h-8 text-vedic-gold mx-auto" />
                  <p className="text-xs text-vedic-muted">You haven't placed any orders yet.</p>
                  <Link
                    to="/shop"
                    className="inline-block bg-vedic-maroon text-white px-5 py-2 rounded-full text-xs font-bold"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-vedic-ivory rounded-2xl border border-vedic-gold/20 flex items-center justify-between text-xs gap-3 flex-wrap"
                  >
                    <div>
                      <span className="font-bold font-mono text-vedic-maroon block">Order #{order.id}</span>
                      <span className="text-vedic-muted">
                        Placed on {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} •{' '}
                        {order.items.length} Item{order.items.length > 1 ? 's' : ''} • {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-vedic-dark block">₹{order.total.toLocaleString('en-IN')}</span>
                      <Link to={`/track-order?id=${order.id}`} className="text-vedic-goldDark font-bold hover:underline">
                        Track Package →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-vedic-beige pb-3">
                <h3 className="font-serif font-bold text-base text-vedic-maroon">Saved Addresses</h3>
                {!addressFormOpen && (
                  <button
                    onClick={openNewAddressForm}
                    className="flex items-center gap-1.5 text-vedic-goldDark font-bold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Address
                  </button>
                )}
              </div>

              {addressFormOpen && (
                <form onSubmit={handleAddressSave} className="p-4 bg-vedic-ivory rounded-2xl border border-vedic-gold/20 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      placeholder="Full Name"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      className="px-3 py-2 bg-white rounded-xl border border-vedic-gold/30 focus:outline-none"
                    />
                    <input
                      required
                      placeholder="Phone Number"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="px-3 py-2 bg-white rounded-xl border border-vedic-gold/30 focus:outline-none"
                    />
                    <input
                      required
                      placeholder="Address Line 1 (House No, Street)"
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                      className="sm:col-span-2 px-3 py-2 bg-white rounded-xl border border-vedic-gold/30 focus:outline-none"
                    />
                    <input
                      placeholder="Address Line 2 (optional)"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                      className="sm:col-span-2 px-3 py-2 bg-white rounded-xl border border-vedic-gold/30 focus:outline-none"
                    />
                    <input
                      required
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="px-3 py-2 bg-white rounded-xl border border-vedic-gold/30 focus:outline-none"
                    />
                    <input
                      required
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="px-3 py-2 bg-white rounded-xl border border-vedic-gold/30 focus:outline-none"
                    />
                    <input
                      required
                      placeholder="Pincode"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="px-3 py-2 bg-white rounded-xl border border-vedic-gold/30 focus:outline-none"
                    />
                    <input
                      required
                      placeholder="Country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="px-3 py-2 bg-white rounded-xl border border-vedic-gold/30 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={addressSaving}
                      className="bg-vedic-maroon text-white px-5 py-2 rounded-full font-bold shadow-md hover:bg-vedic-maroonDark transition-colors flex items-center gap-2 disabled:opacity-60"
                    >
                      {addressSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={closeAddressForm}
                      className="px-5 py-2 rounded-full font-bold border border-vedic-gold/40 text-vedic-dark"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {user.addresses.length === 0 && !addressFormOpen ? (
                <div className="text-center py-10 space-y-3">
                  <MapPin className="w-8 h-8 text-vedic-gold mx-auto" />
                  <p className="text-vedic-muted">No saved addresses yet.</p>
                </div>
              ) : (
                user.addresses.map((addr) => (
                  <div key={addr.id} className="p-4 bg-vedic-ivory rounded-2xl border border-vedic-gold/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-vedic-dark flex items-center gap-2">
                        {addr.fullName}
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-vedic-maroon bg-vedic-gold/20 px-2 py-0.5 rounded-full">
                            <Star className="w-2.5 h-2.5 fill-current" /> Default
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditAddressForm(addr)} className="p-1.5 text-vedic-muted hover:text-vedic-maroon" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeAddress(addr.id)} className="p-1.5 text-vedic-muted hover:text-red-600" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-vedic-muted">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}, {addr.country}
                    </p>
                    <p className="text-vedic-muted">Phone: {addr.phone}</p>
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-vedic-goldDark font-bold hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};