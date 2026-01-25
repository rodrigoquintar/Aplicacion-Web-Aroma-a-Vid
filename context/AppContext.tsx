
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Room, Client, Product, Reservation, Sale, RoomStatus, ReservationStatus, MaintenanceItem, User } from '../types';
import { INITIAL_ROOMS, INITIAL_CLIENTS, INITIAL_PRODUCTS, INITIAL_RESERVATIONS, INITIAL_MAINTENANCE_ITEMS } from '../constants';

// Conexión a la nube
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PIN_ADMIN = "0209";
const PIN_REC = "1011";

const USERS: Record<string, User> = {
  [PIN_ADMIN]: { id: 'u1', name: 'Admin General', role: 'admin' },
  [PIN_REC]: { id: 'u2', name: 'Recepcionista', role: 'receptionist' },
};

// ... (Interfaz AppContextType se mantiene igual que la tuya)

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
      
      // ... repetir para clientes y productos
    };
    loadCloudData();
  }, []);

  // GUARDAR AUTOMÁTICAMENTE CUANDO ALGO CAMBIE
  useEffect(() => {
    const sync = async () => {
      await supabase.from('rooms').upsert(rooms);
      await supabase.from('reservations').upsert(reservations);
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

  // ... (Aquí van tus funciones addRoom, updateRoom, etc., que ya tienes)
  // Las funciones funcionarán igual, pero los useEffect de arriba se encargan de subir los cambios.

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