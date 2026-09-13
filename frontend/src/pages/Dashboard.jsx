import { useEffect, useState } from 'react';
import API from '../services/api.js';
import Layout from '../components/Layout.jsx';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await API.get('/dashboard/summary');
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard summary', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64 text-slate-500">
          Memuat data dashboard...
        </div>
      </Layout>
    );
  }

  const { summary, category_expenses, recent_transactions } = data || {};

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ringkasan Keuangan</h1>
          <p className="text-sm text-slate-500">Pantau arus kas dan analisis pengeluaran Anda bulan ini.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Total Balance */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-500">Total Saldo</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatRupiah(summary?.total_balance)}</p>
          </div>

          {/* Card Income */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-500">Pemasukan Bulan Ini</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatRupiah(summary?.monthly_income)}</p>
          </div>

          {/* Card Expense */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-500">Pengeluaran Bulan Ini</span>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatRupiah(summary?.monthly_expense)}</p>
          </div>

          {/* Card Expense Ratio */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-500">Rasio Pengeluaran</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{summary?.expense_to_income_ratio}%</p>
            <p className="text-xs text-slate-400 mt-1">Dari total pemasukan bulan ini</p>
          </div>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pie Chart Category Expenses */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Pengeluaran per Kategori</h3>
            {category_expenses?.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={category_expenses}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {category_expenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatRupiah(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex justify-center items-center text-sm text-slate-400">
                Belum ada pengeluaran bulan ini
              </div>
            )}
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Transaksi Terbaru</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-xs font-semibold text-slate-400 uppercase">
                    <th className="py-3 px-4">Kategori / Ket</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {recent_transactions?.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {t.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{t.category_name}</p>
                            <p className="text-xs text-slate-400">{t.description || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(t.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                      </td>
                    </tr>
                  ))}
                  {recent_transactions?.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-6 text-center text-slate-400 text-sm">
                        Belum ada riwayat transaksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}