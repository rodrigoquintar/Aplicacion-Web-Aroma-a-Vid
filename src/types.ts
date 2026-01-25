
export enum RoomStatus {
  AVAILABLE = 'Disponible',
  OCCUPIED = 'Ocupada',
  MAINTENANCE = 'Mantenimiento',
  CLEANING = 'Limpieza',
}

export enum ReservationStatus {
  PENDING = 'Pendiente',
  CONFIRMED = 'Confirmada',
  CHECKED_IN = 'Check-in',
  CHECKED_OUT = 'Check-out',
  CANCELLED = 'Cancelada',
}

export enum PaymentStatus {
  PENDING = 'Pendiente',
  PARTIAL = 'Parcial',
  PAID = 'Pagado',
}

export type UserRole = 'admin' | 'receptionist';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  status: RoomStatus;
  description: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  platform: string; 
  email?: string;
  phone: string;
}

export interface Reservation {
  id: string;
  clientId: string;
  roomId: string;
  checkIn: string; 
  checkOut: string; 
  checkInTime?: string;
  checkOutTime?: string;
  status: ReservationStatus;
  totalAmount: number; 
  deposit?: number; 
  paymentStatus: PaymentStatus;
  storeCharges: number; 
  numberOfPeople: number; // Nuevo campo
  occupancyType?: 'full' | '2pax';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface MaintenanceItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string; 
  minStock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  reservationId?: string;
}
