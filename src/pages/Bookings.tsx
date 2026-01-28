import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Reservation } from "../context/AppContext";

const initialForm: Partial<Reservation> = {
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
};

export default function Bookings() {
  const { reservas, crearReserva, actualizarReserva, loading } = useApp();
  const [form, setForm] = useState(initialForm);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await crearReserva(form);
    if (ok) setForm(initialForm);
  };

  if (loading) return <p>Cargando reservas...</p>;

  return (
    <div>
      <h1>Reservas</h1>

      {/* FORM */}
      <form onSubmit={guardar}>
        <input name="clientId" placeholder="Cliente" onChange={handleChange} />
        <input name="roomId" placeholder="Depto" onChange={handleChange} />

        <input type="date" name="checkIn" onChange={handleChange} />
        <input type="time" name="checkInTime" onChange={handleChange} />

        <input type="date" name="checkOut" onChange={handleChange} />
        <input type="time" name="checkOutTime" onChange={handleChange} />

        <input
          type="number"
          name="totalPrice"
          placeholder="Total"
          onChange={handleChange}
        />

        <input
          type="number"
          name="paidAmount"
          placeholder="Seña"
          onChange={handleChange}
        />

        <button type="submit">Guardar</button>
      </form>

      {/* LISTADO */}
      <table>
        <thead>
          <tr>
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
              <td>{r.roomId}</td>
              <td>
                {r.checkIn} {r.checkInTime}
              </td>
              <td>
                {r.checkOut} {r.checkOutTime}
              </td>
              <td>${r.totalPrice}</td>
              <td>
                <input
                  type="number"
                  defaultValue={r.paidAmount}
                  onBlur={(e) =>
                    actualizarReserva(r.id, {
                      paidAmount: Number(e.target.value),
                      deposit: Number(e.target.value),
                    })
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
