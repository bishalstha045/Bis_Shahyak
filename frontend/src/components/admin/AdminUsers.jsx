import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  X,
  Award
} from 'lucide-react';
import {
  getAdminUsers,
  updateAdminUserStatus,
  deleteAdminUser
} from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Confirmation Modal State for Destructive Actions
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'suspend' | 'activate' | 'delete'
    user: null
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // User Details Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers({
        search: searchQuery,
        role: roleFilter,
        status: statusFilter
      });
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load users directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchUsers();
  };

  // Trigger Confirmation
  const promptAction = (user, type) => {
    setConfirmModal({
      isOpen: true,
      type,
      user
    });
  };

  // Execute Confirmed Action
  const handleExecuteAction = async () => {
    const { type, user } = confirmModal;
    if (!user) return;
    const userId = user._id || user.id;

    setIsProcessing(true);
    try {
      if (type === 'suspend' || type === 'activate') {
        const targetStatus = type === 'suspend' ? 'suspended' : 'active';
        await updateAdminUserStatus(userId, targetStatus);
        showToast(`User account status changed to ${targetStatus}.`);
        setUsers(prev => prev.map(u => (u._id === userId || u.id === userId) ? { ...u, status: targetStatus } : u));
      } else if (type === 'delete') {
        await deleteAdminUser(userId);
        showToast(`User account archived.`);
        setUsers(prev => prev.filter(u => u._id !== userId && u.id !== userId));
      }
      setConfirmModal({ isOpen: false, type: null, user: null });
    } catch (err) {
      showToast(err.message || "Action failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 animate-fade-in ${
          toast.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
            : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            User & Enterprise Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Directory of registered MSME manufacturers, industry applicants, and regulatory officers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#0d1424] hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by full name, company name, or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#090e1c] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-bold">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#090e1c] border border-slate-700 text-slate-200 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Users / Manufacturers</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#090e1c] border border-slate-700 text-slate-200 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={26} className="text-blue-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading user records...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <AlertTriangle size={28} className="text-rose-400 mx-auto" />
            <p className="text-xs font-bold text-rose-300">{error}</p>
            <button
              type="button"
              onClick={fetchUsers}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
              <Users size={26} />
            </div>
            <h3 className="text-sm font-bold text-white">No Users Found</h3>
            <p className="text-xs text-slate-400">
              No registered user accounts match the current filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#090e1c]/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">User Identity</th>
                  <th className="py-3.5 px-4">Company & Sector</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                {users.map((u) => {
                  const id = u._id || u.id;
                  const isAdmin = u.is_admin === true || (u.role || '').toLowerCase() === 'admin';
                  const isSuspended = u.status === 'suspended';

                  return (
                    <tr key={id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-900/60 text-blue-300 font-bold flex items-center justify-center shrink-0 border border-blue-700/50 text-[11px]">
                            {u.full_name ? u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{u.full_name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-200">{u.company_name || 'Individual'}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{u.sector || 'MSME General'}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAdmin
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                            : 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                        }`}>
                          {isAdmin ? 'Administrator' : 'User / MSME'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSuspended
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        }`}>
                          {isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 shrink-0">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Details
                          </button>

                          {!isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => promptAction(u, isSuspended ? 'activate' : 'suspend')}
                                className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors cursor-pointer ${
                                  isSuspended
                                    ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/60'
                                    : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/60 border border-amber-800/60'
                                }`}
                              >
                                {isSuspended ? 'Activate' : 'Suspend'}
                              </button>

                              <button
                                type="button"
                                onClick={() => promptAction(u, 'delete')}
                                className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                title="Soft-delete user account"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="w-full max-w-lg bg-[#0d1424] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-black flex items-center justify-center text-sm">
                  {selectedUser.full_name ? selectedUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{selectedUser.full_name}</h3>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Enterprise Information</span>
                <p className="font-bold text-slate-200">{selectedUser.company_name || 'Independent MSME'}</p>
                <p className="text-slate-400">{selectedUser.enterprise_category || 'MSME - Small Enterprise'}</p>
                <p className="text-slate-400">Sector: {selectedUser.sector || 'General'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">GSTIN</span>
                  <p className="font-mono text-slate-200">{selectedUser.gstin || 'Unspecified'}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Phone</span>
                  <p className="text-slate-200">{selectedUser.phone || 'None'}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Account Status</span>
                  <p className="font-bold text-white capitalize">{selectedUser.status || 'Active'}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedUser.status === 'suspended'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {selectedUser.status === 'suspended' ? 'Suspended' : 'In Good Standing'}
                </span>
              </div>
            </div>

            <div className="pt-2 text-right border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Destructive Actions (Delete / Suspend) */}
      {confirmModal.isOpen && confirmModal.user && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="w-full max-w-md bg-[#0d1424] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                confirmModal.type === 'delete'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {confirmModal.type === 'delete' ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div>
                <h3 className="text-base font-black text-white capitalize">
                  {confirmModal.type} User Account?
                </h3>
                <p className="text-xs text-slate-400">{confirmModal.user.full_name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.type === 'delete'
                ? `This action will archive the account for "${confirmModal.user.full_name}" (${confirmModal.user.email}). The record will be soft-deleted and cannot be recovered by the user.`
                : confirmModal.type === 'suspend'
                ? `Suspending this account will temporarily prevent "${confirmModal.user.full_name}" from logging in and submitting compliance dossiers.`
                : `Activating this account will restore full portal access for "${confirmModal.user.full_name}".`
              }
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: null, user: null })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-xl text-white transition-all cursor-pointer disabled:opacity-50 ${
                  confirmModal.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : confirmModal.type === 'suspend'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isProcessing ? 'Executing...' : `Confirm ${confirmModal.type}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
