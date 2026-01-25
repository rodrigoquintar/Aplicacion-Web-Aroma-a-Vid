
import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, DollarSign, Award } from 'lucide-react';

const Reports: React.FC = () => {
  const { reservations, sales, clients } = useApp();

  const dataIncome = [
    { name: 'Ene', income: 4000 },
    { name: 'Feb', income: 3000 },
    { name: 'Mar', income: 2000 },
    { name: 'Abr', income: 2780 },
    { name: 'May', income: 1890 },
    { name: 'Jun', income: 2390 },
    { name: 'Jul', income: 3490 },
  ];

  const totalReservations = reservations.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalSales = sales.reduce((acc, curr) => acc + curr.total, 0);
  
  const dataSources = [
    { name: 'Alojamiento', value: totalReservations, color: '#4f46e5' },
    { name: 'Tienda', value: totalSales, color: '#10b981' },
  ];

  const topClients = clients.slice(0, 5).map(c => ({
      ...c,
      totalSpent: reservations
        .filter(r => r.clientId === c.id)
        .reduce((acc, r) => acc + r.totalAmount, 0)
  })).sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">Reportes Ejecutivos</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm text-slate-500">Ingreso Total Anual (Est.)</p>
                      <h3 className="text-2xl font-bold text-slate-800">$45,230</h3>
                  </div>
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <TrendingUp size={20} />
                  </div>
              </div>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                  <TrendingUp size={12} className="mr-1"/> +12% vs año anterior
              </p>
          </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm text-slate-500">Ocupación Promedio</p>
                      <h3 className="text-2xl font-bold text-slate-800">68%</h3>
                  </div>
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                      <Users size={20} />
                  </div>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-sm text-slate-500">Ticket Promedio Tienda</p>
                      <h3 className="text-2xl font-bold text-slate-800">$18.50</h3>
                  </div>
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                      <DollarSign size={20} />
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Evolución de Ingresos</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataIncome}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Fuentes de Ingreso</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dataSources}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {dataSources.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
             <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Mejores Clientes</h3>
             <Award className="text-yellow-500" />
          </div>
          <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                      <th className="p-4 font-black">Cliente</th>
                      <th className="p-4 font-black">Email</th>
                      <th className="p-4 text-right font-black">Total Gastado</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {topClients.map((client, index) => (
                      <tr key={client.id} className="text-sm hover:bg-slate-50/50">
                          <td className="p-4 font-black text-slate-900 flex items-center">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] mr-3 font-black ${index === 0 ? 'bg-yellow-400 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                  {index + 1}
                              </span>
                              {client.lastName}, {client.firstName}
                          </td>
                          <td className="p-4 text-slate-500 font-medium">{client.email || 'S/D'}</td>
                          <td className="p-4 text-right font-black text-indigo-600">${client.totalSpent.toFixed(2)}</td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
};

export default Reports;
