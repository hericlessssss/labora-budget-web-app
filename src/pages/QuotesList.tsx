import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, Download, CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { LoadingSpinner } from '../components/LoadingSpinner';

type Quote = {
  id: string;
  number: number;
  client_name: string;
  client_document: string;
  service_description: string;
  value: number;
  payment_method: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  observations?: string;
};

type RejectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

function RejectModal({ isOpen, onClose, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Justificativa da Rejeição</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Digite o motivo da rejeição do orçamento..."
          rows={4}
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (reason.trim()) {
                onConfirm(reason);
                setReason('');
              }
            }}
            disabled={!reason.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            Confirmar Rejeição
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuotesList() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

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

  const updateQuoteStatus = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      setStatusUpdating(id);
      const { error } = await supabase
        .from('quotes')
        .update({ 
          status,
          ...(reason ? { rejection_reason: reason } : {})
        })
        .eq('id', id);

      if (error) throw error;
      await fetchQuotes();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setStatusUpdating(null);
      setRejectModalOpen(false);
      setSelectedQuoteId(null);
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedQuoteId(id);
    setRejectModalOpen(true);
  };

  const generatePDF = (quote: Quote) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let currentY = margin;

      // Cabeçalho
      const logoUrl = 'https://i.imgur.com/8cADajs.png';
      doc.addImage(logoUrl, 'PNG', margin, currentY, 30, 30);

      // Informações da empresa (à direita)
      doc.setFontSize(8);
      const rightMargin = pageWidth - margin;
      doc.text('Labora Tech - Soluções em Tecnologia', rightMargin, currentY + 8, { align: 'right' });
      doc.text('CNPJ: 55.707.870/0001-97', rightMargin, currentY + 12, { align: 'right' });
      doc.text('C1 LOTE 11, entrada C', rightMargin, currentY + 16, { align: 'right' });
      doc.text('Tel: (61) 99815-9297', rightMargin, currentY + 20, { align: 'right' });
      doc.text('E-mail: laborad.sign@gmail.com', rightMargin, currentY + 24, { align: 'right' });

      // Linha divisória após o cabeçalho
      currentY += 35;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, currentY, pageWidth - margin, currentY);

      // Número do orçamento e data
      currentY += 15;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`ORÇAMENTO Nº ${quote.number}`, margin, currentY);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Data: ${format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: ptBR })}`,
        rightMargin,
        currentY,
        { align: 'right' }
      );

      // Dados do Cliente
      currentY += 20;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('DADOS DO CLIENTE', margin, currentY);
      
      currentY += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Nome: ${quote.client_name}`, margin, currentY);
      currentY += 6;
      doc.text(`Documento: ${quote.client_document}`, margin, currentY);

      // Descrição do Serviço
      currentY += 15;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('DESCRIÇÃO DO SERVIÇO', margin, currentY);
      
      currentY += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const splitDescription = doc.splitTextToSize(quote.service_description, pageWidth - (2 * margin));
      doc.text(splitDescription, margin, currentY);
      currentY += (splitDescription.length * 6) + 8;

      // Observações (se houver)
      if (quote.observations) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('OBSERVAÇÕES', margin, currentY);
        
        currentY += 8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const splitObservations = doc.splitTextToSize(quote.observations, pageWidth - (2 * margin));
        doc.text(splitObservations, margin, currentY);
        currentY += (splitObservations.length * 6) + 8;
      }

      // Valor e Forma de Pagamento em destaque
      doc.setDrawColor(230, 230, 230);
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, currentY, pageWidth - (2 * margin), 30, 'F');
      
      currentY += 8;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('VALOR TOTAL:', margin + 5, currentY);
      doc.text('FORMA DE PAGAMENTO:', pageWidth/2, currentY);
      
      currentY += 8;
      doc.setFontSize(11);
      doc.setTextColor(0, 100, 0);
      doc.text(new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(quote.value), margin + 5, currentY);
      
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.text(quote.payment_method, pageWidth/2, currentY);

      currentY += 20;

      // Validade e Termos
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Validade do Orçamento: 5 dias a partir da data de emissão.', margin, currentY);
      
      // Termos e Condições em box
      currentY += 15;
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, currentY, pageWidth - (2 * margin), 35, 'F');
      
      currentY += 7;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('TERMOS E CONDIÇÕES', margin + 5, currentY);
      
      currentY += 7;
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      const terms = [
        '1. A Labora Tech garante sigilo absoluto sobre todas as informações fornecidas pelo cliente.',
        '2. O prazo de execução será definido após a aprovação do orçamento.',
        '3. Este orçamento não inclui serviços adicionais não especificados.',
        '4. Alterações no escopo podem resultar em ajustes no valor final.',
        '5. A garantia dos serviços é de 90 dias após a conclusão.'
      ];
      
      terms.forEach((term, index) => {
        doc.text(term, margin + 5, currentY + (index * 5));
      });

      currentY += 45;

      // Status do orçamento (se não estiver pendente)
      if (quote.status !== 'pending') {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        
        if (quote.status === 'approved') {
          doc.setTextColor(0, 128, 0);
          doc.text('APROVADO', pageWidth/2, currentY, { align: 'center' });
        } else {
          doc.setTextColor(128, 0, 0);
          doc.text('REPROVADO', pageWidth/2, currentY, { align: 'center' });
          
          if (quote.rejection_reason) {
            currentY += 10;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text('Motivo:', margin, currentY);
            const splitReason = doc.splitTextToSize(quote.rejection_reason, pageWidth - (2 * margin));
            doc.setFont(undefined, 'normal');
            doc.text(splitReason, margin, currentY + 6);
          }
        }
        doc.setTextColor(0, 0, 0);
      }

      // Rodapé
      const footerY = pageHeight - 25;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      
      // Linha divisória do rodapé
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      
      // Informações do rodapé em três colunas
      const col1X = margin;
      const col2X = pageWidth/2;
      const col3X = pageWidth - margin;
      
      doc.text('Labora Tech - Soluções em Tecnologia', col1X, footerY);
      doc.text('Tel: (61) 99815-9297', col2X, footerY, { align: 'center' });
      doc.text('laborad.sign@gmail.com', col3X, footerY, { align: 'right' });
      
      doc.text('C1 LOTE 11, entrada C', col1X, footerY + 5);
      doc.text('CNPJ: 55.707.870/0001-97', col2X, footerY + 5, { align: 'center' });
      doc.text('Documento gerado automaticamente', col3X, footerY + 5, { align: 'right' });

      // Salvar o PDF
      doc.save(`ORCAMENTO-LABORA-TECH-${quote.number}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
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
      <div className="p-8">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Justificativa
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
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(quote.value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {quote.status === 'rejected' && quote.rejection_reason}
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
                                onClick={() => handleRejectClick(quote.id)}
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

      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedQuoteId(null);
        }}
        onConfirm={(reason) => {
          if (selectedQuoteId) {
            updateQuoteStatus(selectedQuoteId, 'rejected', reason);
          }
        }}
      />
    </div>
  );
}