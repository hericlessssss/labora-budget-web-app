import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';

type Quote = {
  id: string;
  number: number;
  client_name: string;
  service_description: string;
  value: number;
  status: string;
  created_at: string;
  payment_method: string;
  client_document: string;
  observations?: string;
};

export function QuotesList() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setStatusUpdating(id);
      const { error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await fetchQuotes();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setStatusUpdating(null);
    }
  };

  const generatePDF = (quote: Quote) => {
    // Criar novo documento PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Adicionar fonte personalizada
    doc.setFont('helvetica', 'bold');
    
    // Cores personalizadas
    const primaryColor = '#6A1B9A';
    const textColor = '#212121';
    const grayColor = '#757575';
    
    // Cabeçalho com estilo moderno
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Logo e título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('LABORA TECH', 20, 20);
    doc.setFontSize(12);
    doc.text('Soluções em Tecnologia', 20, 30);
    
    // Informações da empresa
    doc.setTextColor(textColor);
    doc.setFontSize(10);
    doc.text('CNPJ: 00.000.000/0000-00', 140, 15);
    doc.text('contato@laboratech.com.br', 140, 22);
    doc.text('Tel: (11) 99999-9999', 140, 29);
    
    // Título do orçamento
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 45, 210, 15, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.text(`ORÇAMENTO #${quote.number}`, 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(grayColor);
    doc.text(format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: ptBR }), 160, 55);
    
    // Informações do cliente
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text('DADOS DO CLIENTE', 20, 75);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Nome:', 20, 85);
    doc.text(quote.client_name, 50, 85);
    doc.text('Documento:', 20, 92);
    doc.text(quote.client_document, 50, 92);
    
    // Descrição do serviço
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DESCRIÇÃO DO SERVIÇO', 20, 110);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitDescription = doc.splitTextToSize(quote.service_description, 170);
    doc.text(splitDescription, 20, 120);
    
    let currentY = 120 + (splitDescription.length * 7);
    
    // Observações (se houver)
    if (quote.observations) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('OBSERVAÇÕES', 20, currentY + 10);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const splitObservations = doc.splitTextToSize(quote.observations, 170);
      doc.text(splitObservations, 20, currentY + 20);
      currentY += 20 + (splitObservations.length * 7);
    }
    
    // Box de valor e pagamento
    doc.setFillColor(primaryColor);
    doc.rect(0, currentY + 20, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('VALOR TOTAL', 20, currentY + 35);
    doc.text(`R$ ${quote.value.toFixed(2)}`, 20, currentY + 45);
    
    doc.setFontSize(12);
    doc.text('Forma de Pagamento:', 120, currentY + 35);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.payment_method, 120, currentY + 45);
    
    // Rodapé
    const footerY = 270;
    doc.setFillColor(245, 245, 245);
    doc.rect(0, footerY, 210, 27, 'F');
    
    doc.setTextColor(grayColor);
    doc.setFontSize(9);
    doc.text('Labora Tech - Soluções em Tecnologia', 20, footerY + 10);
    doc.text('Rua Exemplo, 123 - São Paulo, SP - CEP 00000-000', 20, footerY + 17);
    doc.text('www.laboratech.com.br', 20, footerY + 24);
    
    // QR Code fictício (representado por um quadrado)
    doc.setFillColor(textColor);
    doc.rect(170, footerY + 5, 20, 20, 'F');
    
    // Salvar PDF
    doc.save(`orcamento-${quote.number}.pdf`);
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      pending: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'Aprovado', className: 'bg-green-100 text-green-800' },
      rejected: { text: 'Rejeitado', className: 'bg-red-100 text-red-800' },
    };
    return statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text font-poppins">Orçamentos</h1>
          <p className="text-gray-600 font-open-sans">Gerencie seus orçamentos</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : quotes.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              Nenhum orçamento encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nº
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes.map((quote) => {
                    const status = formatStatus(quote.status);
                    return (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{quote.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {quote.client_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {quote.value.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {quote.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateQuoteStatus(quote.id, 'approved')}
                                disabled={statusUpdating === quote.id}
                                className="text-green-600 hover:text-green-900 mx-2 disabled:opacity-50"
                                title="Aprovar"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => updateQuoteStatus(quote.id, 'rejected')}
                                disabled={statusUpdating === quote.id}
                                className="text-red-600 hover:text-red-900 mx-2 disabled:opacity-50"
                                title="Rejeitar"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => generatePDF(quote)}
                            className="text-primary hover:text-primary/80 mx-2"
                            title="Baixar PDF"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}