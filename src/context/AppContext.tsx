import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// 🔴 Usamos el cliente centralizado que configuramos para Vercel
import { supabase } from '../supabaseClient'; 
import { Room, Client, Product, Reservation, Sale, MaintenanceItem, User } from '../types';
import { INITIAL_ROOMS, INITIAL_CLIENTS, INITIAL_PRODUCTS, INITIAL_RESERVATIONS, INITIAL_MAINTENANCE_ITEMS } from '../constants';

// Configuración de usuarios y pines de Aroma a Vid
const PIN_ADMIN = "0209";
const PIN_REC = "1011";

const USERS: Record<string, User> = {
  [PIN_ADMIN]: { id: 'u1', name: 'Admin General', role: 'admin' },
  [PIN_REC]: { id: 'u2', name: 'Recepcionista', role: 'receptionist' },
};

export const AppContext = createContext<any>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Manejo de Sesión
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('AROMA_SESSION');
    return saved ? JSON.parse(saved) : null;
  });

  // Estados de la Aplicación
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(INITIAL_MAINTENANCE_ITEMS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR DATOS DESDE SUPABASE AL INICIAR
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: r } = await supabase.from('rooms').select('*');
        if (r && r.length > 0) setRooms(r);
        
        const { data: res } = await supabase.from('reservations').select('*');
        if (res && res.length > 0) setReservations(res);

        const { data: cl } = await supabase.from('clients').select('*');
        if (cl && cl.length > 0) setClients(cl);
      } catch (error) {
        console.error("Error cargando datos de Supabase:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. GUARDADO AUTOMÁTICO (Sincronización con Supabase)
  useEffect(() => {
    if (rooms.length > 0) supabase.from('rooms').upsert(rooms).then();
  }, [rooms]);

  useEffect(() => {
    if (reservations.length > 0) supabase.from('reservations').upsert(reservations).then();
  }, [reservations]);

  useEffect(() => {
    if (clients.length > 0) supabase.from('clients').upsert(clients).then();
  }, [clients]);

  // Funciones de Autenticación
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

  // Funciones de Gestión de Habitaciones
  const updateRoomStatus = (id: string, status: any) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };
  const addRoom = (room: any) => setRooms(prev => [...prev, room]);
  const updateRoom = (room: any) => setRooms(prev => prev.map(r => r.id === room.id ? room : r));
  const deleteRoom = (id: string) => setRooms(prev => prev.filter(r => r.id !== id));
  
  // Funciones de Gestión de Reservas
  const addReservation = (res: any) => setReservations(prev => [...prev, res]);
  const updateReservation = (res: any) => setReservations(prev => prev.map(r => r.id === res.id ? res : r));
  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    supabase.from('reservations').delete().eq('id', id).then();
  };
  const updateReservationStatus = (id: string, status: any) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  // Clientes y otros
  const addClient = (client: any) => setClients(prev => [...prev, client]);
  const deleteClient = (id: string) => setClients(prev => prev.filter(c => c.id !== id));
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

  // Auxiliares
  const getRoomById = (id: string) => rooms.find(r => r.id === id);
  const getClientById = (id: string) => clients.find(c => c.id === id);
  const restoreBackup = () => {};

  return (
    <AppContext.Provider value={{
      rooms, clients, products, maintenanceItems, reservations, sales, currentUser, loading,
      isLoggedIn: !!currentUser,
      login, logout, updateRoomStatus, addRoom, updateRoom, deleteRoom, addClient, deleteClient, addReservation,
      updateReservation, deleteReservation, updateReservationStatus, addSale, addProduct, updateProduct,
      deleteProduct, updateProductStock, addMaintenanceItem, updateMaintenanceItem, deleteMaintenanceItem, 
      updateMaintenanceStock, getRoomById, getClientById, restoreBackup
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
