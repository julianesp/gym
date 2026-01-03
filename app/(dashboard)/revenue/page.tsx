"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Ticket,
  Banknote,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

type DailyData = {
  date: string;
  revenue: number;
  attendances: number;
};

type MonthlyData = {
  month: string;
  revenue: number;
  attendances: number;
};

export default function RevenuePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // En producción, estos datos vendrían de Supabase
  const dailyStats = {
    date: selectedDate,
    totalRevenue: 4500,
    cashPayments: 2100,
    cashCount: 7,
    ticketSales: 2400,
    ticketCount: 4,
    totalAttendances: 45,
    comparison: {
      revenue: 12, // % vs día anterior
      attendances: -5
    }
  };

  const monthlyStats = {
    year: 2024,
    month: 11,
    totalRevenue: 87500,
    cashPayments: 42300,
    cashCount: 156,
    ticketSales: 45200,
    ticketCount: 89,
    totalAttendances: 1234,
    comparison: {
      revenue: 23, // % vs mes anterior
      attendances: 18
    }
  };

  const last7Days: DailyData[] = [
    { date: "2024-11-22", revenue: 3800, attendances: 42 },
    { date: "2024-11-23", revenue: 4200, attendances: 48 },
    { date: "2024-11-24", revenue: 3500, attendances: 38 },
    { date: "2024-11-25", revenue: 5100, attendances: 52 },
    { date: "2024-11-26", revenue: 4600, attendances: 47 },
    { date: "2024-11-27", revenue: 3900, attendances: 43 },
    { date: "2024-11-28", revenue: 4500, attendances: 45 },
  ];

  const last6Months: MonthlyData[] = [
    { month: "Jun", revenue: 65000, attendances: 980 },
    { month: "Jul", revenue: 72000, attendances: 1050 },
    { month: "Ago", revenue: 68500, attendances: 1020 },
    { month: "Sep", revenue: 75300, attendances: 1100 },
    { month: "Oct", revenue: 71200, attendances: 1080 },
    { month: "Nov", revenue: 87500, attendances: 1234 },
  ];

  const currentStats = selectedPeriod === "daily" ? dailyStats : monthlyStats;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Ingresos y Reportes</h1>
          <p className="text-gray-400">Analiza tus ingresos diarios y mensuales</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 bg-gray-900 border border-gray-800 rounded-lg p-1">
          <button
            onClick={() => setSelectedPeriod("daily")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedPeriod === "daily"
                ? "bg-red-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Diario
          </button>
          <button
            onClick={() => setSelectedPeriod("monthly")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              selectedPeriod === "monthly"
                ? "bg-red-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Mensual
          </button>
        </div>
      </div>

      {/* Date Picker for Daily */}
      {selectedPeriod === "daily" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            {currentStats.comparison.revenue >= 0 ? (
              <div className="flex items-center gap-1 text-green-500 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{currentStats.comparison.revenue}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <ArrowDownRight className="w-4 h-4" />
                <span>{currentStats.comparison.revenue}%</span>
              </div>
            )}
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Ingresos Totales</h3>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(currentStats.totalRevenue)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            vs {selectedPeriod === "daily" ? "día anterior" : "mes anterior"}
          </p>
        </div>

        {/* Cash Payments */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Banknote className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Pagos en Efectivo</h3>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(currentStats.cashPayments)}
          </p>
          <p className="text-xs text-gray-500 mt-2">{currentStats.cashCount} sesiones</p>
        </div>

        {/* Ticket Sales */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <Ticket className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Venta de Tiqueteras</h3>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(currentStats.ticketSales)}
          </p>
          <p className="text-xs text-gray-500 mt-2">{currentStats.ticketCount} tiqueteras</p>
        </div>

        {/* Total Attendances */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500/10 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
            {currentStats.comparison.attendances >= 0 ? (
              <div className="flex items-center gap-1 text-green-500 text-sm">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{currentStats.comparison.attendances}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <ArrowDownRight className="w-4 h-4" />
                <span>{currentStats.comparison.attendances}%</span>
              </div>
            )}
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Asistencias Totales</h3>
          <p className="text-3xl font-bold text-white">{currentStats.totalAttendances}</p>
          <p className="text-xs text-gray-500 mt-2">
            vs {selectedPeriod === "daily" ? "día anterior" : "mes anterior"}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Tendencia de Ingresos - {selectedPeriod === "daily" ? "Últimos 7 Días" : "Últimos 6 Meses"}
          </h3>
          <div className="space-y-3">
            {selectedPeriod === "daily" ? (
              last7Days.map((item, i) => {
                const maxRevenue = Math.max(...last7Days.map(d => d.revenue));
                const percentage = (item.revenue / maxRevenue) * 100;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{item.date}</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              last6Months.map((item, i) => {
                const maxRevenue = Math.max(...last6Months.map(d => d.revenue));
                const percentage = (item.revenue / maxRevenue) * 100;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{item.month}</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Attendances Trend */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Tendencia de Asistencias - {selectedPeriod === "daily" ? "Últimos 7 Días" : "Últimos 6 Meses"}
          </h3>
          <div className="space-y-3">
            {selectedPeriod === "daily" ? (
              last7Days.map((item, i) => {
                const maxAttendances = Math.max(...last7Days.map(d => d.attendances));
                const percentage = (item.attendances / maxAttendances) * 100;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{item.date}</span>
                      <span className="text-white font-semibold">{item.attendances}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              last6Months.map((item, i) => {
                const maxAttendances = Math.max(...last6Months.map(d => d.attendances));
                const percentage = (item.attendances / maxAttendances) * 100;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{item.month}</span>
                      <span className="text-white font-semibold">{item.attendances}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Desglose de Ingresos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cash vs Tickets */}
          <div>
            <h4 className="text-gray-400 text-sm mb-4">Distribución por Tipo de Pago</h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Efectivo</span>
                  <span className="text-blue-400 font-semibold">
                    {formatCurrency(currentStats.cashPayments)}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{
                      width: `${(currentStats.cashPayments / currentStats.totalRevenue) * 100}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((currentStats.cashPayments / currentStats.totalRevenue) * 100)}% del total
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Tiqueteras</span>
                  <span className="text-purple-400 font-semibold">
                    {formatCurrency(currentStats.ticketSales)}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full"
                    style={{
                      width: `${(currentStats.ticketSales / currentStats.totalRevenue) * 100}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((currentStats.ticketSales / currentStats.totalRevenue) * 100)}% del total
                </p>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div>
            <h4 className="text-gray-400 text-sm mb-4">Insights y Estadísticas</h4>
            <div className="space-y-3">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-300">Promedio por Asistencia</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(currentStats.totalRevenue / currentStats.totalAttendances)}
                </p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-300">Promedio por Día</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {selectedPeriod === "daily"
                    ? currentStats.totalAttendances
                    : Math.round(currentStats.totalAttendances / 30)} asistencias
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
