import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatNaira } from '../utils/helpers'

const SERVICES = [
  { icon: '🧺', name: 'Wash & Fold',   price: 500,  unit: 'per item', desc: 'Daily wear cleaned, dried, and neatly folded. Perfect for your busy schedule.', features: ['Color separation', 'Neat folding', 'Same-day available'] },
  { icon: '👔', name: 'Wash & Iron',   price: 500, unit: 'per item', desc: 'Washed, dried, and professionally steam-pressed for a crisp, store-bought finish.', features: ['Professional pressing', 'Eco-friendly detergents', '24-48h turnaround'] },
  { icon: '✨', name: 'Dry Cleaning',  price: 500, unit: 'per item', desc: 'Expert care for suits, silk, and formal garments using eco-safe solvents.', features: ['Eco-safe solvents', 'Hanger delivery', 'Stain treatment'] },
]

const HOW_STEPS = [
  { n: '01', icon: 'phone_iphone', title: 'Book Online', desc: 'Choose your service, select items, and pick a convenient drop-off date and time.' },
  { n: '02', icon: 'confirmation_number', title: 'Get Receipt', desc: 'Receive email confirmation with a unique Booking ID and a downloadable PDF receipt.' },
  { n: '03', icon: 'storefront', title: 'Drop Off', desc: 'Bring your clothes to LASU Viva Laundromat with your receipt or booking ID.' },
  { n: '04', icon: 'notifications_active', title: 'Pick Up', desc: 'We email you the moment your clothes are ready. Collect them at your convenience.' },
]

const FEATURES = [
  { icon: '🌿', title: 'Eco-Friendly', desc: 'Non-toxic, biodegradable detergents gentle on fabrics and safe for the environment.' },
  { icon: '⚡', title: 'Fast Turnaround', desc: 'Standard service returns your clothes within 24-48 hours. Express options available.' },
  { icon: '₦',  title: 'Naira Pricing', desc: 'Transparent pricing in Naira. No hidden fees or surprise surcharges — ever.' },
  { icon: '📧', title: 'Email Updates', desc: 'Automatic email when your booking is confirmed and again when clothes are ready.' },
  { icon: '💳', title: 'Flexible Payment', desc: 'Pay online with Verve/Mastercard via Paystack, or pay cash at the service counter.' },
  { icon: '🛡️', title: 'Secure Platform', desc: 'JWT authentication, SSL encryption, and Paystack-secured payment processing.' },
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="bg-white">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-white pt-16 pb-24">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 60%, #2f7bf7 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1a5edb 0%, transparent 40%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <div className="section-tag mb-4">🎓 LASU Campus Laundry Service</div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6 font-display">
                Fresh clothes,<br />
                <span className="text-primary-600">zero effort.</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                Professional laundry and dry cleaning service right on the LASU campus. Book online, drop off your clothes, and pick them up fresh — we'll email you when they're ready.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link to={isAuthenticated ? '/services' : '/auth/register'} className="btn-primary text-base px-8 py-4">
                  <span className="material-symbols-outlined">local_laundry_service</span>
                  Book Your First Wash
                </Link>
                <a href="#how-it-works" className="btn-outline text-base px-8 py-4">
                  How It Works
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['A','B','C','D'].map(l => (
                    <div key={l} className="w-8 h-8 rounded-full bg-primary-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">{l}</div>
                  ))}
                </div>
                <p className="text-sm text-slate-600"><strong className="text-slate-900">500+ students</strong> trust LASU Viva every month</p>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-2xl shadow-primary-600/20">
                <span style={{ fontSize: 140 }}>🧺</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-card-lg px-5 py-4 flex items-center gap-3 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600">schedule</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">24-Hour Turnaround</div>
                  <div className="text-xs text-slate-500">Fastest on LASU campus</div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-card-lg px-4 py-3 border border-slate-100">
                <div className="text-xs text-slate-500 font-semibold mb-1">Today's Bookings</div>
                <div className="text-2xl font-bold text-primary-600 font-display">47</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────────────────────── */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-tag">Our Services</div>
            <h2 className="text-4xl font-bold text-slate-900 mt-3 mb-4 font-display">Comprehensive care for every fabric</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">From everyday wear to your most delicate garments, we handle it all.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <div key={s.name} className="card-hover p-7 flex flex-col">
                <div className="text-5xl mb-5">{s.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">{s.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-1">{s.desc}</p>
                <ul className="space-y-2 mb-6">
                  {s.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="pt-5 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">From</div>
                  <div className="text-2xl font-bold text-primary-600 font-display">{formatNaira(s.price)} <span className="text-sm font-normal text-slate-400">/ {s.unit}</span></div>
                  <Link to={isAuthenticated ? '/services' : '/auth/register'}
                    className="btn-outline mt-4 text-sm w-full justify-center">
                    Select Service →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary-900/60 text-primary-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Process</div>
            <h2 className="text-4xl font-bold text-white font-display mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Four simple steps to fresh, clean clothes — every time.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_STEPS.map((s, i) => (
              <div key={s.n} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-600/40">
                  <span className="material-symbols-outlined text-white text-2xl">{s.icon}</span>
                </div>
                <div className="text-xs font-bold text-primary-400 mb-2 tracking-widest">STEP {s.n}</div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="section-tag">Why LASU Viva</div>
            <h2 className="text-4xl font-bold text-slate-900 font-display mt-3 mb-4">Why Choose Us?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-6 flex gap-4">
                <div className="text-3xl flex-shrink-0 mt-0.5">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 font-display">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4 font-display">Ready for fresh clothes?</h2>
          <p className="text-primary-200 text-lg mb-8">Join 500+ LASU students who trust us with their laundry every week.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={isAuthenticated ? '/services' : '/auth/register'}
              className="bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors shadow-lg text-base">
              Get Started Free →
            </Link>
            <Link to="/auth/login"
              className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-base">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
