import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Search } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, type AdminUser } from '@/lib/services/admin.service';
import { Loader2 } from 'lucide-react';

const ManageUsers = () => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLTableRowElement | null)[]>([]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getUsers,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: 'active' | 'banned' } }) => adminService.updateUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const filtered = users.filter(
    (u: AdminUser) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBan = (userId: string, currentStatus: string) => {
    updateUserMutation.mutate({
      id: userId,
      data: { status: currentStatus === 'banned' ? 'active' : 'banned' },
    });
  };

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    const activeRows = rowsRef.current.filter(Boolean);
    if (activeRows.length > 0) {
      gsap.fromTo(activeRows,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [search, filtered.length]);

  return (
    <div ref={containerRef} className="opacity-0">
      <h1 className="text-2xl font-bold text-white mb-8 tracking-tight">Manage Users</h1>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-11 pr-4 bg-[#050505] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 shadow-inner group-hover:border-white/20 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-[#050505] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 text-white/30 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">User</th>
                  <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Email</th>
                  <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Role</th>
                  <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Joined</th>
                  <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Status</th>
                  <th className="text-left font-semibold py-4 px-5 text-xs text-white/40 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user: AdminUser, i: number) => (
                  <tr key={user.id} ref={(el) => { rowsRef.current[i] = el; }} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center text-sm font-bold shadow-inner">
                          {getInitials(user.name)}
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-white/90">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-sm font-medium text-white/50">{user.email}</td>
                    <td className="py-4 px-5">
                      <Badge variant={user.role === 'admin' ? 'default' : 'info'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-sm font-medium text-white/40">{formatDate(user.joinedAt)}</td>
                    <td className="py-4 px-5">
                      <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                        {user.status || 'active'}
                      </Badge>
                    </td>
                    <td className="py-4 px-5">
                      <Button
                        variant={user.status === 'banned' ? 'secondary' : 'danger'}
                        size="sm"
                        onClick={() => toggleBan(user.id, user.status)}
                        className={user.status === 'banned' ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-danger/10 text-danger hover:bg-danger/20 border-danger/20'}
                      >
                        {user.status === 'banned' ? 'Unban' : 'Ban'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-16 w-16 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4">
              <span className="text-white/20 text-2xl">👥</span>
            </div>
            <p className="text-base text-white/60 font-medium">No users found.</p>
            <p className="text-sm text-white/30 mt-1">Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
