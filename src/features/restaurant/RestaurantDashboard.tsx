import React from 'react'
import { useRestaurantStore } from '../../store'
import { useAuth } from '../../features/auth/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { UtensilsCrossed, Table2, ShoppingBag, DollarSign, ArrowUpRight, Clock } from 'lucide-react'
import { format } from 'date-fns'
import styles from './Restaurant.module.css'

const HOURLY = [
  { hour: '8am', orders: 5, revenue: 1200 },
  { hour: '10am', orders: 12, revenue: 2800 },
  { hour: '12pm', orders: 38, revenue: 9400 },
  { hour: '2pm', orders: 22, revenue: 5200 },
  { hour: '4pm', orders: 8, revenue: 1800 },
  { hour: '6pm', orders: 25, revenue: 6100 },
  { hour: '8pm', orders: 42, revenue: 10800 },
  { hour: '10pm', orders: 18, revenue: 4200 },
]

const TOP_ITEMS = [
  { name: 'Chicken Biryani', count: 42, revenue: 15960 },
  { name: 'Paneer Tikka', count: 38, revenue: 10640 },
  { name: 'Dal Makhani', count: 31, revenue: 6820 },
  { name: 'Fish Curry', count: 24, revenue: 10080 },
  { name: 'Gulab Jamun', count: 29, revenue: 3480 },
]

const PIE_COLORS = ['#5A9690', '#2F5755', '#4caf82', '#d4a017', '#a06060']

export default function RestaurantDashboard() {
  const { profile } = useAuth()
  const { tables, orders, menu } = useRestaurantStore()

  const availTables = tables.filter(t => t.status === 'available').length
  const occupiedTables = tables.filter(t => t.status === 'occupied').length
  const activeOrders = orders.filter(o => o.status !== 'billed').length
  const todayRevenue = orders.reduce((s, o) => s + o.total_amount, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length

  const STATS = [
    { label: 'Table Occupancy', value: `${Math.round((occupiedTables / tables.length) * 100)}%`, sub: `${occupiedTables}/${tables.length} occupied`, icon: Table2, color: 'var(--color-teal-light)', trend: '+8%' },
    { label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString()}`, sub: 'From all tables', icon: DollarSign, color: '#4caf82', trend: '+15%' },
    { label: 'Active Orders', value: String(activeOrders), sub: `${pendingOrders} pending kitchen`, icon: ShoppingBag, color: 'var(--color-cream)', trend: `${orders.length} total` },
    { label: 'Avg Order Value', value: `₹${Math.round(todayRevenue / Math.max(orders.length, 1)).toLocaleString()}`, sub: 'Per table', icon: UtensilsCrossed, color: '#d4a017', trend: '↑ from yesterday' },
  ]

  return (
    <div className={styles.dashPage}>
      <div style={{ marginBottom: '4px' }}>
        <h1 className={styles.dashTitle}>Restaurant Dashboard 🍽️</h1>
        <p className={styles.dashSub}>{format(new Date(), 'EEEE, do MMMM yyyy')} · Live restaurant overview</p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {STATS.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--color-bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <s.icon size={20} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4caf82', fontWeight: 600 }}>
                <ArrowUpRight size={14} /> {s.trend}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-cream)', letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', opacity: 0.7 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className={styles.chartsRow}>
        {/* Hourly peak */}
        <div className="card" style={{ flex: 2 }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Peak Hours Today</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> Highest traffic at 8 PM
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={HOURLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,150,144,0.08)" />
              <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '10px', color: 'var(--text-primary)' }} />
              <Bar dataKey="orders" fill="#2F5755" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top items */}
        <div className="card" style={{ flex: 1 }}>
          <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Top Menu Items</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {TOP_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: PIE_COLORS[i], opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', color: 'white' }}>{i + 1}</div>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-teal-light)' }}>₹{item.revenue.toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.count} sold</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Orders */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Active Orders</div>
          <a href="/restaurant/orders" style={{ fontSize: '13px', color: 'var(--color-teal-light)', fontWeight: 500 }}>View all →</a>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Table</th>
              <th>Items</th>
              <th>Amount</th>
              <th>GST</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const mins = Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000)
              return (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700 }}>Table {o.table?.number ?? '—'}</td>
                  <td>
                    {o.items?.map(item => `${item.menu_item?.name ?? '?'} ×${item.quantity}`).join(', ')}
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{o.total_amount.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)' }}>₹{o.gst_amount.toFixed(0)}</td>
                  <td style={{ color: mins > 30 ? '#d4a017' : 'var(--text-muted)', fontSize: '12px' }}>{mins} min ago</td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
