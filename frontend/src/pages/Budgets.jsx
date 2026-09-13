import { useEffect, useState } from 'react';
import API from '../services/api.js';
import Layout from '../components/Layout.jsx';
import { Plus, Target, AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    amount_limit: '',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear()
  });
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetRes, catRes] = await Promise.all([
        API.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`),
        API.get('/categories')
      ]);
      setBudgets(budgetRes.data.data);
      
      const expenseCats = catRes.data.data
        .filter(c => c.type === 'EXPENSE')
        .filter((cat, index, self) => index === self.findIndex((t) => t.name === cat.name));
      setCategories(expenseCats);
    } catch (err) {
      console.error('Failed to fetch budget data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      // Kirim payload sesuai field backend: category_id, amount_limit, month, year
      await API.post('/budgets', {
        category_id: Number(formData.category_id),
        amount_limit: Number(formData.amount_limit),
        month: Number(formData.month),
        year: Number(formData.year)
      });

      setIsModalOpen(false);
      setFormData({
        category_id: '',
        amount_limit: '',
        month: selectedMonth,
        year: selectedYear
      });
      fetchData();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Gagal menyimpan anggaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const monthsList = [
    { value: 1, name: 'Januari' },
    { value: 2, name: 'Februari' },
    { value: 3, name: 'Maret' },
    { value: 4, name: 'April' },
    { value: 5, name: 'Mei' },
    { value: 6, name: 'Juni' },
    { value: 7, name: 'Juli' },
    { value: 8, name: 'Agustus' },
    { value: 9, name: 'September' },
    { value: 10, name: 'Oktober' },
    { value: 11, name: 'November' },
    { value: 12, name: 'Desember' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Target Anggaran (Budget)</h1>
            <p className="text-sm text-slate-500">Atur dan kontrol batas pengeluaran bulanan per kategori.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Atur Anggaran Baru</span>
          </button>
        </div>

        {/* Filter Periode */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-4">
          <span className="text-sm font-medium text-slate-600">Periode Monitoring:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 border rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-24 px-3 py-1.5 border rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Budget Cards Grid */}
        {loading ? (
          <div className="p-8 text-center text-slate-500">Memuat data anggaran...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((b) => {
              const spent = Number(b.actual_used || 0);
              const limit = Number(b.amount_limit || 0);
              const percentage = Math.min(Math.round((spent / limit) * 100), 100);
              const isOverBudget = b.status === 'EXCEEDED';

              return (
                <div key={b.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{b.category_name}</h3>
                      <p className="text-xs text-slate-400">Bulan {b.month}/{b.year}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      <Target className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">Terpakai: {formatRupiah(spent)}</span>
                      <span className={isOverBudget ? 'text-red-600' : 'text-slate-700'}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : percentage >= 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Info Status */}
                  <div className="flex justify-between items-center pt-2 border-t text-xs">
                    <span className="text-slate-400">Batas Max: <strong>{formatRupiah(limit)}</strong></span>
                    {isOverBudget ? (
                      <span className="flex items-center text-red-600 font-semibold space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Melebihi Limit</span>
                      </span>
                    ) : (
                      <span className="flex items-center text-emerald-600 font-semibold space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aman</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {budgets.length === 0 && (
              <div className="col-span-full bg-white p-8 rounded-xl border text-center text-slate-400">
                Belum ada anggaran yang diatur untuk periode ini. Klik tombol di atas untuk membuat anggaran baru.
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH BUDGET */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Atur Anggaran Kategori</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Pengeluaran</label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batas Maksimal Anggaran (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="1000000"
                  value={formData.amount_limit}
                  onChange={(e) => setFormData({ ...formData, amount_limit: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Input Bulan & Tahun */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bulan</label>
                  <select
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {monthsList.map((m) => (
                      <option key={m.value} value={m.value}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tahun</label>
                  <input
                    type="number"
                    required
                    min="2020"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                >
                  {isSubmitting ? 'Simpan...' : 'Simpan Anggaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}