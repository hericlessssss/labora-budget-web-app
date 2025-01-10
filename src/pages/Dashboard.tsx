import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';

type DashboardStats = {
  pendingCount: number;
  approvedCount: number;
  totalValue: number;
  recentQuotes: Array<{
    id: string;
    number: number;
    client_name: string;
    value: number;
    status: string;
    created_at: string;
  }>;
};

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    pendingCount: 0,
    approvedCount: 0,
    totalValue: 0,
    recentQuotes: [],
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
        const pendingCount = quotes.filter(q => q.status === 'pending').length;
        const approvedCount = quotes.filter(q => q.status === 'approved').length;
        const totalValue = quotes.reduce((sum, q) => sum + (q.value || 0), 0);
        const recentQuotes = quotes.slice(0, 5);

        setStats({
          pendingCount,
          approvedCount,
          totalValue,
          recentQuotes,
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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text font-poppins">Dashboard</h1>
          <p className="text-gray-600 font-open-sans">Bem-vindo ao sistema de orçamentos</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold text-text font-poppins mb-2">Orçamentos Pendentes</h3>
            <div className="text-3xl font-bold text-primary">
              {loading ? <LoadingSpinner /> : stats.pendingCount}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold text-text font-poppins mb-2">Orçamentos Aprovados</h3>
            <div className="text-3xl font-bold text-secondary">
              {loading ? <LoadingSpinner /> : stats.approvedCount}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform">
            <h3 className="text-lg font-semibold text-text font-poppins mb-2">Total em Orçamentos</h3>
            <div className="text-3xl font-bold text-accent">
              {loading ? <LoadingSpinner /> : `R$ ${stats.totalValue.toFixed(2)}`}
            </div>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white rounded-lg shadow-md p-6">
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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : stats.recentQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-600">
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
                        <td className="py-3 px-4">R$ {quote.value.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={status.className}>
                            {status.text}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}