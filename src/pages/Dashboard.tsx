import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Package, Users, Wallet } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useStore } from '../store/useStore';
import { subDays, format, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Dashboard() {
  const { transactions, inventory, customers, settings } = useStore();

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const totalCustomers = customers.length;
  const lowStockItems = inventory.filter(i => i.stock <= (settings?.lowStockThreshold || 5)).length;

  // Generate last 7 days chart data
  const revenueData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayTransactions = transactions.filter(t => {
      try {
        const d = new Date(t.date);
        if (isNaN(d.getTime())) return false;
        return isSameDay(d, date);
      } catch (e) {
        return false;
      }
    });
    
    return {
      name: format(date, 'EEE', { locale: id }),
      income: dayTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0),
      expense: dayTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Ringkasan Bisnis</h2>
        <p className="text-slate-500">Pantau performa usahamu hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Pemasukan" 
          value={formatCurrency(totalIncome, settings?.currency)} 
          trend="Semua Waktu" 
          isPositive={true}
          icon={Wallet}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
        />
        <StatCard 
          title="Total Pengeluaran" 
          value={formatCurrency(totalExpense, settings?.currency)} 
          trend="Semua Waktu" 
          isPositive={true} // Less expense is positive
          icon={ArrowDownRight}
          color="text-rose-600"
          bgColor="bg-rose-100"
        />
        <StatCard 
          title="Total Pelanggan" 
          value={totalCustomers.toString()} 
          trend="Terdaftar" 
          isPositive={true}
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard 
          title="Stok Menipis" 
          value={`${lowStockItems} Item`} 
          trend={lowStockItems > 0 ? "Perlu restock" : "Stok aman"} 
          isPositive={lowStockItems === 0}
          icon={Package}
          color={lowStockItems > 0 ? "text-amber-600" : "text-emerald-600"}
          bgColor={lowStockItems > 0 ? "bg-amber-100" : "bg-emerald-100"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Arus Kas (7 Hari Terakhir)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${settings?.currency === 'IDR' ? 'Rp' : settings?.currency === 'USD' ? '$' : settings?.currency === 'EUR' ? '€' : 'S$'}${value/1000000}M`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value, settings?.currency)}
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tren Penjualan</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${settings?.currency === 'IDR' ? 'Rp' : settings?.currency === 'USD' ? '$' : settings?.currency === 'EUR' ? '€' : 'S$'}${value/1000000}M`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value, settings?.currency)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="income" name="Penjualan" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, isPositive, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} ${color}`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
      </div>
    </div>
  );
}
