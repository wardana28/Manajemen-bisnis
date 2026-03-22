import React, { useState } from 'react';
import { Plus, Search, Filter, Briefcase, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useStore, Project } from '../store/useStore';
import Modal from '../components/Modal';

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { projects, addProject, updateProject, employees } = useStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    assignee: '',
    progress: '0',
    status: 'To Do'
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', deadline: '', assignee: '', progress: '0', status: 'To Do' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingId(project.id);
    
    // Safely parse date for input type="date"
    let formattedDate = '';
    try {
      if (project.deadline) {
        const d = new Date(project.deadline);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split('T')[0];
        }
      }
    } catch (e) {}

    setFormData({
      title: project.title || '',
      description: project.description || '',
      deadline: formattedDate,
      assignee: project.assignee || '',
      progress: project.progress?.toString() || '0',
      status: project.status || 'To Do'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let isoDeadline = new Date().toISOString();
    try {
      if (formData.deadline) {
        isoDeadline = new Date(formData.deadline).toISOString();
      }
    } catch (e) {}

    if (editingId) {
      updateProject(editingId, {
        title: formData.title,
        description: formData.description,
        deadline: isoDeadline,
        assignee: formData.assignee,
        progress: Number(formData.progress),
        status: formData.status
      });
    } else {
      addProject({
        title: formData.title,
        description: formData.description,
        deadline: isoDeadline,
        progress: 0,
        status: 'To Do',
        assignee: formData.assignee,
      });
    }
    setIsModalOpen(false);
    setFormData({ title: '', description: '', deadline: '', assignee: '', progress: '0', status: 'To Do' });
    setEditingId(null);
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Proyek & Tugas</h2>
          <p className="text-slate-500">Kelola proyek, delegasi tugas, dan pantau progres tim.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Buat Proyek
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama proyek atau PIC..." 
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
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Nama Proyek</th>
                <th className="px-6 py-4 font-medium">Tenggat Waktu</th>
                <th className="px-6 py-4 font-medium">Penanggung Jawab</th>
                <th className="px-6 py-4 font-medium">Progres</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mt-1">
                        <Briefcase size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{project.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{project.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {(() => {
                        try {
                          const d = new Date(project.deadline);
                          return isNaN(d.getTime()) ? '-' : format(d, 'dd MMM yyyy', { locale: id });
                        } catch (e) {
                          return '-';
                        }
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 uppercase">
                        {(project.assignee || 'A').charAt(0)}
                      </div>
                      {project.assignee}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                        <div 
                          className={`h-full rounded-full ${project.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${project.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : 
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-slate-100 text-slate-800'}`}>
                      {project.status === 'Done' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right">
                    <button 
                      onClick={() => handleOpenEditModal(project)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Tidak ada proyek ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Proyek" : "Buat Proyek Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Proyek</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Renovasi Cabang Baru"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
            <textarea 
              required
              rows={3}
              placeholder="Jelaskan detail proyek..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tenggat Waktu (Deadline)</label>
            <input 
              type="date" 
              required
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Penanggung Jawab (PIC)</label>
            <select 
              required
              value={formData.assignee}
              onChange={(e) => setFormData({...formData, assignee: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="" disabled>Pilih Karyawan</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name} - {emp.role}</option>
              ))}
            </select>
          </div>
          {editingId && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Progres (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  required
                  value={formData.progress}
                  onChange={(e) => setFormData({...formData, progress: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>
          )}
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
              {editingId ? "Simpan Perubahan" : "Buat Proyek"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
