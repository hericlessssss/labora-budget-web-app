import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Save, Download, FileText, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
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
  created_at: string;
  observations?: string;
};

export function ContractGeneration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [contractContent, setContractContent] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const filteredQuotes = quotes.filter(quote => 
      quote.number.toString().includes(searchTerm.trim()) ||
      quote.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client_document.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''))
    );

    if (filteredQuotes.length === 1) {
      selectQuote(filteredQuotes[0]);
    }
  };

  const selectQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    generateInitialContract(quote);
  };

  const generateInitialContract = (quote: Quote) => {
    const template = `INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS DE TECNOLOGIA

IDENTIFICAÇÃO DAS PARTES CONTRATANTES

CONTRATANTE: ${quote.client_name}, inscrito(a) no CPF/CNPJ sob o nº ${quote.client_document}, doravante denominado(a) simplesmente CONTRATANTE.

CONTRATADA: LABORA TECH, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 55.707.870/0001-97, com sede em C1 LOTE 11, entrada C, Brasília-DF, representada neste ato por seus sócios:

- HÉRICLES FRANCISCO SOUSA E SILVA, CPF: 109.775.426-02
- EZEQUIEL ALVES DE SOUZA, CPF: 076.572.981-46
- BRUNA STÉFANE NOGUEIRA NUNES, CPF: 062.926.511-93

Doravante denominada simplesmente CONTRATADA.

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços de Tecnologia, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.

OBJETO DO CONTRATO

Cláusula 1ª. O presente contrato tem como objeto a prestação dos seguintes serviços de tecnologia:

${quote.service_description}

VIGÊNCIA E PRAZO

Cláusula 2ª. O presente contrato terá vigência de 12 (doze) meses, iniciando-se na data de sua assinatura, podendo ser prorrogado mediante acordo entre as partes.

Cláusula 3ª. O prazo para entrega do projeto inicial é de 30 (trinta) dias úteis, contados a partir da assinatura deste contrato e do recebimento de todos os materiais e informações necessários para sua execução.

VALOR E FORMA DE PAGAMENTO

Cláusula 4ª. Pela prestação dos serviços, a CONTRATANTE pagará à CONTRATADA o valor total de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.value)}, a ser pago da seguinte forma: ${quote.payment_method}.

SERVIÇO DE MANUTENÇÃO MENSAL (OPCIONAL)

Cláusula 5ª. Após a entrega do projeto, a CONTRATANTE poderá optar pela contratação do serviço de manutenção mensal, que inclui:
- Atualizações de segurança
- Backup periódico
- Correção de bugs
- Pequenas alterações de conteúdo
- Suporte técnico por e-mail e WhatsApp

§1º O valor do serviço de manutenção mensal é de R$ 89,90 (oitenta e nove reais e noventa centavos).
§2º O primeiro mês de manutenção será gratuito.
§3º O serviço poderá ser cancelado a qualquer momento, com aviso prévio de 30 dias.

OBRIGAÇÕES DA CONTRATADA

Cláusula 6ª. São obrigações da CONTRATADA:
a) Executar os serviços conforme especificações deste contrato;
b) Manter sigilo sobre todas as informações obtidas em função da prestação de serviços;
c) Garantir a qualidade técnica dos serviços;
d) Fornecer suporte técnico durante o desenvolvimento;
e) Realizar backup periódico dos dados;
f) Corrigir, sem ônus para a CONTRATANTE, quaisquer erros ou defeitos técnicos decorrentes da execução dos serviços.

OBRIGAÇÕES DA CONTRATANTE

Cláusula 7ª. São obrigações da CONTRATANTE:
a) Fornecer todas as informações necessárias para execução dos serviços;
b) Realizar os pagamentos conforme acordado;
c) Designar responsável para acompanhamento do projeto;
d) Realizar a validação e testes necessários nos prazos estabelecidos;
e) Respeitar os direitos de propriedade intelectual da CONTRATADA.

CONFIDENCIALIDADE E PROTEÇÃO DE DADOS

Cláusula 8ª. As partes se comprometem a:
a) Manter sigilo sobre informações confidenciais;
b) Proteger dados pessoais conforme a LGPD (Lei 13.709/2018);
c) Implementar medidas de segurança adequadas;
d) Notificar imediatamente qualquer violação de dados.

PROPRIEDADE INTELECTUAL

Cláusula 9ª. Os direitos de propriedade intelectual sobre os produtos desenvolvidos serão transferidos à CONTRATANTE após a quitação total do contrato, exceto:
a) Bibliotecas e frameworks de terceiros;
b) Componentes reutilizáveis desenvolvidos previamente pela CONTRATADA;
c) Metodologias e conhecimentos técnicos da CONTRATADA.

RESCISÃO

Cláusula 10ª. O presente contrato poderá ser rescindido:
a) Por comum acordo entre as partes;
b) Por inadimplemento de qualquer cláusula contratual;
c) Mediante notificação prévia de 30 (trinta) dias;
d) Por força maior ou caso fortuito.

Parágrafo único: Em caso de rescisão, serão devidos os valores proporcionais aos serviços já executados.

DISPOSIÇÕES GERAIS

Cláusula 11ª. Este contrato é celebrado em caráter irrevogável e irretratável.

Cláusula 12ª. Qualquer modificação deste contrato só será válida mediante aditivo contratual escrito.

Cláusula 13ª. Os casos omissos serão resolvidos de acordo com a legislação vigente.

FORO

Cláusula 14ª. Para dirimir quaisquer controvérsias oriundas deste contrato, as partes elegem o foro da comarca de Brasília-DF.

Por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor.

Brasília-DF, ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}


_____________________________________________
${quote.client_name}
CPF/CNPJ: ${quote.client_document}


_____________________________________________
Héricles Francisco Sousa e Silva
CPF: 109.775.426-02


_____________________________________________
Ezequiel Alves de Souza
CPF: 076.572.981-46


_____________________________________________
Bruna Stéfane Nogueira Nunes
CPF: 062.926.511-93


TESTEMUNHAS:

1. _________________________________________
Nome:
CPF:


2. _________________________________________
Nome:
CPF:`;

    setContractContent(template);
  };

  const generatePDF = async () => {
    if (!selectedQuote || !contractContent) return;

    try {
      setGeneratingPDF(true);
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

      // Número do contrato e data
      currentY += 15;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`CONTRATO Nº ${selectedQuote.number}`, margin, currentY);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Data: ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
        rightMargin,
        currentY,
        { align: 'right' }
      );

      // Conteúdo do contrato
      currentY += 10;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      const splitContent = doc.splitTextToSize(contractContent, pageWidth - (2 * margin));
      
      splitContent.forEach((line: string) => {
        // Verificar se é um título de seção
        if (line.trim().toUpperCase() === line.trim() && line.trim().length > 20) {
          currentY += 5; // Espaço extra antes do título
          doc.setFont(undefined, 'bold');
          doc.setFontSize(11);
        } else {
          doc.setFont(undefined, 'normal');
          doc.setFontSize(10);
        }

        if (currentY > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }

        doc.text(line, margin, currentY);
        currentY += 5;
      });

      // Rodapé
      const addFooter = () => {
        const footerY = pageHeight - 15;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text('Página ' + doc.getCurrentPageInfo().pageNumber, pageWidth / 2, footerY, { align: 'center' });
      };

      // Adicionar rodapé em todas as páginas
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter();
      }

      // Salvar o PDF
      doc.save(`CONTRATO-${selectedQuote.number}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-text hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-text font-poppins">Contratos</h1>
          <p className="text-gray-600 font-open-sans">Gere contratos a partir de orçamentos aprovados</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Busca de Orçamento */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text mb-4">Buscar Orçamento Aprovado</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Busque por número do orçamento, nome do cliente ou documento"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lista de Orçamentos */}
          {!selectedQuote && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-text mb-2">Orçamentos Disponíveis</h3>
              {loading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : quotes.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  Nenhum orçamento aprovado encontrado
                </p>
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
                          Data
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quotes.map((quote) => (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => selectQuote(quote)}
                              className="text-primary hover:text-primary/80"
                            >
                              <FileText className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Editor de Contrato */}
          {selectedQuote && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text">
                  Contrato - Orçamento #{selectedQuote.number}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedQuote(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={generatePDF}
                    disabled={generatingPDF}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                  >
                    {generatingPDF ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Gerando PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        Gerar PDF
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                value={contractContent}
                onChange={(e) => setContractContent(e.target.value)}
                className="w-full h-[600px] px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}