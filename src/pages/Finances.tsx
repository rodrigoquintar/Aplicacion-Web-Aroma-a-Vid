import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Finanzas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
     CARGAR RESERVAS DESDE SUPABASE
     =============================== */
  const cargarReservas = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("reservations")
      .select(`
        id,
        roomId,
        checkIn,
        checkOut,
        checkInTime,
        checkOutTime,
        totalPrice,
        paidAmount,
        deposit,
        status
      `);

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
     CÁLCULOS FINANCIEROS REALES
     =============================== */
  const ingresosDeptos = reservas.reduce(
    (sum, r) => sum + Number(r.totalPrice || 0),
    0
  );

  const totalSenias = reservas.reduce(
    (sum, r) => sum + Number(r.paidAmount || r.deposit || 0),
    0
  );

  const totalConsolidado = ingresosDeptos; // Tienda después si querés

  /* ===============================
     RENDER
     =============================== */
  if (loading) {
    return <p>Cargando finanzas...</p>;
  }

  return (
    <div className="finanzas-container">
      <h1>Finanzas</h1>

      {/* ===============================
          TOTALES
         =============================== */}
      <div className="cards">
        <div className="card">
          <h3>Ingresos Deptos</h3>
          <p>${ingresosDeptos.toLocaleString()}</p>
        </div>

        <div className="card">
          <h3>Señas cobradas</h3>
          <p>${totalSenias.toLocaleString()}</p>
        </div>

        <div className="card">
          <h3>Total Consolidado</h3>
          <p>${totalConsolidado.toLocaleString()}</p>
        </div>
      </div>

      {/* ===============================
          TABLA RESERVAS
         =============================== */}
      <h2>Reservas (este mes)</h2>

      <table className="tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Depto</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Monto</th>
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
              <td>${Number(r.totalPrice || 0).toLocaleString()}</td>
              <td>${Number(r.paidAmount || r.deposit || 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
