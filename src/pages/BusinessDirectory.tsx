import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Business } from '../types'
import { Building2, Phone, MapPin, ArrowLeft } from 'lucide-react'
import s from './Landing/Landing.module.css'

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBusinesses() {
      // In demo mode or if no supabase url, we show mocks
      const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'
      
      if (isDemoMode) {
        setBusinesses([
          {
            id: '1',
            name: 'The Grand Aurora Hotel',
            type: 'hotel',
            owner_id: 'demo1',
            phone: '+91 9876543210',
            address: 'Mumbai, India',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Spice Symphony',
            type: 'restaurant',
            owner_id: 'demo2',
            phone: '+91 8765432109',
            address: 'Delhi, India',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Oasis Resort & Spa',
            type: 'both',
            owner_id: 'demo3',
            phone: '+91 7654321098',
            address: 'Goa, India',
            created_at: new Date().toISOString()
          }
        ])
        setLoading(false)
        return
      }

      try {
        // We fetch businesses. Note: RLS might need to allow anonymous reads
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          setBusinesses(data as Business[])
        }
      } catch (err) {
        console.error('Error fetching businesses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  return (
    <div className={s.lp} style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <nav className={`${s.nav} ${s.navVisible}`}>
        <Link to="/" className={s.logo}>
          <div className={s.logoMark}>H</div>
          <span className={s.logoName}>HospitalityHub</span>
        </Link>
        <div className={s.navCta}>
          <Link to="/" className={s.navLink}><ArrowLeft size={16} /> Back to Home</Link>
          <Link to="/login" className={s.btnGold}>Member Portal</Link>
        </div>
      </nav>

      <section className={s.hero} style={{ paddingTop: '160px', paddingBottom: '60px', textAlign: 'center' }}>
        <div className={s.heroContent} style={{ margin: '0 auto', alignItems: 'center' }}>
          <div className={s.eyebrow}>Our Partners</div>
          <h1 className={s.heroTitle} style={{ fontSize: '4rem' }}>
            Registered
            <span>Businesses</span>
          </h1>
          <p className={s.heroSub} style={{ maxWidth: '600px' }}>
            Discover the premium hotels and fine-dining establishments powered by HospitalityHub.
          </p>
        </div>
      </section>

      <section style={{ padding: '0 5vw', maxWidth: '1400px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading businesses...
          </div>
        ) : businesses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No businesses registered yet.
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '2rem' 
          }}>
            {businesses.map(biz => (
              <div key={biz.id} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px', height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    color: 'var(--gold)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0, color: '#fff' }}>{biz.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {biz.type === 'both' ? 'Hotel & Restaurant' : biz.type}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  {biz.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <Phone size={14} />
                      {biz.phone}
                    </div>
                  )}
                  {biz.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <MapPin size={14} />
                      {biz.address}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
