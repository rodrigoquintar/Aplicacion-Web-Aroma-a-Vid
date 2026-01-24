
import { Room, RoomStatus, Client, Product, Reservation, MaintenanceItem, ReservationStatus, PaymentStatus } from './types';

export const INITIAL_ROOMS: Room[] = [
  { id: '101', number: 'Depto 1', type: 'Suite Familiar', capacity: 4, status: RoomStatus.AVAILABLE, description: 'Vista al lago, cama king' },
  { id: '102', number: 'Depto 2', type: 'Suite Familiar', capacity: 4, status: RoomStatus.AVAILABLE, description: 'Cerca de la piscina' },
  { id: '103', number: 'Depto 3', type: 'Doble Standard', capacity: 2, status: RoomStatus.AVAILABLE, description: 'Ideal parejas' },
  { id: '104', number: 'Depto 4', type: 'Doble Standard', capacity: 2, status: RoomStatus.AVAILABLE, description: 'Privacidad total' },
  { id: '105', number: 'Depto 5', type: 'Eco Lodge', capacity: 3, status: RoomStatus.AVAILABLE, description: 'Experiencia rústica' },
  { id: '106', number: 'Depto 6', type: 'Eco Lodge', capacity: 3, status: RoomStatus.AVAILABLE, description: 'Junto al bosque' },
];

export const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', firstName: 'Juan', lastName: 'Pérez', platform: 'WhatsApp', email: 'juan@email.com', phone: '+54 11 2233-4455' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Agua Mineral 500ml', category: 'Bebidas', price: 2.50, stock: 50 },
  { id: 'p2', name: 'Cerveza Artesanal', category: 'Bebidas', price: 5.00, stock: 24 },
  { id: 'p3', name: 'Papas Fritas', category: 'Snacks', price: 3.00, stock: 30 },
];

export const INITIAL_MAINTENANCE_ITEMS: MaintenanceItem[] = [
  { id: 'm1', name: 'Papel Higiénico (Pack x4)', category: 'Baño', stock: 20, unit: 'paquetes', minStock: 5 },
  { id: 'm2', name: 'Limpiador de Pisos', category: 'Limpieza', stock: 5, unit: 'litros', minStock: 2 },
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'R101',
    clientId: 'c1',
    roomId: '101',
    checkIn: '2024-05-15',
    checkOut: '2024-05-20',
    status: ReservationStatus.CONFIRMED,
    totalAmount: 600,
    deposit: 200,
    paymentStatus: PaymentStatus.PARTIAL,
    storeCharges: 0,
    numberOfPeople: 2,
    occupancyType: 'full'
  }
];
