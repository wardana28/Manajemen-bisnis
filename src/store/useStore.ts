import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Transaction = {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  unit: string;
  price: number;
  status: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  lastVisit: string;
  status: string;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  phone: string;
  shift: string;
  salary: number;
  status: string;
};

export type Warehouse = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentLoad: number;
  manager: string;
  status: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  progress: number;
  status: string;
  assignee: string;
};

export type AppSettings = {
  businessName: string;
  currency: string;
  lowStockThreshold: number;
  taxRate: number;
};

interface AppState {
  transactions: Transaction[];
  inventory: Product[];
  customers: Customer[];
  employees: Employee[];
  warehouses: Warehouse[];
  projects: Project[];
  settings: AppSettings;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  addCustomer: (c: Omit<Customer, 'id'>) => void;
  addEmployee: (e: Omit<Employee, 'id'>) => void;
  addWarehouse: (w: Omit<Warehouse, 'id'>) => void;
  addProject: (p: Omit<Project, 'id'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  updateWarehouse: (id: string, w: Partial<Warehouse>) => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  resetStore: () => void;
  importData: (data: Partial<AppState>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      transactions: [],
      inventory: [],
      customers: [],
      employees: [],
      warehouses: [],
      projects: [],
      settings: {
        businessName: 'JuraganApp',
        currency: 'IDR',
        lowStockThreshold: 5,
        taxRate: 11
      },
      addTransaction: (t) => set((state) => ({ 
        transactions: [{ ...t, id: `TRX-${Date.now()}` }, ...state.transactions] 
      })),
      addProduct: (p) => set((state) => ({ 
        inventory: [{ ...p, id: `PRD-${Date.now()}` }, ...state.inventory] 
      })),
      addCustomer: (c) => set((state) => ({ 
        customers: [{ ...c, id: `CUST-${Date.now()}` }, ...state.customers] 
      })),
      addEmployee: (e) => set((state) => ({ 
        employees: [{ ...e, id: `EMP-${Date.now()}` }, ...state.employees] 
      })),
      addWarehouse: (w) => set((state) => ({ 
        warehouses: [{ ...w, id: `WH-${Date.now()}` }, ...state.warehouses] 
      })),
      addProject: (p) => set((state) => ({ 
        projects: [{ ...p, id: `PRJ-${Date.now()}` }, ...state.projects] 
      })),
      updateProduct: (id, p) => set((state) => ({
        inventory: state.inventory.map(item => item.id === id ? { ...item, ...p } : item)
      })),
      updateCustomer: (id, c) => set((state) => ({
        customers: state.customers.map(item => item.id === id ? { ...item, ...c } : item)
      })),
      updateWarehouse: (id, w) => set((state) => ({
        warehouses: state.warehouses.map(item => item.id === id ? { ...item, ...w } : item)
      })),
      updateProject: (id, p) => set((state) => ({
        projects: state.projects.map(item => item.id === id ? { ...item, ...p } : item)
      })),
      updateSettings: (s) => set((state) => ({
        settings: { ...state.settings, ...s }
      })),
      resetStore: () => set({
        transactions: [],
        inventory: [],
        customers: [],
        employees: [],
        warehouses: [],
        projects: []
      }),
      importData: (data) => set((state) => ({
        ...state,
        ...data
      })),
    }),
    {
      name: 'juragan-storage-v2',
    }
  )
);
