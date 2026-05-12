import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white">local_laundry_service</span>
              </div>
              <div>
                <div className="text-white font-bold text-lg font-display">LASU Viva Laundromat</div>
                <div className="text-xs text-primary-400">Lagos State University</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Professional laundry services at Lagos State University. Fast, reliable, and affordable right on campus.
            </p>
            <div className="flex gap-3 mt-5">
              {['twitter', 'instagram', 'facebook'].map(s => (
                <a key={s} href="#"
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-sm">{s === 'twitter' ? 'close' : s === 'instagram' ? 'photo_camera' : 'thumb_up'}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">App</h4>
            {[['/', 'Home'], ['/services', 'Services'], ['/bookings', 'My Bookings'], ['/dashboard', 'Dashboard']].map(([to, label]) => (
              <Link key={to} to={to} className="block text-sm hover:text-white transition-colors mb-2.5">{label}</Link>
            ))}
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Support</h4>
            {[['Help Center', '#'], ['Contact Us', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#']].map(([label, to]) => (
              <a key={label} href={to} className="block text-sm hover:text-white transition-colors mb-2.5">{label}</a>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© 2026 LASU Viva Laundromat. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
