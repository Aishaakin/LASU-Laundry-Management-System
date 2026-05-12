import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { bookingService } from '../services/bookingService'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [pwdMode, setPwdMode] = useState(false)
  const [notifications, setNotifications] = useState(user?.notifications_enabled ?? true)

  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: bookingService.getDashboardStats })

  const { register: reg, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { first_name: user?.first_name, last_name: user?.last_name, phone_number: user?.phone_number, bio: user?.bio }
  })
  const { register: regPwd, handleSubmit: handlePwd, watch, reset: resetPwd } = useForm()

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => { updateUser(data); setEditMode(false); toast.success('Profile updated!') },
    onError: () => toast.error('Could not update profile.'),
  })

  const { mutate: changePassword, isPending: changing } = useMutation({
    mutationFn: ({ current, newPwd }) => authService.changePassword(current, newPwd),
    onSuccess: () => { resetPwd(); setPwdMode(false); toast.success('Password changed!') },
    onError: () => toast.error('Current password is incorrect.'),
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 font-display">My Profile</h1>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-primary-100">
              {user?.first_name?.[0] || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full border-2 border-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-sm">photo_camera</span>
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">{user?.first_name} {user?.last_name}</h2>
            <p className="text-slate-500 text-sm">Member since {user?.member_since || '2024'}</p>
            <div className="flex gap-2 mt-3 justify-center sm:justify-start">
              <button onClick={() => setEditMode(!editMode)} className="btn-primary text-sm py-2">
                <span className="material-symbols-outlined text-sm">edit</span> Edit Profile
              </button>
              <button onClick={logout} className="btn-ghost text-sm py-2 text-red-600">
                <span className="material-symbols-outlined text-sm">logout</span> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: stats?.total_orders || 0, label: 'Total Orders' },
            { val: stats?.completed_orders || 0, label: 'Completed' },
            { val: stats?.status || 'Basic', label: 'Status' },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <div className="text-2xl font-bold text-primary-600 font-display">{s.val}</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form */}
      {editMode && (
        <div className="card p-6 animate-slide-up">
          <h3 className="font-bold text-slate-900 mb-5 font-display">Edit Profile</h3>
          <form onSubmit={handleSubmit(saveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="input-label">First Name</label><input className="input" {...reg('first_name', { required: true })} /></div>
              <div><label className="input-label">Last Name</label><input className="input" {...reg('last_name', { required: true })} /></div>
            </div>
            <div><label className="input-label">Phone Number</label><input className="input" {...reg('phone_number')} /></div>
            <div><label className="input-label">Bio</label><textarea rows={3} className="input resize-none" {...reg('bio')} /></div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" onClick={() => setEditMode(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Personal details (read) */}
      {!editMode && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900 font-display">Personal Details</h3></div>
          <div className="divide-y divide-slate-100">
            {[
              { icon: 'mail', label: 'Email', val: user?.email },
              { icon: 'call', label: 'Phone', val: user?.phone_number || '—' },
              { icon: 'person_outline', label: 'Bio', val: user?.bio || '—' },
            ].map(d => (
              <div key={d.label} className="flex items-center gap-4 px-6 py-4">
                <span className="material-symbols-outlined text-slate-400 text-xl">{d.icon}</span>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{d.label}</div>
                  <div className="text-sm text-slate-700 mt-0.5">{d.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferences */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-900 font-display">App Preferences</h3></div>
        {[
          { icon: 'notifications', label: 'Email Notifications', desc: 'Order status and pickup reminders', val: notifications, set: setNotifications },
        ].map(p => (
          <div key={p.label} className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">{p.icon}</span>
              <div><div className="font-semibold text-sm text-slate-800">{p.label}</div><div className="text-xs text-slate-500">{p.desc}</div></div>
            </div>
            <button onClick={() => p.set(!p.val)}
              className={`w-11 h-6 rounded-full transition-colors relative ${p.val ? 'bg-primary-600' : 'bg-slate-200'}`}>
              <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${p.val ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Password */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 font-display">Password & Security</h3>
          <button onClick={() => setPwdMode(!pwdMode)} className="text-sm text-primary-600 font-semibold hover:underline">
            {pwdMode ? 'Cancel' : 'Change'}
          </button>
        </div>
        {pwdMode ? (
          <form onSubmit={handlePwd(d => changePassword({ current: d.current, newPwd: d.newPwd }))} className="p-6 space-y-4">
            <div><label className="input-label">Current Password</label><input type="password" className="input" {...regPwd('current', { required: true })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="input-label">New Password</label><input type="password" className="input" {...regPwd('newPwd', { required: true, minLength: 8 })} /></div>
              <div><label className="input-label">Confirm New</label><input type="password" className="input" {...regPwd('confirm', { validate: v => v === watch('newPwd') || 'Must match' })} /></div>
            </div>
            <button type="submit" disabled={changing} className="btn-primary">{changing ? 'Updating...' : 'Update Password'}</button>
          </form>
        ) : (
          <div className="px-6 py-4 text-sm text-slate-500">Click "Change" to update your password.</div>
        )}
      </div>
    </div>
  )
}
