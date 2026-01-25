import React from 'react';
import { useApp } from '../context/AppContext';
import { RoomStatus, ReservationStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, BedDouble, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { rooms, reservations, sales } = useApp();

  const occupiedRooms = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
  const availableRooms = rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
  const maintenanceRooms = rooms.filter(r => r.status === RoomStatus.MAINTENANCE || r.status === RoomStatus.CLEANING).length;

  const activeReservations = reservations.filter(r => r.status === ReservationStatus.CHECKED_IN).length;
  const todayRevenue = sales.reduce((acc, curr) => acc + curr.total, 0); // Simplified logic

  const statusData = [
    { name: 'Ocupadas', value: occupiedRooms, color: '#4f46e5' },
    { name: 'Disponibles', value: availableRooms, color: '#22c55e' },
    { name: 'Mantenimiento/Limp', value: maintenanceRooms, color: '#f59e0b' },
  ];

  const occupancyRate = Math.round((occupiedRooms / rooms.length) * 100);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">Panel de Control</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <BedDouble size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Ocupación Actual</p>
            <p className="text-2xl font-bold text-slate-800">{occupancyRate}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Ventas Tienda (Hoy)</p>
            <p className="text-2xl font-bold text-slate-800">${todayRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Huéspedes Activos</p>
            <p className="text-2xl font-bold text-slate-800">{activeReservations}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Limpieza Pendiente</p>
            <p className="text-2xl font-bold text-slate-800">{rooms.filter(r => r.status === RoomStatus.CLEANING).length}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Estado de Habitaciones</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {statusData.map((item, idx) => (
                <div key={idx} className="flex items-center text-sm text-slate-600">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                    {item.name}: {item.value}
                </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Reservas Semanales (Demo)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Lun', bookings: 4 },
                  { name: 'Mar', bookings: 3 },
                  { name: 'Mie', bookings: 2 },
                  { name: 'Jue', bookings: 6 },
                  { name: 'Vie', bookings: 8 },
                  { name: 'Sab', bookings: 10 },
                  { name: 'Dom', bookings: 7 },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="bookings" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;