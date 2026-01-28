import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

/* ===============================
   TIPOS
   =============================== */
export interface Reservation {
  id: string;
  clientId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  totalPrice: number;
  paidAmount: number;
  deposit: number;
  guests: number;
  status: string;
  notes?: string;
}

export interface Room {
  id: string;
  number: string;
  type?: string;
  price: number;
  capacity?: number;
  status?: string;
}

interface AppContextType {
  reservas: Reservation[];
  rooms: Room[];
  loading: boolean;
  crearReserva: (data: Partial<Reservation>) => Promise<boolean>;
  actualizarReserva: (
    id: string,
    cambios: Partial<Reservation>
  ) => Promise<void>;
  actualizarRoom: (id: string, cambios: Partial<Room>) => Promise<void>;
}

/* ===============================
   CONTEXTO
   =============================== */
const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
     CARGA INICIAL
     =============================== */
  const cargarReservas = async () => {
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .order("checkIn", { ascending: true });

    setReservas((data as Reservation[]) || []);
  };

  const cargarRooms = async () => {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .order("number", { ascending: true });

    setRooms((data as Room[]) || []);
  };

  useEffect(() => {
    Promise.all([cargarReservas(), cargarRooms()]).finally(() =>
      setLoading(false)
    );
  }, []);

  /* ===============================
     ACCIONES
     =============================== */
  const crearReserva = async (data: Partial<Reservation>) => {
    const reserva: Reservation = {
      id: crypto.randomUUID(),
      clientId: data.clientId!,
      roomId: data.roomId!,
      checkIn: data.checkIn!,
      checkOut: data.checkOut!,
      checkInTime: data.checkInTime || "14:00",
      checkOutTime: data.checkOutTime || "10:00",
      totalPrice: data.totalPrice || 0,
      paidAmount: data.paidAmount || 0,
      deposit: data.paidAmount || 0,
      guests: data.guests || 1,
      status: data.status || "confirmada",
      notes: data.notes || "",
    };

    const { error } = await supabase
      .from("reservations")
      .insert(reserva);

    if (error) return false;

    await cargarReservas();
    return true;
  };

  const actualizarReserva = async (
    id: string,
    cambios: Partial<Reservation>
  ) => {
    await supabase.from("reservations").update(cambios).eq("id", id);
    await cargarReservas();
  };

  const actualizarRoom = async (id: string, cambios: Partial<Room>) => {
    await supabase.from("rooms").update(cambios).eq("id", id);
    await cargarRooms();
  };

  return (
    <AppContext.Provider
      value={{
        reservas,
        rooms,
        loading,
        crearReserva,
        actualizarReserva,
        actualizarRoom,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
