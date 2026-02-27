import { useState } from 'react';
import { Search } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { users } from '@/lib/mockData';
import type { User } from '@/types';

const ManageUsers = () => {
  const [userList, setUserList] = useState<User[]>(users);
  const [search, setSearch] = useState('');

  const filtered = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBan = (userId: string) => {
    setUserList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' }
          : u
      )
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Manage Users</h1>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-3 bg-[#0A0A0A] border border-white/[0.06] rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">User</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Email</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Role</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Joined</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-white/30">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-bold">
                        {getInitials(user.name)}
                      </div>
                      <span className="text-sm font-medium text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-white/40">{user.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={user.role === 'admin' ? 'default' : 'info'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-white/40">{formatDate(user.joinedAt)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                      {user.status || 'active'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant={user.status === 'banned' ? 'secondary' : 'danger'}
                      size="sm"
                      onClick={() => toggleBan(user.id)}
                    >
                      {user.status === 'banned' ? 'Unban' : 'Ban'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-sm text-white/30 text-center py-8">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
