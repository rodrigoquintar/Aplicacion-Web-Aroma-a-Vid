const handleSaveBooking = async () => {
  try {
    const bookingData = {
      id: bookingId, // el ID que ya usás
      clientId: selectedClientId,
      roomId: selectedRoomId,
      checkIn,
      checkOut,
      checkInTime,
      checkOutTime,
      status,
      guests: Number(guests) || 1,

      // 🔴 CLAVE: convertir a Number
      totalPrice: Number(totalPrice) || 0,
      paidAmount: Number(paidAmount) || 0,
      deposit: Number(deposit) || 0,
      totalAmount: Number(totalPrice) || 0,

      paymentStatus,
      storeCharges: Number(storeCharges) || 0,
      notes
    };

    console.log("DATA QUE SE GUARDA EN SUPABASE", bookingData);

    const { error } = await supabase
      .from("reservations")
      .upsert(bookingData); // upsert evita duplicados

    if (error) throw error;

    alert("Reserva guardada correctamente");
  } catch (err) {
    console.error("Error guardando reserva:", err);
    alert("Error al guardar la reserva");
  }
};
