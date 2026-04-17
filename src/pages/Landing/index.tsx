import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Check } from 'lucide-react'
import LaserFlow from '../../components/ui/LaserFlow'
import s from './Landing.module.css'

/* ── SCROLL REVEAL ─────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-r]')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.1 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ── ANIMATED COUNTER ──────────────────────────────────── */
function AnimCount({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return
      done.current = true
      io.disconnect()
      let cur = 0
      const step = to / 70
      const t = setInterval(() => {
        cur = Math.min(cur + step, to)
        setVal(Math.round(cur))
        if (cur >= to) clearInterval(t)
      }, 20)
    }, { threshold: 0.5 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString()}<span className={s.numValAccent}>{suffix}</span></span>
}

/* ── MAGNETIC BUTTON ───────────────────────────────────── */
function Mag({ children }: { children: React.ReactNode }) {
  const r = useRef<HTMLDivElement>(null)
  return (
    <div ref={r}
      style={{ display: 'inline-flex', transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)' }}
      onMouseMove={e => { const rect = r.current!.getBoundingClientRect(); const dx = (e.clientX - rect.left - rect.width / 2) * 0.22; const dy = (e.clientY - rect.top - rect.height / 2) * 0.22; r.current!.style.transform = `translate(${dx}px,${dy}px)` }}
      onMouseLeave={() => { r.current!.style.transform = '' }}
    >{children}</div>
  )
}

/* ── IMAGE BOX ─────────────────────────────────────────── */
function Img({ icon, label, h = 500, color = '#5A9690', hOff = 0 }: { icon: string; label: string; h?: number; color?: string; hOff?: number }) {
  return (
    <div className={s.imgBox} style={{ minHeight: h }}>
      <div className={s.imgBoxLaser}>
        <LaserFlow color={color} horizontalBeamOffset={hOff} wispDensity={1.2} wispSpeed={14} wispIntensity={4.5} flowSpeed={0.3} flowStrength={0.2} fogIntensity={0.4} fogScale={0.3} decay={1.15} falloffStart={1.1} />
      </div>
      <div className={s.imgBoxInner}>
        <div className={s.imgBoxRing}>{icon}</div>
        <p className={s.imgBoxLabel}>{label}</p>
      </div>
    </div>
  )
}

/* ── DATA ──────────────────────────────────────────────── */
const TICKER_ITEMS = [
  'Hotel Management', 'Room Bookings', 'Guest Directory', 'Kitchen Display',
  'Order Tracking', 'GST Invoicing', 'Floor Plans', 'Revenue Analytics',
  'Multi-Property', 'Role-Based Access', 'Supabase Powered', 'Real-Time Sync',
]

const BENTO = [
  { col: 'col7 row2', em: '🏨', title: 'Hotel Operations, Perfected', desc: 'Visual room grids, instant check-in/out, guest history, and finance tracking — everything a front desk needs in one screen.', badge: 'Hotel' },
  { col: 'col5', em: '📊', title: 'Live Analytics', desc: 'Revenue trends, occupancy rates, and KPIs — updated in real time.' },
  { col: 'col5', em: '🔐', title: 'Role-Based Access', desc: 'Hotel Admin, Restaurant Admin, or Hybrid — secure logins for every team.' },
  { col: 'col3', em: '⚡', title: 'Realtime KDS', desc: 'Kitchen display that auto-routes orders as they arrive.' },
  { col: 'col3', em: '🧾', title: 'GST Invoices', desc: 'CGST + SGST split, auto-calculated and print-ready.' },
  { col: 'col6', em: '🍽️', title: 'Restaurant Module', desc: 'Table floor plan, live orders, menu management, kitchen view, and billing — one complete system.' },
]

const HOTEL_LIST = ['Visual room grid & status cycling', 'Check-in / check-out in one tap', 'Guest history & VIP tagging', 'Finance tracker with transaction log', 'Multi-payment support']
const REST_LIST = ['Visual floor plan with table status', 'Live order creation from menu', 'Real-time kitchen display system', 'GST-ready bill generation', 'Category-based menu management']

const TESTIS = [
  { q: 'HospitalityHub changed everything for our boutique hotel. The room grid alone saves us 2 hours a day. Absolutely worth it.', name: 'Priya Kapoor', role: 'Owner — The Lakeview Inn, Nainital', av: 'P', bg: 'linear-gradient(135deg,#2F5755,#5A9690)' },
  { q: 'Our kitchen throughput went up 40% in the first week. Cooks always know what to make — zero confusion, zero errors.', name: 'Chef Arjun Mehta', role: 'Executive Chef — Spice Route, Mumbai', av: 'A', bg: 'linear-gradient(135deg,#432323,#6b3535)' },
  { q: 'Running a resort + restaurant, I needed one system. This is it. The hybrid dashboard is exactly what I was dreaming of.', name: 'Sunita Rao', role: 'Founder — Serene Stay & Dine, Goa', av: 'S', bg: 'linear-gradient(135deg,#1a3a2a,#2d6645)' },
]

const PLANS = [
  { name: 'Starter', price: '₹0', per: 'Free forever', feats: ['1 property', '10 rooms or 5 tables', 'Basic orders & bookings', '1 admin user', 'Email support'], hot: false },
  { name: 'Pro', price: '₹2,499', per: '/month · billed annually', feats: ['3 properties', 'Unlimited rooms & tables', 'Full analytics', 'GST invoices + KDS', '5 admin users', 'Priority support'], hot: true },
  { name: 'Enterprise', price: '₹5,999', per: '/month · billed annually', feats: ['Unlimited properties', 'Hotel + Restaurant (Hybrid)', 'AI insights (soon)', 'White-label branding', 'Unlimited admins', 'Dedicated manager', 'API access'], hot: false },
]

/* ── MAIN ──────────────────────────────────────────────── */
export default function Landing() {
  useScrollReveal()
  const [navVisible, setNavVisible] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const h = () => {
      const heroH = heroRef.current?.offsetHeight ?? window.innerHeight
      setNavVisible(window.scrollY > heroH * 0.6)
    }
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <div className={s.lp}>
      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className={`${s.nav} ${navVisible ? s.navVisible : ''}`}>
        <Link to="/" className={s.logo}>
          <div className={s.logoMark}>H</div>
          <span className={s.logoName}>HospitalityHub</span>
        </Link>
        <ul className={s.navLinks}>
          <li><a href="#features">Features</a></li>
          <li><a href="#hotel">Hotel</a></li>
          <li><a href="#restaurant">Restaurant</a></li>
          <li><Link to="/pricing">Pricing</Link></li>
        </ul>
        <div className={s.navCta}>
          <Link to="/login" className={s.btnOutline}>Sign In</Link>
          <Mag><Link to="/signup" className={s.btnWhite}>Get Started <ArrowRight size={14} /></Link></Mag>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════
           HERO
         ══════════════════════════════════════════════════ */}
      <section className={s.hero} ref={heroRef}>
        <div className={s.heroBg}>
          <div className={s.heroGrid} />
          <div className={s.heroVignette} />
          <div className={s.heroGlowL} />
          <div className={s.heroGlowR} />
        </div>

        {/* TOP: eyebrow + headline + subrow CTA */}
        <div className={s.heroInner}>
          <div className={s.heroPill}>
            <span className={s.heroPillDot} />
            All-in-One Hospitality Platform · India
          </div>

          <h1 className={s.heroH1}>
            Hotel &amp; Restaurant<br />
            <span className={s.heroH1Teal}>made effortless.</span>
          </h1>

          <div className={s.heroSubRow}>
            <p className={s.heroSub}>
              One dashboard. Every operation. Built for Indian hotels and restaurants that refuse to compromise.
            </p>
            <div className={s.heroBtns}>
              <Mag><Link to="/signup" className={s.btnCta}>Start for Free <ArrowRight size={15} /></Link></Mag>
              <Link to="/login" className={s.btnCtaGhost}><Play size={13} fill="currentColor" /> Live Demo</Link>
            </div>
          </div>
        </div>

        {/* BOTTOM: Image placeholder zone */}
        <div className={s.heroImgWrap}>
          <div className={s.heroImgFrame}>
            {/* Browser chrome bar */}
            <div className={s.heroImgBar}>
              <div className={`${s.dot} ${s.dotR}`} />
              <div className={`${s.dot} ${s.dotY}`} />
              <div className={`${s.dot} ${s.dotG}`} />
              <div className={s.heroImgUrlBar}>
                <div className={s.heroImgUrl}>app.hospitalityhub.in</div>
              </div>
            </div>

            {/* Placeholder centre */}
            <div className={s.heroImgPlaceholder}>
              <div className={s.heroImgPlaceholderIcon}>🏨</div>
              <p className={s.heroImgPlaceholderText}>Dashboard screenshot coming soon</p>
            </div>

            {/* Floating stat badges */}
            <div className={`${s.heroImgBadge} ${s.heroImgBadgeL}`}>
              <span className={s.heroImgBadgeIcon}>📈</span>
              <div className={s.heroImgBadgeInfo}>
                <div className={s.heroImgBadgeVal}>₹1.4L</div>
                <div className={s.heroImgBadgeLbl}>Today's Revenue</div>
              </div>
            </div>
            <div className={`${s.heroImgBadge} ${s.heroImgBadgeR}`}>
              <span className={s.heroImgBadgeIcon}>🛏️</span>
              <div className={s.heroImgBadgeInfo}>
                <div className={s.heroImgBadgeVal}>87%</div>
                <div className={s.heroImgBadgeLbl}>Occupancy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ───────────────────────────────────────── */}
      <div className={s.ticker}>
        <div className={s.tickerFade + ' ' + s.tickerFadeL} />
        <div className={s.tickerFade + ' ' + s.tickerFadeR} />
        <div className={s.tickerTrack}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className={s.tickerItem}>
              {item}
              <span className={s.tickerSep}>·</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
           NUMBERS
         ══════════════════════════════════════════════════ */}
      <section className={s.sec}>
        <div className={s.numbers} data-r>
          {[
            { val: 2400, suf: '+', label: 'Hotels & restaurants across India' },
            { val: 98, suf: '%', label: 'Customer satisfaction score' },
            { val: 450, suf: 'K+', label: 'Orders processed monthly' },
            { val: 99.9, suf: '%', label: 'Platform uptime SLA' },
          ].map((n, i) => (
            <div key={i} className={s.numItem} data-r data-d={String(i + 1)}>
              <div className={s.numVal}><AnimCount to={n.val} suffix={n.suf} /></div>
              <div className={s.numLabel}>{n.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className={s.glowLine} />

      {/* ══════════════════════════════════════════════════
           STATEMENT — BIG TYPOGRAPHY
         ══════════════════════════════════════════════════ */}
      <section className={s.statement} data-r>
        <div className={s.statementText}>
          <span className={`${s.statementLine} ${s.statementLineMuted}`}>Stop juggling</span>
          <span className={`${s.statementLine} ${s.statementLineWhite}`}>five tools.</span>
          <span className={`${s.statementLine} ${s.statementLineTeal}`}>Use one.</span>
        </div>
      </section>

      <div className={s.glowLine} />

      {/* ══════════════════════════════════════════════════
           FEATURES BENTO
         ══════════════════════════════════════════════════ */}
      <section className={s.sec} id="features">
        <div className={s.secInr}>
          <div data-r>
            <div className={s.secEye}><span className={s.secEyeDash} /> Platform</div>
            <h2 className={s.secH2}>Everything<br /><span style={{ color: 'rgba(255,255,255,0.2)' }}>you need.</span></h2>
          </div>
          <div className={s.bento}>
            {BENTO.map((b, i) => {
              const colClasses = b.col.split(' ').map(c => s[c] || '').join(' ')
              return (
                <div key={i} className={`${s.bentoCell} ${colClasses}`} data-r data-d={String((i % 4) + 1)}>
                  {b.badge && <span className={s.bentoBadge}>{b.badge}</span>}
                  <div className={s.bentoEmo}>{b.em}</div>
                  <div className={s.bentoT}>{b.title}</div>
                  <p className={s.bentoD}>{b.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
           HOTEL MODULE
         ══════════════════════════════════════════════════ */}
      <section className={s.sec} id="hotel" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className={s.secInr}>
          <div className={s.modBlock}>
            <div>
              <div className={s.modLabel} data-r>🏨 Hotel Module</div>
              <h2 className={s.modH} data-r>Every room.<br />Every guest.<br />Zero chaos.</h2>
              <p className={s.modP} data-r>From walk-in to check-out, the hotel module handles your entire front desk workflow — no training, no spreadsheets.</p>
              <div className={s.modList}>
                {HOTEL_LIST.map((f, i) => (
                  <div key={i} className={s.modListItem} data-r data-d={String(i + 1)}>
                    <span className={s.modCheck}>✓</span>{f}
                  </div>
                ))}
              </div>
              <div data-r>
                <Mag><Link to="/signup" className={s.modBtn}>Explore Hotel Module <ArrowRight size={14} /></Link></Mag>
              </div>
            </div>
            <div data-r>
              <Img icon="🛏️" label="Hotel dashboard — screenshot coming soon" h={560} color="#5A9690" hOff={0.05} />
            </div>
          </div>
        </div>
      </section>

      {/* ── MINI STATEMENT ─────────────────────────────── */}
      <section className={s.statement} style={{ padding: 'clamp(60px,7vw,100px) 48px' }} data-r>
        <div className={s.statementText} style={{ fontSize: 'clamp(36px,6vw,100px)' }}>
          <span className={s.statementLine} style={{ color: 'rgba(255,255,255,0.18)' }}>Restaurant too?</span>
          <span className={`${s.statementLine} ${s.statementLineWhite}`}>We've got you.</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
           RESTAURANT MODULE
         ══════════════════════════════════════════════════ */}
      <section className={s.sec} id="restaurant">
        <div className={s.secInr}>
          <div className={`${s.modBlock} ${s.modBlockRev}`}>
            <div>
              <div className={s.modLabel} data-r>🍽️ Restaurant Module</div>
              <h2 className={s.modH} data-r>Table to kitchen<br />to billing —<br />seamlessly.</h2>
              <p className={s.modP} data-r>Complete restaurant operations: floor plan, live orders, kitchen display, and GST bills. Your staff will never look back.</p>
              <div className={s.modList}>
                {REST_LIST.map((f, i) => (
                  <div key={i} className={s.modListItem} data-r data-d={String(i + 1)}>
                    <span className={s.modCheck}>✓</span>{f}
                  </div>
                ))}
              </div>
              <div data-r>
                <Mag><Link to="/signup" className={s.modBtn}>Explore Restaurant Module <ArrowRight size={14} /></Link></Mag>
              </div>
            </div>
            <div data-r>
              <Img icon="🍽️" label="Restaurant dashboard — screenshot coming soon" h={560} color="#c9a84c" hOff={-0.05} />
            </div>
          </div>
        </div>
      </section>

      <div className={s.glowLine} />

      {/* ══════════════════════════════════════════════════
           HOW IT WORKS (HORIZONTAL SCROLL CARDS)
         ══════════════════════════════════════════════════ */}
      <section className={s.sec} style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto 48px', padding: '0 48px' }}>
          <div data-r>
            <div className={s.secEye}><span className={s.secEyeDash} /> Process</div>
            <h2 className={s.secH2}>Up &amp; running<br /><span style={{ color: 'rgba(255,255,255,0.2)' }}>in minutes.</span></h2>
          </div>
        </div>
        <div className={s.hScrollWrap}>
          <div className={s.hScrollTrack}>
            {[
              { n: '01', t: 'Create Account', d: 'Sign up free — no credit card, no setup fee. 30 seconds.' },
              { n: '02', t: 'Choose Your Role', d: 'Hotel Admin, Restaurant Admin, or go Hybrid for both.' },
              { n: '03', t: 'Set Up Property', d: 'Add rooms, tables, menu items, and staff in minutes.' },
              { n: '04', t: 'Go Live Today', d: 'Start processing bookings, orders, and bills immediately.' },
              { n: '05', t: 'Scale as You Grow', d: 'Add properties, users, and features as your business expands.' },
            ].map((step, i) => (
              <div key={i} className={s.hScrollCard} data-r data-d={String(i + 1)}>
                <div className={s.hScrollNum}>{step.n}</div>
                <div className={s.hScrollT}>{step.t}</div>
                <p className={s.hScrollD}>{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
           ANALYTICS IMAGE BLOCK
         ══════════════════════════════════════════════════ */}
      <section className={s.sec} style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className={s.secInr}>
          <div className={s.modBlock}>
            <div data-r>
              <Img icon="📊" label="Analytics dashboard — screenshot coming soon" h={440} color="#e8c97e" hOff={0.1} />
            </div>
            <div>
              <div className={s.modLabel} data-r>📈 Analytics</div>
              <h2 className={s.modH} data-r>Insights that<br />move the needle.</h2>
              <p className={s.modP} data-r>Revenue charts, peak hours, top dishes, occupancy rates — all your KPIs in one beautiful live dashboard. No spreadsheets needed.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }} data-r>
                {['📈 Revenue Charts', '🕐 Peak Hour Analysis', '🏷️ Occupancy Rate', '🍴 Top Selling Items'].map((t, i) => (
                  <div key={i} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, transition: 'all 0.2s ease' }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
           HYBRID SECTION
         ══════════════════════════════════════════════════ */}
      <section className={s.sec}>
        <div className={s.secInr}>
          <div className={s.modBlock}>
            <div>
              <div className={s.modLabel} data-r>⚡ Hybrid Mode</div>
              <h2 className={s.modH} data-r>Hotel <span style={{ color: 'var(--teal-l)' }}>+</span><br />Restaurant.<br />One login.</h2>
              <p className={s.modP} data-r>Hybrid Admin lets you switch between hotel and restaurant dashboards with a single click — and see combined analytics across both.</p>
              <div data-r style={{ marginTop: '32px' }}>
                <Mag><Link to="/signup" className={s.modBtn}>Try Hybrid Mode <ArrowRight size={14} /></Link></Mag>
              </div>
            </div>
            <div data-r>
              <Img icon="⚡" label="Hybrid dashboard — screenshot coming soon" h={460} color="#7ec4be" hOff={0.0} />
            </div>
          </div>
        </div>
      </section>

      <div className={s.glowLine} />

      {/* ══════════════════════════════════════════════════
           TESTIMONIALS
         ══════════════════════════════════════════════════ */}
      <section className={s.sec} style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className={s.secInr}>
          <div data-r>
            <div className={s.secEye}><span className={s.secEyeDash} /> Reviews</div>
            <h2 className={s.secH2}>Operators<br /><span style={{ color: 'rgba(255,255,255,0.2)' }}>love it.</span></h2>
          </div>
          <div className={s.tesGrid} style={{ marginTop: '60px' }}>
            {TESTIS.map((t, i) => (
              <div key={i} className={s.tesCard} data-r data-d={String(i + 1)}>
                <span className={s.tesMark}>"</span>
                <div className={s.tesStars}>{Array(5).fill(0).map((_, j) => <span key={j} className={s.tesStar}>★</span>)}</div>
                <p className={s.tesQ}>"{t.q}"</p>
                <div className={s.tesAuthor}>
                  <div className={s.tesAva} style={{ background: t.bg }}>{t.av}</div>
                  <div>
                    <div className={s.tesName}>{t.name}</div>
                    <div className={s.tesRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
           PRICING
         ══════════════════════════════════════════════════ */}
      <section className={s.sec} id="pricing">
        <div className={s.secInr}>
          <div style={{ textAlign: 'center' }} data-r>
            <div className={s.secEye} style={{ justifyContent: 'center' }}><span className={s.secEyeDash} /> Pricing</div>
            <h2 className={s.secH2}>Simple.<br /><span style={{ color: 'rgba(255,255,255,0.2)' }}>Transparent.</span></h2>
            <p className={s.secP} style={{ margin: '20px auto 0', textAlign: 'center' }}>No hidden fees. Start free. Scale when you're ready.</p>
          </div>
          <div className={s.pricingGrid}>
            {PLANS.map((p, i) => (
              <div key={i} className={`${s.pricingCard} ${p.hot ? s.pricingFeatured : ''}`} data-r data-d={String(i + 1)}>
                {p.hot && (
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--teal-l)', background: 'rgba(90,150,144,0.1)', border: '1px solid rgba(90,150,144,0.2)', borderRadius: '100px', padding: '3px 12px', marginBottom: '14px', width: 'fit-content', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    ⭐ Most Popular
                  </div>
                )}
                <div className={s.pricingPlan}>{p.name}</div>
                <div className={s.pricingAmt}>{p.price}</div>
                <div className={s.pricingPer}>{p.per}</div>
                <div className={s.pricingSep} />
                <div className={s.pricingFeats}>
                  {p.feats.map((f, j) => (
                    <div key={j} className={s.pricingFeat}>
                      <Check size={13} className={s.pricingCheckIco} /> {f}
                    </div>
                  ))}
                </div>
                <Mag>
                  <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', padding: '13px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', background: p.hot ? 'linear-gradient(135deg,var(--teal),var(--teal-l))' : 'rgba(255,255,255,0.06)', color: p.hot ? 'white' : 'rgba(255,255,255,0.8)', border: p.hot ? 'none' : '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s ease' }}>
                    {p.name === 'Starter' ? 'Get Started Free' : `Try ${p.name}`} <ArrowRight size={14} />
                  </Link>
                </Mag>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
           CTA LASER BAND
         ══════════════════════════════════════════════════ */}
      <section className={s.ctaBand}>
        <div className={s.ctaBandLaser}>
          <LaserFlow color="#5A9690" horizontalBeamOffset={0.0} wispDensity={1.6} wispSpeed={16} wispIntensity={5} flowSpeed={0.35} flowStrength={0.25} fogIntensity={0.5} fogScale={0.28} decay={1.1} falloffStart={1.2} />
        </div>
        <div className={s.ctaBandFogT} />
        <div className={s.ctaBandFogB} />

        <div className={s.ctaBandInner} data-r>
          <div className={s.ctaBandEye}>
            <span style={{ width: '16px', height: '1px', background: 'var(--teal)' }} />
            Start Today
            <span style={{ width: '16px', height: '1px', background: 'var(--teal)' }} />
          </div>
          <h2 className={s.ctaBandH}>Ready to run your property smarter?</h2>
          <p className={s.ctaBandP}>Join 2,400+ hotels and restaurants already growing with HospitalityHub.</p>
          <div className={s.ctaBandBtns}>
            <Mag><Link to="/signup" className={s.btnCta}>Create Free Account <ArrowRight size={16} /></Link></Mag>
            <Link to="/login" className={s.btnCtaGhost}>View Live Demo</Link>
          </div>
          <p className={s.ctaBandNote}>No credit card · 14-day Pro trial · Cancel anytime</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
           FOOTER
         ══════════════════════════════════════════════════ */}
      <footer className={s.footer}>
        <div className={s.footerTop}>
          <div>
            <Link to="/" className={s.logo}>
              <div className={s.logoMark}>H</div>
              <span className={s.logoName}>HospitalityHub</span>
            </Link>
            <p className={s.footerTagline}>
              The all-in-one management platform for hotels and restaurants across India. Built for real operators.
            </p>
            <div className={s.footerSocials}>
              {['𝕏', '📘', '📸', '▶'].map((icon, i) => (
                <a key={i} href="#" className={s.footerSocial}>{icon}</a>
              ))}
            </div>
          </div>
          {[
            { h: 'Product', links: [['Features', '#features'], ['Hotel Module', '#hotel'], ['Restaurant Module', '#restaurant'], ['Analytics', '#'], ['Pricing', '/pricing']] },
            { h: 'Company', links: [['About', '#'], ['Careers', '#'], ['Blog', '#'], ['Contact', '#']] },
            { h: 'Support', links: [['Help Center', '#'], ['API Docs', '#'], ['Status', '#'], ['Privacy', '#'], ['Terms', '#']] },
          ].map((col, i) => (
            <div key={i}>
              <div className={s.footerColH}>{col.h}</div>
              <ul className={s.footerColLinks}>
                {col.links.map(([label, href], j) => (
                  <li key={j}><a href={href}>{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={s.footerBot}>
          <p className={s.footerCopy}>© 2026 HospitalityHub. Made with ❤️ in India.</p>
          <div className={s.footerLegal}>
            {['Privacy', 'Terms', 'Cookies'].map((l, i) => <a key={i} href="#">{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  )
}
