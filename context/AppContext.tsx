import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Room, Client, Product, Reservation, Sale, MaintenanceItem, User } from '../types';
import { INITIAL_ROOMS, INITIAL_CLIENTS, INITIAL_PRODUCTS, INITIAL_RESERVATIONS, INITIAL_MAINTENANCE_ITEMS } from '../constants';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // 1. CARGA DE DATOS INICIAL
  useEffect(() => {
    const loadAllData = async () => {
      const { data: r } = await supabase.from('rooms').select('*');
      if (r) setRooms(r);
      
      const { data: cl } = await supabase.from('clients').select('*');
      if (cl) setClients(cl);

      const { data: res } = await supabase.from('reservations').select('*');
      if (res) {
        setReservations(res.map((item: any) => ({
          ...item,
          totalAmount: Number(item.totalAmount || 0),
          deposit: Number(item.deposit || 0),
          numberOfPeople: Number(item.numberOfPeople || 1),
          checkInTime: item.checkInTime || "14:00"
        })));
      }

      const { data: prod } = await supabase.from('products').select('*');
      if (prod) setProducts(prod.map((p: any) => ({ ...p, stock: Number(p.stock || 0) })));

      const { data: sls } = await supabase.from('sales').select('*');
      if (sls) setSales(sls);

      const { data: maint } = await supabase.from('maintenanceItems').select('*');
      if (maint) setMaintenanceItems(maint.map((m: any) => ({ ...m, stock: Number(m.stock || 0) })));
    };
    loadAllData();
  }, []);

  // 2. FUNCIONES DE HABITACIONES (ROOMS)
  const addRoom = async (room: any) => {
    setRooms(prev => [...prev, room]);
    await supabase.from('rooms').upsert(room);
  };

  const updateRoom = async (room: any) => {
    setRooms(prev => prev.map(r => r.id === room.id ? room : r));
    await supabase.from('rooms').upsert({
      id: room.id,
      number: room.number,
      type: room.type,
      capacity: Number(room.capacity),
      description: room.description,
      status: room.status
    });
  };

  const updateRoomStatus = async (id: string, status: any) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    await supabase.from('rooms').update({ status }).eq('id', id);
  };

  const deleteRoom = async (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    await supabase.from('rooms').delete().eq('id', id);
  };

  // 3. FUNCIONES DE RESERVAS (BOOKINGS)
  const addReservation = async (res: any) => {
    setReservations(prev => [...prev, res]);
    await supabase.from('reservations').upsert(res);
  };

  const updateReservation = async (res: any) => {
    setReservations(prev => prev.map(r => r.id === res.id ? res : r));
    await supabase.from('reservations').upsert({
      id: res.id,
      clientId: res.clientId,
      roomId: res.roomId,
      checkIn: res.checkIn,
      checkOut: res.checkOut,
      status: res.status,
      totalAmount: Number(res.totalAmount),
      deposit: Number(res.deposit),
      numberOfPeople: Number(res.numberOfPeople),
      checkInTime: res.checkInTime || "14:00"
    });
  };

  const deleteReservation = async (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    await supabase.from('reservations').delete().eq('id', id);
  };

  // 4. CLIENTES, PRODUCTOS Y OTROS
  const addClient = async (client: any) => {
    setClients(prev => [...prev, client]);
    await supabase.from('clients').upsert(client);
  };

  const updateProductStock = async (id: string, q: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newStock = Number(p.stock) + q;
        supabase.from('products').update({ stock: newStock }).eq('id', id).then();
        return { ...p, stock: newStock };
      }
      return p;
    }));
  };

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

  return (
    <AppContext.Provider value={{
      rooms, clients, products, maintenanceItems, reservations, sales, currentUser, isLoggedIn: !!currentUser,
      login, logout, updateRoomStatus, addRoom, updateRoom, deleteRoom, addClient, addReservation,
      updateReservation, deleteReservation, updateProductStock, getRoomById: (id: string) => rooms.find(r => r.id === id),
      getClientById: (id: string) => clients.find(c => c.id === id)
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
