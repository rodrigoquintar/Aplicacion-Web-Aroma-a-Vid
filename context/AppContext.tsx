import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Room, Client, Product, Reservation, Sale, MaintenanceItem, User } from '../types';
import { INITIAL_ROOMS, INITIAL_CLIENTS, INITIAL_PRODUCTS, INITIAL_RESERVATIONS, INITIAL_MAINTENANCE_ITEMS } from '../constants';

// --- CONFIGURACIÓN SUPABASE ---
const supabaseUrl = 'https://iwpydnfpgxulocinakyg.supabase.co';
const supabaseAnonKey = 'sb_publishable_qY7uXtVTaiqUzyOsHu2s8A_Q06ej0cZ'; 
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PIN_ADMIN = "0209";
const PIN_REC = "1011";

const USERS: Record<string, User> = {
  [PIN_ADMIN]: { id: 'u1', name: 'Admin General', role: 'admin' },
  [PIN_REC]: { id: 'u2', name: 'Recepcionista', role: 'receptionist' },
};

export const AppContext = createContext<any>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('AROMA_SESSION');
    return saved ? JSON.parse(saved) : null;
  });

  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(INITIAL_MAINTENANCE_ITEMS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [sales, setSales] = useState<Sale[]>([]);

  // =========================================================================
  // 1. CARGA DE DATOS (Sincronización Nube -> App)
  // =========================================================================
  useEffect(() => {
    const loadAllData = async () => {
      console.log("📥 Descargando datos de Supabase...");
      
      const { data: r } = await supabase.from('rooms').select('*');
      if (r && r.length > 0) setRooms(r.map(item => ({ ...item, name: item.number || item.name })));
      
      const { data: cl } = await supabase.from('clients').select('*');
      if (cl && cl.length > 0) setClients(cl);

      const { data: res } = await supabase.from('reservations').select('*');
      if (res && res.length > 0) {
        setReservations(res.map((dbRes: any) => ({
          ...dbRes,
          paidAmount: dbRes.deposit ?? dbRes.paidAmount,
          totalPrice: dbRes.totalAmount ?? dbRes.totalPrice,
          guests: dbRes.numberOfPeople ?? dbRes.guests
        })));
      }

      const { data: prod } = await supabase.from('products').select('*');
      if (prod && prod.length > 0) setProducts(prod);

      const { data: sls } = await supabase.from('sales').select('*');
      if (sls && sls.length > 0) setSales(sls);

      const { data: maint } = await supabase.from('maintenanceItems').select('*');
      if (maint && maint.length > 0) setMaintenanceItems(maint);
    };
    loadAllData();
  }, []);

  // =========================================================================
  // 2. GUARDADO AUTOMÁTICO (Sincronización App -> Nube)
  // =========================================================================

  const sync = async (table: string, data: any) => {
    if (!data || data.length === 0) return;
    const { error } = await supabase.from(table).upsert(data);
    if (error) console.error(`❌ Error sincronizando ${table}:`, error.message);
  };

  useEffect(() => { 
    const dbRooms = rooms.map(r => ({ ...r, number: r.name }));
    sync('rooms', dbRooms); 
  }, [rooms]);

  useEffect(() => {
    const dbRes = reservations.map(r => ({
      ...r,
      deposit: r.paidAmount,
      totalAmount: r.totalPrice,
      numberOfPeople: r.guests
    }));
    sync('reservations', dbRes);
  }, [reservations]);

  useEffect(() => { sync('products', products); }, [products]);
  useEffect(() => { sync('clients', clients); }, [clients]);
  useEffect(() => { sync('sales', sales); }, [sales]);
  useEffect(() => { sync('maintenanceItems', maintenanceItems); }, [maintenanceItems]);

  // =========================================================================
  // 3. FUNCIONES DE LÓGICA
  // =========================================================================
  const login = (pin: string) => {
    if (USERS[pin]) {
      setCurrentUser(USERS[pin]);
      localStorage.setItem('AROMA_SESSION', JSON.stringify(USERS[pin]));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('AROMA_SESSION');
  };

  const updateRoomStatus = (id: string, status: any) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addRoom = (room: any) => setRooms(prev => [...prev, room]);
  const updateRoom = (room: any) => setRooms(prev => prev.map(r => r.id === room.id ? room : r));
  const deleteRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    supabase.from('rooms').delete().eq('id', id).then();
  };
  
  const addReservation = (res: any) => setReservations(prev => [...prev, res]);
  const updateReservation = (res: any) => setReservations(prev => prev.map(r => r.id === res.id ? res : r));
  const deleteReservation = (id: string) => {
     setReservations(prev => prev.filter(r => r.id !== id));
     supabase.from('reservations').delete().eq('id', id).then();
  };

  const addClient = (client: any) => setClients(prev => [...prev, client]);
  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    supabase.from('clients').delete().eq('id', id).then();
  };

  const addSale = (sale: any) => setSales(prev => [...prev, sale]);
  const addProduct = (p: any) => setProducts(prev => [...prev, p]);
  const updateProduct = (p: any) => setProducts(prev => prev.map(item => item.id === p.id ? p : item));
  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    supabase.from('products').delete().eq('id', id).then();
  };

  const updateProductStock = (id: string, q: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Number(p.stock) + q } : p));
  };

  const addMaintenanceItem = (m: any) => setMaintenanceItems(prev => [...prev, m]);
  const updateMaintenanceItem = (m: any) => setMaintenanceItems(prev => prev.map(item => item.id === m.id ? m : item));
  const deleteMaintenanceItem = (id: string) => {
    setMaintenanceItems(prev => prev.filter(m => m.id !== id));
    supabase.from('maintenanceItems').delete().eq('id', id).then();
  };

  const updateMaintenanceStock = (id: string, q: number) => {
    setMaintenanceItems(prev => prev.map(m => m.id === id ? { ...m, stock: Number(m.stock) + q } : m));
  };

  const updateReservationStatus = (id: string, status: any) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const getRoomById = (id: string) => rooms.find(r => r.id === id);
  const getClientById = (id: string) => clients.find(c => c.id === id);

  return (
    <AppContext.Provider value={{
      rooms, clients, products, maintenanceItems, reservations, sales, currentUser, isLoggedIn: !!currentUser,
      login, logout, updateRoomStatus, addRoom, updateRoom, deleteRoom, addClient, deleteClient, addReservation,
      updateReservation, deleteReservation, updateReservationStatus, addSale, addProduct, updateProduct,
      deleteProduct, updateProductStock, addMaintenanceItem, updateMaintenanceItem, deleteMaintenanceItem, 
      updateMaintenanceStock, getRoomById, getClientById
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
