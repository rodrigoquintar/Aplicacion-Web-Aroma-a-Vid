import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useApp } from '../context/AppContext';

const Bookings: React.FC = () => {
  // --- Acá tendrías que tener tus estados (esto es un ejemplo, ajustalo a tus campos) ---
  const [bookingId, setBookingId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('10:00');
  const [status, setStatus] = useState('confirmada');
  const [guests, setGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState('pendiente');
  const [storeCharges, setStoreCharges] = useState(0);
  const [notes, setNotes] = useState('');

  // --- TU FUNCIÓN (La que me pasaste) ---
  const handleSaveBooking = async () => {
    try {
      const bookingData = {
        id: bookingId || crypto.randomUUID(), // Genera un ID si no hay uno
        clientId: selectedClientId,
        roomId: selectedRoomId,
        checkIn,
        checkOut,
        checkInTime,
        checkOutTime,
        status,
        guests: Number(guests) || 1,
        totalPrice: Number(totalPrice) || 0,
        paidAmount: Number(paidAmount) || 0,
        deposit: Number(deposit) || 0,
        totalAmount: Number(totalPrice) || 0,
        paymentStatus,
        storeCharges: Number(storeCharges) || 0,
        notes
      };

      const { error } = await supabase
        .from("reservations")
        .upsert(bookingData);

      if (error) throw error;
      alert("Reserva guardada correctamente");
    } catch (err) {
      console.error("Error guardando reserva:", err);
      alert("Error al guardar la reserva");
    }
  };

  // --- LO QUE SE VE EN PANTALLA ---
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestión de Reservas</h2>
      <p className="text-slate-600 mb-6">Aquí va el formulario para cargar los datos de la reserva.</p>
      
      {/* Ejemplo de botón para disparar tu función */}
      <button 
        onClick={handleSaveBooking}
        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold"
      >
        GUARDAR RESERVA
      </button>
    </div>
  );
};

// 🔴 ESTA LÍNEA ES LA QUE PIDE VERCEL (Exportación por defecto)
export default Bookings;
