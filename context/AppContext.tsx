import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Room, Client, Product, Reservation, Sale, MaintenanceItem, User } from '../types';
import { INITIAL_ROOMS, INITIAL_CLIENTS } from '../constants';

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

  // 1. CARGA DE DATOS (Adaptando nombres de DB a la App)
  useEffect(() => {
    const loadAllData = async () => {
      const { data: r } = await supabase.from('rooms').select('*');
      if (r) setRooms(r);
      
      const { data: cl } = await supabase.from('clients').select('*');
      if (cl) setClients(cl);

      const { data: res } = await supabase.from('reservations').select('*');
      if (res) {
        // Mapeamos lo que viene de la DB a lo que usa tu Frontend
        setReservations(res.map((item: any) => ({
          ...item,
          totalAmount: Number(item.totalPrice || 0), // DB: totalPrice -> App: totalAmount
          deposit: Number(item.deposit || 0),
          numberOfPeople: Number(item.guests || 1),  // DB: guests -> App: numberOfPeople
          checkInTime: item.checkInTime || "14:00"
        })));
      }

      const { data: prod } = await supabase.from('products').select('*');
      if (prod) setProducts(prod.map((p: any) => ({ ...p, stock: Number(p.stock || 0) })));

      const { data: maint } = await supabase.from('maintenanceItems').select('*');
      if (maint) setMaintenanceItems(maint.map((m: any) => ({ ...m, stock: Number(m.stock || 0) })));
    };
    loadAllData();
  }, []);

  // 2. FUNCIONES DE HABITACIONES
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

  const deleteRoom = async (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    await supabase.from('rooms').delete().eq('id', id);
  };

  // 3. FUNCIONES DE RESERVAS (Aquí está la corrección de nombres para Supabase)
  const addReservation = async (res: any) => {
    setReservations(prev => [...prev, res]);
    await supabase.from('reservations').insert({
      id: res.id,
      clientId: res.clientId,
      roomId: res.roomId,
      checkIn: res.checkIn,
      checkOut: res.checkOut,
      status: res.status,
      totalPrice: Number(res.totalAmount), // Enviamos como totalPrice
      deposit: Number(res.deposit),
      guests: Number(res.numberOfPeople),  // Enviamos como guests
      checkInTime: res.checkInTime || "14:00",
      paymentStatus: res.paymentStatus || 'PENDING'
    });
  };

  const updateReservation = async (res: any) => {
    setReservations(prev => prev.map(r => r.id === res.id ? res : r));
    await supabase.from('reservations').update({
      clientId: res.clientId,
      roomId: res.roomId,
      checkIn: res.checkIn,
      checkOut: res.checkOut,
      status: res.status,
      totalPrice: Number(res.totalAmount),
      deposit: Number(res.deposit),
      guests: Number(res.numberOfPeople),
      checkInTime: res.checkInTime || "14:00"
    }).eq('id', res.id);
  };

  const deleteReservation = async (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    await supabase.from('reservations').delete().eq('id', id);
  };

  const addClient = async (client: any) => {
    setClients(prev => [...prev, client]);
    await supabase.from('clients').upsert(client);
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
      login, logout, addRoom, updateRoom, deleteRoom, addClient, addReservation,
      updateReservation, deleteReservation, 
      getRoomById: (id: string) => rooms.find(r => r.id === id),
      getClientById: (id: string) => clients.find(c => c.id === id)
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
