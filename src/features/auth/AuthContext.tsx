import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import type { User, Session } from '../../lib/supabase'
import type { UserProfile, UserRole, BusinessType } from '../../types'
import { toast } from 'react-hot-toast'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: string | null, session: Session | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  createBusiness: (name: string, type: BusinessType) => Promise<{ error: string | null }>
}

type AuthContextType = AuthState & AuthActions

const AuthContext = createContext<AuthContextType | null>(null)

// Mock profiles for demo (when Supabase is not configured)
const MOCK_USERS: Record<string, UserProfile> = {
  'hotel@demo.com': {
    id: 'demo-hotel-001',
    email: 'hotel@demo.com',
    name: 'Raj Sharma',
    role: 'hotel_admin',
    business_id: 'biz-hotel-001',
    plan: 'pro',
    created_at: new Date().toISOString(),
  },
  'restaurant@demo.com': {
    id: 'demo-rest-001',
    email: 'restaurant@demo.com',
    name: 'Priya Nair',
    role: 'restaurant_admin',
    business_id: 'biz-rest-001',
    plan: 'pro',
    created_at: new Date().toISOString(),
  },
  'admin@demo.com': {
    id: 'demo-hybrid-001',
    email: 'admin@demo.com',
    name: 'Arjun Mehta',
    role: 'hybrid_admin',
    business_id: 'biz-hybrid-001',
    plan: 'premium',
    created_at: new Date().toISOString(),
  },
}

const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      // Check localStorage for demo session
      const savedProfile = localStorage.getItem('hh_demo_profile')
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile)
        setProfile(parsed)
        setUser({ id: parsed.id, email: parsed.email } as User)
      }
      setLoading(false)
      return
    }

    // Real Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) fetchProfile(session)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) fetchProfile(session)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const [attemptedCreation, setAttemptedCreation] = useState<string | null>(null)

  async function fetchProfile(activeSession: Session) {
    const authUser = activeSession.user
    if (!authUser || loading === false && profile) return

    try {
      // Delay to ensure auth propagation
      await new Promise(resolve => setTimeout(resolve, 800))

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, plan, created_at, business_id')
        .eq('id', authUser.id)
        .maybeSingle()

      if (!error && data) {
        setProfile(data as UserProfile)
        setLoading(false)
        return
      }

      // If we've already tried to create it for this user, don't try again to avoid loops
      if (attemptedCreation === authUser.id) {
        setLoading(false)
        return
      }

      // If missing or inaccessible (406 often happens on permissions), attempt creation
      if (!data || error?.status === 406 || error?.status === 401) {
        setAttemptedCreation(authUser.id)
        
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || 'New User',
          role: authUser.user_metadata?.role || 'hotel_admin',
          plan: 'free',
          created_at: new Date().toISOString(),
        }

        const { data: inserted, error: insertErr } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .maybeSingle()

        if (!insertErr && inserted) {
          setProfile(inserted as UserProfile)
        } else {
          // If insert fails (Conflict, FK violation, etc.), use the fallback profile
          // This keeps the UI working even if the DB is misconfigured
          setProfile(newProfile as UserProfile)
          
          if (insertErr?.code === '23503') {
            console.error('SQL SCHEMA ERROR: profiles table references users instead of auth.users.')
          }
        }
      }
    } catch (err) {
      console.error('Profile process failed:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Sign In ──────────────────────────────────────────────
  async function signIn(email: string, password: string) {
    if (isDemoMode) {
      const mockProfile = MOCK_USERS[email]
      if (mockProfile && password === 'demo123') {
        setProfile(mockProfile)
        setUser({ id: mockProfile.id, email: mockProfile.email } as User)
        localStorage.setItem('hh_demo_profile', JSON.stringify(mockProfile))
        return { error: null }
      }
      return { error: 'Invalid credentials. Use demo accounts below.' }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  // ── Sign Up ──────────────────────────────────────────────
  async function signUp(email: string, password: string, name: string, role: UserRole) {
    if (isDemoMode) {
      return { error: 'Sign up is disabled in demo mode. Use the demo accounts.', session: null }
    }

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name,
          role,
        }
      }
    })
    
    if (error || !data.user) return { error: error?.message ?? 'Signup failed', session: null }

    // No manual profiles insert here anymore. 
    // It's handled by fetchProfile when the session becomes active.
    // This avoids 401 errors for users who haven't confirmed their email yet.

    return { error: null, session: data.session }
  }

  // ── Sign Out ─────────────────────────────────────────────
  async function signOut() {
    if (isDemoMode) {
      setProfile(null)
      setUser(null)
      localStorage.removeItem('hh_demo_profile')
      return
    }
    await supabase.auth.signOut()
  }

  // ── Update Profile ───────────────────────────────────────
  async function updateProfile(updates: Partial<UserProfile>) {
    if (!profile) return
    const newProfile = { ...profile, ...updates }
    setProfile(newProfile)
    if (isDemoMode) {
      localStorage.setItem('hh_demo_profile', JSON.stringify(newProfile))
      return
    }
    await supabase.from('profiles').update(updates).eq('id', profile.id)
  }

  // ── Create Business ──────────────────────────────────────
  async function createBusiness(name: string, type: BusinessType) {
    if (isDemoMode) {
      return { error: null }
    }
    if (!user) return { error: 'Not authenticated' }
    const { data, error } = await supabase
      .from('businesses')
      .insert({ name, type, owner_id: user.id })
      .select()
      .single()

    if (error) return { error: error.message }
    await updateProfile({ business_id: data.id })
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      isAuthenticated: !!user,
      signIn, signUp, signOut, updateProfile, createBusiness,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
