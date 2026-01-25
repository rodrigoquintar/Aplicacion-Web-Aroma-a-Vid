
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign, ShoppingBag, Home, TrendingUp, Calendar } from 'lucide-react';

const Finances: React.FC = () => {
  const { reservations, sales, rooms } = useApp();
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year'>('month');

  const isWithinTimeframe = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (timeFilter === 'day') return d.getTime() === n.getTime();
    if (timeFilter === 'week') {
        const oneWeekAgo = new Date(n);
        oneWeekAgo.setDate(n.getDate() - 7);
        return d >= oneWeekAgo && d <= n;
    }
    if (timeFilter === 'month') return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    if (timeFilter === 'year') return d.getFullYear() === n.getFullYear();
    return true;
  };

  const filteredReservations = reservations.filter(r => isWithinTimeframe(r.checkIn));
  const roomRevenue = filteredReservations.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const filteredSales = sales.filter(s => isWithinTimeframe(s.date));
  const shopRevenue = filteredSales.reduce((acc, curr) => acc + curr.total, 0);

  const totalRevenue = roomRevenue + shopRevenue;

  const getFilterLabel = () => {
      switch(timeFilter) {
          case 'day': return 'Hoy';
          case 'week': return 'Últimos 7 días';
          case 'month': return 'Este Mes';
          case 'year': return 'Este Año';
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Finanzas</h2>
        
        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
            <button onClick={() => setTimeFilter('day')} className={`px-4 py-1 rounded text-sm font-medium ${timeFilter === 'day' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Diario</button>
            <button onClick={() => setTimeFilter('week')} className={`px-4 py-1 rounded text-sm font-medium ${timeFilter === 'week' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Semanal</button>
            <button onClick={() => setTimeFilter('month')} className={`px-4 py-1 rounded text-sm font-medium ${timeFilter === 'month' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Mensual</button>
            <button onClick={() => setTimeFilter('year')} className={`px-4 py-1 rounded text-sm font-medium ${timeFilter === 'year' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Anual</button>
        </div>
      </div>

      <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl flex items-center text-slate-600 mb-6 font-bold text-sm">
          <Calendar size={18} className="mr-3 text-indigo-500" />
          <span>Reporte consolidado para: <strong className="text-slate-900">{getFilterLabel()}</strong></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <Home size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Ingresos Deptos</p>
              <h3 className="text-2xl font-bold text-slate-800">${roomRevenue.toFixed(2)}</h3>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: totalRevenue > 0 ? `${(roomRevenue / totalRevenue) * 100}%` : '0%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Ingresos Tienda</p>
              <h3 className="text-2xl font-bold text-slate-800">${shopRevenue.toFixed(2)}</h3>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: totalRevenue > 0 ? `${(shopRevenue / totalRevenue) * 100}%` : '0%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Consolidado</p>
              <h3 className="text-2xl font-bold text-slate-800">${totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Reservas ({getFilterLabel()})</h3>
          </div>
          <div className="overflow-y-auto max-h-80">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-black">
                <tr>
                  <th className="p-4">ID Reserva</th>
                  <th className="p-4">Depto</th>
                  <th className="p-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.length > 0 ? filteredReservations.map(res => (
                  <tr key={res.id} className="text-sm hover:bg-slate-50/50">
                    <td className="p-4 font-black text-slate-400">#{res.id.slice(-4)}</td>
                    <td className="p-4 font-bold text-slate-900">{rooms.find(r => r.id === res.roomId)?.number}</td>
                    <td className="p-4 text-right font-black text-slate-900">${res.totalAmount}</td>
                  </tr>
                )) : (
                    <tr><td colSpan={3} className="p-8 text-center text-slate-400 font-bold italic">Sin movimientos registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Ventas Tienda ({getFilterLabel()})</h3>
          </div>
          <div className="overflow-y-auto max-h-80">
             <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-black">
                <tr>
                  <th className="p-4">Depto / Pago</th>
                  <th className="p-4 text-right">Items</th>
                  <th className="p-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.length > 0 ? filteredSales.slice().reverse().map(sale => {
                  const linkedRes = reservations.find(r => r.id === sale.reservationId);
                  const room = linkedRes ? rooms.find(room => room.id === linkedRes.roomId) : null;
                  return (
                    <tr key={sale.id} className="text-sm hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className={`font-black uppercase text-[10px] ${room ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {room ? `Hab. ${room.number}` : 'Venta Directa'}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{new Date(sale.date).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4 text-right text-slate-900 font-bold">
                        {sale.items.length}
                      </td>
                      <td className="p-4 text-right font-black text-emerald-600">${sale.total.toFixed(2)}</td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={3} className="p-8 text-center text-slate-400 font-bold italic text-sm">Sin ventas registradas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finances;
