import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Camera, Bell, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { profileSchema, passwordChangeSchema, type ProfileFormData, type PasswordChangeFormData } from '@/lib/validators';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

const Settings = () => {
  const user = useAuthStore((s) => s.user);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    orders: true,
    promotions: false,
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
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
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 mb-6"
      >
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-white/10 text-white flex items-center justify-center text-2xl font-bold">
              {user ? getInitials(user.name) : 'U'}
            </div>
            <button
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-white/90 transition-all"
              aria-label="Upload avatar"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
            <p className="text-sm text-white/40">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <Input label="Full Name" error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
          <Input label="Email" type="email" error={profileForm.formState.errors.email?.message} {...profileForm.register('email')} />
          <Input label="Phone" placeholder="+1 (555) 000-0000" {...profileForm.register('phone')} />
          <Button type="submit">Save Changes</Button>
        </form>
      </motion.div>

      {/* Password */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-white/30" />
          <h2 className="text-lg font-semibold text-white">Change Password</h2>
        </div>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <Input label="Current Password" type="password" error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
          <Input label="New Password" type="password" error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
          <Input label="Confirm New Password" type="password" error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
          <Button type="submit" variant="secondary">Update Password</Button>
        </form>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-white/30" />
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: 'email' as const, label: 'Email Updates', desc: 'Receive news and product updates' },
            { key: 'orders' as const, label: 'Order Alerts', desc: 'Get notified about order status changes' },
            { key: 'promotions' as const, label: 'Promotions', desc: 'Receive promotional offers and discounts' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-white/30">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`relative h-6 w-11 rounded-full transition-colors ${notifications[item.key] ? 'bg-white' : 'bg-white/10'}`}
                aria-label={`Toggle ${item.label}`}
              >
                <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform ${notifications[item.key] ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white/40'}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#0A0A0A] border border-danger/20 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-2">Danger Zone</h2>
        <p className="text-sm text-white/40 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setShowDeleteModal(true)}>
          Delete Account
        </Button>
      </motion.div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
        <p className="text-sm text-white/40 mb-6">
          Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={() => { setShowDeleteModal(false); toast.success('Account deleted'); }} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
