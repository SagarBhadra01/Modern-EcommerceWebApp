import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import gsap from 'gsap';
import { Camera, Bell, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { profileSchema, passwordChangeSchema, type ProfileFormData, type PasswordChangeFormData } from '@/lib/validators';
import { useUser } from '@clerk/clerk-react';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

const Settings = () => {
  const { user } = useUser();
  const displayName = user?.fullName || user?.firstName || 'User';
  const displayEmail = user?.primaryEmailAddress?.emailAddress || '';
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    orders: true,
    promotions: false,
  });

  const blocksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (blocksRef.current) {
        gsap.fromTo(
          blocksRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: displayName,
      email: displayEmail,
      phone: '',
    },
  });

  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    toast.success('Profile updated successfully');
  };

  const onPasswordSubmit = (data: PasswordChangeFormData) => {
    toast.success('Password changed successfully');
    passwordForm.reset();
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8 tracking-tight">Settings</h1>

      <div ref={blocksRef} className="space-y-6">
        {/* Avatar */}
        <div className="bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 sm:p-8 opacity-0">
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer" data-hover>
              <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center text-2xl font-bold shadow-inner group-hover:bg-white/10 transition-colors overflow-hidden">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={displayName} className="h-full w-full object-cover rounded-full" />
                ) : (
                  getInitials(displayName)
                )}
              </div>
              <button
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform"
                aria-label="Upload avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{displayName}</h2>
              <p className="text-sm font-medium text-white/40 mt-1">{displayEmail}</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 sm:p-8 opacity-0">
          <h2 className="text-lg font-bold text-white mb-6">Profile Information</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
            <Input label="Full Name" error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
            <Input label="Email" type="email" error={profileForm.formState.errors.email?.message} {...profileForm.register('email')} />
            <Input label="Phone" placeholder="+1 (555) 000-0000" {...profileForm.register('phone')} />
            <div className="pt-2">
              <Button type="submit" size="md" className="shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">Save Changes</Button>
            </div>
          </form>
        </div>

        {/* Password */}
        <div className="bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 sm:p-8 opacity-0">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-5 w-5 text-white/50" />
            <h2 className="text-lg font-bold text-white">Change Password</h2>
          </div>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
            <Input label="Current Password" type="password" error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
            <Input label="New Password" type="password" error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
            <Input label="Confirm New Password" type="password" error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
            <div className="pt-2">
              <Button type="submit" variant="secondary" size="md">Update Password</Button>
            </div>
          </form>
        </div>

        {/* Notifications */}
        <div className="bg-[#050505] border border-white/[0.08] shadow-xl rounded-2xl p-6 sm:p-8 opacity-0">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-white/50" />
            <h2 className="text-lg font-bold text-white">Notifications</h2>
          </div>
          <div className="space-y-6">
            {[
              { key: 'email' as const, label: 'Email Updates', desc: 'Receive news and product updates' },
              { key: 'orders' as const, label: 'Order Alerts', desc: 'Get notified about order status changes' },
              { key: 'promotions' as const, label: 'Promotions', desc: 'Receive promotional offers and discounts' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between border-b border-white/[0.04] pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-bold text-white mb-1">{item.label}</p>
                  <p className="text-xs text-white/40">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-300 pointer cursor-pointer ${notifications[item.key] ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'bg-white/10 border border-white/20'}`}
                  aria-label={`Toggle ${item.label}`}
                  data-hover
                >
                  <div className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full transition-transform duration-300 ${notifications[item.key] ? 'translate-x-[20px] bg-black' : 'translate-x-0 bg-white/40'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#050505] border border-danger/30 shadow-xl rounded-2xl p-6 sm:p-8 relative overflow-hidden opacity-0">
          <div className="absolute inset-0 bg-danger/5" />
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-white mb-2">Danger Zone</h2>
            <p className="text-sm text-white/50 mb-6 font-light">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setShowDeleteModal(true)} className="shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
        <p className="text-sm text-white/50 mb-8 font-light leading-relaxed">
          Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
        </p>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={() => { setShowDeleteModal(false); toast.success('Account deleted'); }} className="flex-1 shadow-[0_0_15px_rgba(239,68,68,0.3)]">Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
