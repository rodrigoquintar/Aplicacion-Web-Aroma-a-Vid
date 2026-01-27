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
  // 1. CARGA DE DATOS (TRADUCCIÓN: BASE DE DATOS -> APP)
  // =========================================================================
  useEffect(() => {
    const loadAllData = async () => {
      console.log("📥 Descargando datos de Supabase...");
      
      // Habitaciones: name <-> number
      const { data: r } = await supabase.from('rooms').select('*');
      if (r && r.length > 0) {
        setRooms(r.map((item: any) => ({
          ...item,
          name: item.number || item.name // Si viene como 'number', lo usamos como 'name'
        })));
      }
      
      const { data: cl } = await supabase.from('clients').select('*');
      if (cl && cl.length > 0) setClients(cl);

      // Reservas: TRADUCCIÓN CRÍTICA
      const { data: res } = await supabase.from('reservations').select('*');
      if (res && res.length > 0) {
        const appReservations = res.map((dbRes: any) => ({
          ...dbRes,
          paidAmount: dbRes.deposit,          // DB 'deposit' -> App 'paidAmount'
          totalPrice: dbRes.totalAmount,      // DB 'totalAmount' -> App 'totalPrice'
          guests: dbRes.numberOfPeople        // DB 'numberOfPeople' -> App 'guests'
        }));
        setReservations(appReservations);
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
  // 2. GUARDADO DE DATOS (TRADUCCIÓN: APP -> BASE DE DATOS)
  // =========================================================================

  // Guardar Habitaciones
  useEffect(() => {
    if (rooms.length > 0) {
      const dbRooms = rooms.map(r => ({
        ...r,
        number: r.name // App 'name' -> DB 'number'
      }));
      supabase.from('rooms').upsert(dbRooms).then(({error}) => {
        if(error) console.error("Error Habitaciones:", error.message);
      });
    }
  }, [rooms]);

  // Guardar Reservas (TRADUCCIÓN CRÍTICA PARA SEÑA)
  useEffect(() => {
    if (reservations.length > 0) {
      const dbReservations = reservations.map(r => ({
        id: r.id,
        clientId: r.clientId,
        roomId: r.roomId,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        checkInTime: r.checkInTime || "14:00",
        checkOutTime: r.checkOutTime || "10:00",
        status: r.status,
        storeCharges: r.storeCharges || 0,
        paymentStatus: r.paymentStatus || 'pending',
        
        // AQUÍ OCURRE LA MAGIA:
        deposit: r.paidAmount,        // App 'paidAmount' -> DB 'deposit'
        totalAmount: r.totalPrice,    // App 'totalPrice' -> DB 'totalAmount'
        numberOfPeople: r.guests      // App 'guests' -> DB 'numberOfPeople'
      }));

      supabase.from('reservations').upsert(dbReservations).then(({ error }) => {
        if (error) console.error("❌ Error Reservas:", error.message);
        else console.log("✅ Reservas (y seña) guardadas.");
      });
    }
  }, [reservations]);

  // Guardar Productos (Stock)
  useEffect(() => {
    if (products.length > 0) {
      supabase.from('products').upsert(products).then(({ error }) => {
        if (error) console.error("Error Productos:", error.message);
      });
    }
  }, [products]);

  // Guardar Clientes
  useEffect(() => {
    if (clients.length > 0) supabase.from('clients').upsert(clients).then();
  }, [clients]);

  // Guardar Ventas
  useEffect(() => {
    if (sales.length > 0) supabase.from('sales').upsert(sales).then();
  }, [sales]);

  // Guardar Insumos
  useEffect(() => {
    if (maintenanceItems.length > 0) supabase.from('maintenanceItems').upsert(maintenanceItems).then();
  }, [maintenanceItems]);


  // --- FUNCIONES DEL SISTEMA ---
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
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock + q } : p));
  };

  const addMaintenanceItem = (m: any) => setMaintenanceItems(prev => [...prev, m]);
  const updateMaintenanceItem = (m: any) => setMaintenanceItems(prev => prev.map(item => item.id === m.id ? m : item));
  const deleteMaintenanceItem = (id: string) => {
    setMaintenanceItems(prev => prev.filter(m => m.id !== id));
    supabase.from('maintenanceItems').delete().eq('id', id).then();
  };
  const updateMaintenanceStock = (id: string, q: number) => {
    setMaintenanceItems(prev => prev.map(m => m.id === id ? { ...m, stock: m.stock + q } : m));
  };
  const updateReservationStatus = (id: string, status: any) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const getRoomById = (id: string) => rooms.find(r => r.id === id);
  const getClientById = (id: string) => clients.find(c => c.id === id);
  const restoreBackup = () => {};

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

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
