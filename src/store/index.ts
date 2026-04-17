import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Room, Booking, Guest, Transaction, RestaurantTable, MenuItem, Order } from '../types'

// ── HOTEL STORE ─────────────────────────────────────────────

interface HotelStore {
  rooms: Room[]
  bookings: Booking[]
  guests: Guest[]
  transactions: Transaction[]
  loading: boolean
  
  fetchHotelData: (businessId: string) => Promise<void>
  addRoom: (room: Omit<Room, 'id' | 'created_at'>) => Promise<void>
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>
  deleteRoom: (id: string) => Promise<void>
  addBooking: (booking: any) => Promise<void>
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>
  addTransaction: (tx: any) => Promise<void>
}

export const useHotelStore = create<HotelStore>((set, get) => ({
  rooms: [],
  bookings: [],
  guests: [],
  transactions: [],
  loading: false,

  fetchHotelData: async (businessId: string) => {
    set({ loading: true })
    try {
      const [roomsRes, bookingsRes, guestsRes, txRes] = await Promise.all([
        supabase.from('rooms').select('*').eq('business_id', businessId).order('number'),
        supabase.from('bookings').select('*, room:rooms(*), guest:guests(*)').eq('business_id', businessId).order('created_at', { ascending: false }),
        supabase.from('guests').select('*').eq('business_id', businessId).order('name'),
        supabase.from('transactions').select('*').eq('business_id', businessId).order('created_at', { ascending: false }),
      ])

      set({
        rooms: roomsRes.data || [],
        bookings: bookingsRes.data || [],
        guests: guestsRes.data || [],
        transactions: txRes.data || [],
        loading: false
      })
    } catch (err) {
      console.error('Fetch hotel data failed:', err)
      set({ loading: false })
    }
  },

  addRoom: async (room) => {
    const { data, error } = await supabase.from('rooms').insert(room).select().single()
    if (!error && data) set(s => ({ rooms: [...s.rooms, data] }))
  },

  updateRoom: async (id, updates) => {
    const { error } = await supabase.from('rooms').update(updates).eq('id', id)
    if (!error) set(s => ({ rooms: s.rooms.map(r => r.id === id ? { ...r, ...updates } : r) }))
  },

  deleteRoom: async (id) => {
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (!error) set(s => ({ rooms: s.rooms.filter(r => r.id !== id) }))
  },

  addBooking: async (booking) => {
    const { data, error } = await supabase.from('bookings').insert(booking).select('*, room:rooms(*), guest:guests(*)').single()
    if (!error && data) set(s => ({ bookings: [data, ...s.bookings] }))
  },

  updateBooking: async (id, updates) => {
    const { error } = await supabase.from('bookings').update(updates).eq('id', id)
    if (!error) set(s => ({ bookings: s.bookings.map(b => b.id === id ? { ...b, ...updates } : b) }))
  },

  addTransaction: async (tx) => {
    const { data, error } = await supabase.from('transactions').insert(tx).select().single()
    if (!error && data) set(s => ({ transactions: [data, ...s.transactions] }))
  },
}))

// ── RESTAURANT STORE ──────────────────────────────────────────

interface RestaurantStore {
  tables: RestaurantTable[]
  menu: MenuItem[]
  orders: Order[]
  loading: boolean

  fetchRestaurantData: (businessId: string) => Promise<void>
  addTable: (table: Omit<RestaurantTable, 'id' | 'created_at'>) => Promise<void>
  updateTable: (id: string, updates: Partial<RestaurantTable>) => Promise<void>
  addOrder: (order: any, items: any[]) => Promise<void>
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at'>) => Promise<void>
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>
}

export const useRestaurantStore = create<RestaurantStore>((set, get) => ({
  tables: [],
  menu: [],
  orders: [],
  loading: false,

  fetchRestaurantData: async (businessId: string) => {
    set({ loading: true })
    try {
      const [tablesRes, menuRes, ordersRes] = await Promise.all([
        supabase.from('restaurant_tables').select('*').eq('business_id', businessId).order('number'),
        supabase.from('menu_items').select('*').eq('business_id', businessId).order('category'),
        supabase.from('orders').select('*, table:restaurant_tables(*), items:order_items(*, menu_item:menu_items(*))').eq('business_id', businessId).order('created_at', { ascending: false }),
      ])

      set({
        tables: tablesRes.data || [],
        menu: menuRes.data || [],
        orders: ordersRes.data || [],
        loading: false
      })
    } catch (err) {
      console.error('Fetch restaurant data failed:', err)
      set({ loading: false })
    }
  },

  addTable: async (table) => {
    const { data, error } = await supabase.from('restaurant_tables').insert(table).select().single()
    if (!error && data) set(s => ({ tables: [...s.tables, data] }))
  },

  updateTable: async (id, updates) => {
    const { error } = await supabase.from('restaurant_tables').update(updates).eq('id', id)
    if (!error) set(s => ({ tables: s.tables.map(t => t.id === id ? { ...t, ...updates } : t) }))
  },

  addMenuItem: async (item) => {
    const { data, error } = await supabase.from('menu_items').insert(item).select().single()
    if (!error && data) set(s => ({ menu: [...s.menu, data] }))
  },

  updateMenuItem: async (id, updates) => {
    const { error } = await supabase.from('menu_items').update(updates).eq('id', id)
    if (!error) set(s => ({ menu: s.menu.map(m => m.id === id ? { ...m, ...updates } : m) }))
  },

  addOrder: async (order, items) => {
    const { data: orderData, error: orderErr } = await supabase.from('orders').insert(order).select().single()
    if (orderErr) return

    const orderItems = items.map(item => ({ ...item, order_id: orderData.id }))
    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
    
    if (!itemsErr) {
      // Re-fetch this order to get full relations
      const { data: fullOrder } = await supabase
        .from('orders')
        .select('*, table:restaurant_tables(*), items:order_items(*, menu_item:menu_items(*))')
        .eq('id', orderData.id)
        .single()
      
      if (fullOrder) set(s => ({ orders: [fullOrder, ...s.orders] }))
    }
  },

  updateOrder: async (id, updates) => {
    const { error } = await supabase.from('orders').update(updates).eq('id', id)
    if (!error) set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, ...updates } : o) }))
  },
}))
