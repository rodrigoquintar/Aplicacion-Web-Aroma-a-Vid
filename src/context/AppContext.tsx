import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Room, Client, Product, Reservation, Sale, MaintenanceItem, User } from '../types';
import { INITIAL_ROOMS, INITIAL_CLIENTS, INITIAL_PRODUCTS, INITIAL_RESERVATIONS, INITIAL_MAINTENANCE_ITEMS } from '../constants';

// Conexión a Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PIN_ADMIN = "0209";
const PIN_REC = "1011";

const USERS: Record<string, User> = {
  [PIN_ADMIN]: { id: 'u1', name: 'Admin General', role: 'admin' },
  [PIN_REC]: { id: 'u2', name: 'Recepcionista', role: 'receptionist' },
};

// Crear el Contexto
export const AppContext = createContext<any>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('AROMA_SESSION');
    return saved ? JSON.parse(saved) : null;
  });

  // Estados de datos
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(INITIAL_MAINTENANCE_ITEMS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [sales, setSales] = useState<Sale[]>([]);

  // CARGAR DATOS AL INICIAR
  useEffect(() => {
    const loadCloudData = async () => {
      const { data: cloudRooms } = await supabase.from('rooms').select('*');
      if (cloudRooms && cloudRooms.length > 0) setRooms(cloudRooms);
      
      const { data: cloudRes } = await supabase.from('reservations').select('*');
      if (cloudRes) setReservations(cloudRes);
    };
    loadCloudData();
  }, []);

  // GUARDAR AUTOMÁTICAMENTE
  useEffect(() => {
    const sync = async () => {
      if (rooms.length > 0) await supabase.from('rooms').upsert(rooms);
    };
    sync();
  }, [rooms, reservations]);

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

  // Funciones de ayuda necesarias para evitar errores de compilación
  const updateRoomStatus = (id: string, status: any) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };
  const addRoom = (room: any) => setRooms(prev => [...prev, room]);
  const updateRoom = (room: any) => setRooms(prev => prev.map(r => r.id === room.id ? room : r));
  const deleteRoom = (id: string) => setRooms(prev => prev.filter(r => r.id !== id));
  const addClient = (client: any) => setClients(prev => [...prev, client]);
  const deleteClient = (id: string) => setClients(prev => prev.filter(c => c.id !== id));
  const addReservation = (res: any) => setReservations(prev => [...prev, res]);
  const updateReservation = (res: any) => setReservations(prev => prev.map(r => r.id === res.id ? res : r));
  const deleteReservation = (id: string) => setReservations(prev => prev.filter(r => r.id !== id));
  const updateReservationStatus = (id: string, status: any) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };
  const addSale = (sale: any) => setSales(prev => [...prev, sale]);
  const addProduct = (p: any) => setProducts(prev => [...prev, p]);
  const updateProduct = (p: any) => setProducts(prev => prev.map(item => item.id === p.id ? p : item));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));
  const updateProductStock = (id: string, q: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock + q } : p));
  };
  const addMaintenanceItem = (m: any) => setMaintenanceItems(prev => [...prev, m]);
  const updateMaintenanceItem = (m: any) => setMaintenanceItems(prev => prev.map(item => item.id === m.id ? m : item));
  const deleteMaintenanceItem = (id: string) => setMaintenanceItems(prev => prev.filter(m => m.id !== id));
  const updateMaintenanceStock = (id: string, q: number) => {
    setMaintenanceItems(prev => prev.map(m => m.id === id ? { ...m, stock: m.stock + q } : m));
  };
  const getRoomById = (id: string) => rooms.find(r => r.id === id);
  const getClientById = (id: string) => clients.find(c => c.id === id);
  const restoreBackup = () => { /* Función básica */ };

  return (
    <AppContext.Provider value={{
      rooms, clients, products, maintenanceItems, reservations, sales, currentUser, isLoggedIn: !!currentUser,
      login, logout, updateRoomStatus, addRoom, updateRoom, deleteRoom, addClient, deleteClient, addReservation,
      updateReservation, deleteReservation, updateReservationStatus, addSale, addProduct, updateProduct,
      deleteProduct, updateProductStock, addMaintenanceItem, updateMaintenanceItem, deleteMaintenanceItem, 
      updateMaintenanceStock, getRoomById, getClientById, restoreBackup
    }}>
      {children}
    </AppContext.Provider>
  );
};

// EL GANCHO QUE FALTABA
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
