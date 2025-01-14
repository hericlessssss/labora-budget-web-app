import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '../components/LoadingSpinner';

type DashboardStats = {
  pendingCount: number;
  pendingValue: number;
  approvedCount: number;
  approvedValue: number;
  rejectedCount: number;
  rejectedValue: number;
  totalValue: number;
  recentQuotes: Array<{
    id: string;
    number: number;
    client_name: string;
    value: number;
    status: string;
    rejection_reason?: string;
    created_at: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    pendingValue: number;
    approvedValue: number;
    rejectedValue: number;
    totalValue: number;
  }>;
};

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    pendingCount: 0,
    pendingValue: 0,
    approvedCount: 0,
    approvedValue: 0,
    rejectedCount: 0,
    rejectedValue: 0,
    totalValue: 0,
    recentQuotes: [],
    monthlyRevenue: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data: quotes, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (quotes) {
        const pendingQuotes = quotes.filter(q => q.status === 'pending');
        const approvedQuotes = quotes.filter(q => q.status === 'approved');
        const rejectedQuotes = quotes.filter(q => q.status === 'rejected');
        
        const pendingCount = pendingQuotes.length;
        const pendingValue = pendingQuotes.reduce((sum, q) => sum + (q.value || 0), 0);
        
        const approvedCount = approvedQuotes.length;
        const approvedValue = approvedQuotes.reduce((sum, q) => sum + (q.value || 0), 0);

        const rejectedCount = rejectedQuotes.length;
        const rejectedValue = rejectedQuotes.reduce((sum, q) => sum + (q.value || 0), 0);
        
        const totalValue = quotes.reduce((sum, q) => sum + (q.value || 0), 0);
        const recentQuotes = quotes.slice(0, 5);

        const monthlyRevenue = Array.from({ length: 6 }).map((_, index) => {
          const currentMonth = subMonths(new Date(), index);
          const start = startOfMonth(currentMonth);
          const end = endOfMonth(currentMonth);

          const monthQuotes = quotes.filter(quote => {
            const quoteDate = new Date(quote.created_at);
            return quoteDate >= start && quoteDate <= end;
          });

          const monthPendingValue = monthQuotes
            .filter(q => q.status === 'pending')
            .reduce((sum, q) => sum + (q.value || 0), 0);

          const monthApprovedValue = monthQuotes
            .filter(q => q.status === 'approved')
            .reduce((sum, q) => sum + (q.value || 0), 0);

          const monthRejectedValue = monthQuotes
            .filter(q => q.status === 'rejected')
            .reduce((sum, q) => sum + (q.value || 0), 0);

          return {
            month: format(currentMonth, 'MMMM/yyyy', { locale: ptBR }),
            pendingValue: monthPendingValue,
            approvedValue: monthApprovedValue,
            rejectedValue: monthRejectedValue,
            totalValue: monthPendingValue + monthApprovedValue + monthRejectedValue,
          };
        }).reverse();

        setStats({
          pendingCount,
          pendingValue,
          approvedCount,
          approvedValue,
          rejectedCount,
          rejectedValue,
          totalValue,
          recentQuotes,
          monthlyRevenue,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      pending: { text: 'Pendente', className: 'text-yellow-600' },
      approved: { text: 'Aprovado', className: 'text-green-600' },
      rejected: { text: 'Rejeitado', className: 'text-red-600' },
    };
    return statusMap[status] || { text: status, className: 'text-gray-600' };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text font-poppins">Dashboard</h1>
          <p className="text-gray-600 font-open-sans">Bem-vindo ao sistema de orçamentos</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold text-yellow-800 font-poppins mb-2">Orçamentos Pendentes</h3>
            <div className="text-3xl font-bold text-yellow-600">
              {loading ? <LoadingSpinner /> : stats.pendingCount}
            </div>
            <div className="mt-2 text-sm text-yellow-700">
              Valor total: {loading ? <LoadingSpinner /> : formatCurrency(stats.pendingValue)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold text-green-800 font-poppins mb-2">Orçamentos Aprovados</h3>
            <div className="text-3xl font-bold text-green-600">
              {loading ? <LoadingSpinner /> : stats.approvedCount}
            </div>
            <div className="mt-2 text-sm text-green-700">
              Valor total: {loading ? <LoadingSpinner /> : formatCurrency(stats.approvedValue)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold text-red-800 font-poppins mb-2">Orçamentos Rejeitados</h3>
            <div className="text-3xl font-bold text-red-600">
              {loading ? <LoadingSpinner /> : stats.rejectedCount}
            </div>
            <div className="mt-2 text-sm text-red-700">
              Valor total: {loading ? <LoadingSpinner /> : formatCurrency(stats.rejectedValue)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold text-blue-800 font-poppins mb-2">Taxa de Aprovação</h3>
            <div className="text-3xl font-bold text-blue-600">
              {loading ? (
                <LoadingSpinner />
              ) : (
                `${stats.approvedCount + stats.pendingCount > 0
                  ? ((stats.approvedCount / (stats.approvedCount + stats.pendingCount + stats.rejectedCount)) * 100).toFixed(1)
                  : 0}%`
              )}
            </div>
            <div className="mt-2 text-sm text-blue-700">
              Aprovados / Total
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold text-purple-800 font-poppins mb-2">Valor Total</h3>
            <div className="text-3xl font-bold text-purple-600">
              {loading ? <LoadingSpinner /> : formatCurrency(stats.totalValue)}
            </div>
            <div className="mt-2 text-sm text-purple-700">
              Todos os orçamentos
            </div>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-text font-poppins mb-4">Orçamentos Recentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-text">Nº</th>
                  <th className="text-left py-3 px-4 font-semibold text-text">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold text-text">Valor</th>
                  <th className="text-left py-3 px-4 font-semibold text-text">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-text">Data</th>
                  <th className="text-left py-3 px-4 font-semibold text-text">Justificativa</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : stats.recentQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-600">
                      Nenhum orçamento encontrado
                    </td>
                  </tr>
                ) : (
                  stats.recentQuotes.map((quote) => {
                    const status = formatStatus(quote.status);
                    return (
                      <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">#{quote.number}</td>
                        <td className="py-3 px-4">{quote.client_name}</td>
                        <td className="py-3 px-4">{formatCurrency(quote.value)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.className.replace('text-', 'bg-').replace('600', '100')}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="py-3 px-4">
                          {quote.status === 'rejected' && quote.rejection_reason ? (
                            <span className="text-sm text-gray-600">{quote.rejection_reason}</span>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-text font-poppins mb-4">Extrato Mensal</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-text">Mês/Ano</th>
                  <th className="text-right py-3 px-4 font-semibold text-yellow-600">Pendente</th>
                  <th className="text-right py-3 px-4 font-semibold text-green-600">Aprovado</th>
                  <th className="text-right py-3 px-4 font-semibold text-red-600">Rejeitado</th>
                  <th className="text-right py-3 px-4 font-semibold text-purple-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : stats.monthlyRevenue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-600">
                      Nenhum dado encontrado
                    </td>
                  </tr>
                ) : (
                  stats.monthlyRevenue.map((month, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium">
                        {month.month}
                      </td>
                      <td className="py-3 px-4 text-right text-yellow-600 font-medium">
                        {formatCurrency(month.pendingValue)}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">
                        {formatCurrency(month.approvedValue)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 font-medium">
                        {formatCurrency(month.rejectedValue)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-purple-600">
                        {formatCurrency(month.totalValue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {!loading && stats.monthlyRevenue.length > 0 && (
                <tfoot className="border-t">
                  <tr className="font-bold bg-gray-50">
                    <td className="py-3 px-4">Total Geral</td>
                    <td className="py-3 px-4 text-right text-yellow-600">
                      {formatCurrency(
                        stats.monthlyRevenue.reduce((sum, month) => sum + month.pendingValue, 0)
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      {formatCurrency(
                        stats.monthlyRevenue.reduce((sum, month) => sum + month.approvedValue, 0)
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600">
                      {formatCurrency(
                        stats.monthlyRevenue.reduce((sum, month) => sum + month.rejectedValue, 0)
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-purple-600">
                      {formatCurrency(
                        stats.monthlyRevenue.reduce((sum, month) => sum + month.totalValue, 0)
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}