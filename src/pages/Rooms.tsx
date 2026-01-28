import { useApp } from "../context/AppContext";

export default function Rooms() {
  const { rooms, actualizarRoom, loading } = useApp();

  if (loading) return <p>Cargando habitaciones...</p>;

  return (
    <div>
      <h1>Habitaciones</h1>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre / Número</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Capacidad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>

              <td>
                <input
                  defaultValue={r.number}
                  onBlur={(e) =>
                    actualizarRoom(r.id, { number: e.target.value })
                  }
                />
              </td>

              <td>{r.type}</td>

              <td>
                <input
                  type="number"
                  defaultValue={r.price}
                  onBlur={(e) =>
                    actualizarRoom(r.id, { price: Number(e.target.value) })
                  }
                />
              </td>

              <td>{r.capacity}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
