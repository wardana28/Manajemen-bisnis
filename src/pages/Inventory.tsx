import React, { useState } from 'react';
import { Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useStore, Product } from '../store/useStore';
import Modal from '../components/Modal';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { inventory, addProduct, updateProduct, settings } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    stock: '',
    unit: 'pcs',
    price: ''
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', stock: '', unit: 'pcs', price: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Product) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      sku: item.sku || '',
      stock: item.stock?.toString() || '0',
      unit: item.unit || 'pcs',
      price: item.price?.toString() || '0'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stockNum = Number(formData.stock);
    let status = 'Aman';
    const threshold = settings?.lowStockThreshold || 5;
    if (stockNum <= threshold && stockNum > 0) status = 'Menipis';
    if (stockNum === 0) status = 'Kritis';

    if (editingId) {
      updateProduct(editingId, {
        name: formData.name,
        sku: formData.sku,
        stock: stockNum,
        unit: formData.unit,
        price: Number(formData.price),
        status
      });
    } else {
      addProduct({
        name: formData.name,
        sku: formData.sku,
        stock: stockNum,
        unit: formData.unit,
        price: Number(formData.price),
        status
      });
    }
    setIsModalOpen(false);
    setFormData({ name: '', sku: '', stock: '', unit: 'pcs', price: '' });
    setEditingId(null);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Stok Barang</h2>
          <p className="text-slate-500">Kelola persediaan bahan baku dan produk.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Tambah Barang
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama barang atau SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Filter size={18} />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none text-slate-600 font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="Aman">Aman</option>
              <option value="Menipis">Menipis</option>
              <option value="Kritis">Kritis</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Nama Barang</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Stok</th>
                <th className="px-6 py-4 font-medium">Harga Satuan</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.sku}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                    {item.stock} <span className="text-slate-500 font-normal">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">{formatCurrency(item.price, settings?.currency)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${item.status === 'Aman' ? 'bg-emerald-100 text-emerald-800' : 
                        item.status === 'Menipis' ? 'bg-amber-100 text-amber-800' : 
                        'bg-rose-100 text-rose-800'}`}>
                      {item.status !== 'Aman' && <AlertTriangle size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right">
                    <button 
                      onClick={() => handleOpenEditModal(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Tidak ada barang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Barang" : "Tambah Barang Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Barang</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Biji Kopi Arabica"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SKU (Kode Barang)</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: KOP-ARB-01"
              value={formData.sku}
              onChange={(e) => setFormData({...formData, sku: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Stok</label>
              <input 
                type="number" 
                required
                min="0"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Satuan</label>
              <select 
                value={formData.unit} 
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="pcs">Pcs</option>
                <option value="kg">Kg</option>
                <option value="liter">Liter</option>
                <option value="karton">Karton</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Harga Satuan ({settings?.currency || 'IDR'})</label>
            <input 
              type="number" 
              required
              min="0"
              placeholder="0"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors"
            >
              {editingId ? "Simpan Perubahan" : "Simpan Barang"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
