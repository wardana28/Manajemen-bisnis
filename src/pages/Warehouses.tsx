import React, { useState } from 'react';
import { Plus, Search, Filter, Building2 } from 'lucide-react';
import { useStore, Warehouse } from '../store/useStore';
import Modal from '../components/Modal';

export default function Warehouses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { warehouses, addWarehouse, updateWarehouse } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    manager: '',
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', location: '', capacity: '', manager: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (warehouse: Warehouse) => {
    setEditingId(warehouse.id);
    setFormData({
      name: warehouse.name || '',
      location: warehouse.location || '',
      capacity: warehouse.capacity?.toString() || '0',
      manager: warehouse.manager || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateWarehouse(editingId, {
        name: formData.name,
        location: formData.location,
        capacity: Number(formData.capacity),
        manager: formData.manager,
      });
    } else {
      addWarehouse({
        name: formData.name,
        location: formData.location,
        capacity: Number(formData.capacity),
        currentLoad: 0,
        manager: formData.manager,
        status: 'Aktif'
      });
    }
    setIsModalOpen(false);
    setFormData({ name: '', location: '', capacity: '', manager: '' });
    setEditingId(null);
  };

  const filteredWarehouses = warehouses.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || w.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Multi-Gudang</h2>
          <p className="text-slate-500">Kelola lokasi gudang dan kapasitas penyimpanan.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Tambah Gudang
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau lokasi gudang..." 
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
              <option value="Aktif">Aktif</option>
              <option value="Penuh">Penuh</option>
              <option value="Pemeliharaan">Pemeliharaan</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Nama Gudang</th>
                <th className="px-6 py-4 font-medium">Lokasi</th>
                <th className="px-6 py-4 font-medium">Kapasitas</th>
                <th className="px-6 py-4 font-medium">Terpakai</th>
                <th className="px-6 py-4 font-medium">Penanggung Jawab</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredWarehouses.map((warehouse) => (
                <tr key={warehouse.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Building2 size={16} />
                      </div>
                      {warehouse.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{warehouse.location}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{warehouse.capacity} Unit</td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${warehouse.capacity > 0 ? (warehouse.currentLoad / warehouse.capacity) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{warehouse.capacity > 0 ? Math.round((warehouse.currentLoad / warehouse.capacity) * 100) : 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{warehouse.manager}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                      ${warehouse.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                      {warehouse.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right">
                    <button 
                      onClick={() => handleOpenEditModal(warehouse)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredWarehouses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Tidak ada gudang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Gudang" : "Tambah Gudang Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Gudang</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Gudang Utama"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Jakarta Selatan"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kapasitas (Unit)</label>
            <input 
              type="number" 
              required
              min="1"
              placeholder="1000"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Penanggung Jawab</label>
            <input 
              type="text" 
              required
              placeholder="Nama Manajer Gudang"
              value={formData.manager}
              onChange={(e) => setFormData({...formData, manager: e.target.value})}
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
              {editingId ? "Simpan Perubahan" : "Simpan Gudang"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
