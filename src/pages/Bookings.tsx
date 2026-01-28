import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    clientId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    checkInTime: "14:00",
    checkOutTime: "10:00",
    totalPrice: 0,
    paidAmount: 0,
    guests: 1,
    status: "confirmada",
    notes: "",
  });

  /* ===============================
     CARGAR RESERVAS
     =============================== */
  const cargarReservas = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("checkIn", { ascending: true });

    if (error) {
      console.error("Error cargando reservas:", error);
    } else {
      setReservas(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  /* ===============================
     MANEJO FORMULARIO
     =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "totalPrice" ||
        name === "paidAmount" ||
        name === "guests"
          ? Number(value)
          : value,
    }));
  };

  /* ===============================
     GUARDAR RESERVA
     =============================== */
  const guardarReserva = async (e) => {
    e.preventDefault();

    const reserva = {
      id: crypto.randomUUID(),
      clientId: form.clientId,
      roomId: form.roomId,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      checkInTime: form.checkInTime,
      checkOutTime: form.checkOutTime,
      totalPrice: form.totalPrice,
      paidAmount: form.paidAmount,
      deposit: form.paidAmount,
      guests: form.guests,
      status: form.status,
      notes: form.notes,
    };

    const { error } = await supabase
      .from("reservations")
      .insert(reserva);

    if (error) {
      console.error("Error guardando reserva:", error);
      return;
    }

    // 🔥 fuente de verdad = Supabase
    await cargarReservas();

    // limpiar formulario
    setForm({
      clientId: "",
      roomId: "",
      checkIn: "",
      checkOut: "",
      checkInTime: "14:00",
      checkOutTime: "10:00",
      totalPrice: 0,
      paidAmount: 0,
      guests: 1,
      status: "confirmada",
      notes: "",
    });
  };

  /* ===============================
     ACTUALIZAR MONTO / SEÑA
     =============================== */
  const actualizarPago = async (id, nuevoPago) => {
    await supabase
      .from("reservations")
      .update({
        paidAmount: nuevoPago,
        deposit: nuevoPago,
      })
      .eq("id", id);

    await cargarReservas();
  };

  /* ===============================
     RENDER
     =============================== */
  if (loading) return <p>Cargando reservas...</p>;

  return (
    <div className="reservas-container">
      <h1>Reservas</h1>

      {/* ===============================
          FORMULARIO
         =============================== */}
      <form onSubmit={guardarReserva} className="form-reserva">
        <input
          name="clientId"
          placeholder="ID Cliente"
          value={form.clientId}
          onChange={handleChange}
          required
        />

        <input
          name="roomId"
          placeholder="ID Depto"
          value={form.roomId}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="checkIn"
          value={form.checkIn}
          onChange={handleChange}
          required
        />

        <input
          type="time"
          name="checkInTime"
          value={form.checkInTime}
          onChange={handleChange}
        />

        <input
          type="date"
          name="checkOut"
          value={form.checkOut}
          onChange={handleChange}
          required
        />

        <input
          type="time"
          name="checkOutTime"
          value={form.checkOutTime}
          onChange={handleChange}
        />

        <input
          type="number"
          name="totalPrice"
          placeholder="Monto total"
          value={form.totalPrice}
          onChange={handleChange}
        />

        <input
          type="number"
          name="paidAmount"
          placeholder="Seña"
          value={form.paidAmount}
          onChange={handleChange}
        />

        <input
          type="number"
          name="guests"
          min="1"
          value={form.guests}
          onChange={handleChange}
        />

        <textarea
          name="notes"
          placeholder="Notas"
          value={form.notes}
          onChange={handleChange}
        />

        <button type="submit">Guardar reserva</button>
      </form>

      {/* ===============================
          LISTADO
         =============================== */}
      <h2>Listado de reservas</h2>

      <table className="tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Depto</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Total</th>
            <th>Seña</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.roomId}</td>
              <td>
                {r.checkIn} {r.checkInTime}
              </td>
              <td>
                {r.checkOut} {r.checkOutTime}
              </td>
              <td>${Number(r.totalPrice).toLocaleString()}</td>
              <td>
                <input
                  type="number"
                  defaultValue={r.paidAmount}
                  onBlur={(e) =>
                    actualizarPago(r.id, Number(e.target.value))
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
