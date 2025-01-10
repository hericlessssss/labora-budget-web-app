import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, ArrowLeft, Search, X } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';

const quoteSchema = z.object({
  client_name: z.string().min(1, 'Nome do cliente é obrigatório')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'Nome deve conter apenas letras'),
  client_document: z.string()
    .min(1, 'Documento do cliente é obrigatório')
    .refine((val) => {
      const numbers = val.replace(/\D/g, '');
      
      if (numbers.length === 11) {
        let sum = 0;
        let rest;
        
        if (numbers === "00000000000") return false;
        
        for (let i = 1; i <= 9; i++) {
          sum = sum + parseInt(numbers.substring(i - 1, i)) * (11 - i);
        }
        
        rest = (sum * 10) % 11;
        if (rest === 10 || rest === 11) rest = 0;
        if (rest !== parseInt(numbers.substring(9, 10))) return false;
        
        sum = 0;
        for (let i = 1; i <= 10; i++) {
          sum = sum + parseInt(numbers.substring(i - 1, i)) * (12 - i);
        }
        
        rest = (sum * 10) % 11;
        if (rest === 10 || rest === 11) rest = 0;
        if (rest !== parseInt(numbers.substring(10, 11))) return false;
        
        return true;
      }
      
      if (numbers.length === 14) {
        if (numbers === "00000000000000") return false;
        
        let size = numbers.length - 2;
        let numbers_array = numbers.split('');
        let digits = numbers.substr(size);
        let sum = 0;
        let pos = size - 7;
        
        for (let i = size; i >= 1; i--) {
          sum += numbers_array[size - i] * pos--;
          if (pos < 2) pos = 9;
        }
        
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) return false;
        
        size = size + 1;
        numbers_array = numbers.split('');
        sum = 0;
        pos = size - 7;
        
        for (let i = size; i >= 1; i--) {
          sum += numbers_array[size - i] * pos--;
          if (pos < 2) pos = 9;
        }
        
        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(1))) return false;
        
        return true;
      }
      
      return false;
    }, 'CPF ou CNPJ inválido'),
  service_description: z.string()
    .min(1, 'Descrição do serviço é obrigatória')
    .max(1000, 'Descrição muito longa'),
  observations: z.string()
    .max(500, 'Observações muito longas')
    .optional(),
  value: z.string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Valor deve ser maior que zero')
    .transform((val) => parseFloat(val)),
  payment_method: z.string()
    .min(1, 'Método de pagamento é obrigatório'),
});

type QuoteForm = z.infer<typeof quoteSchema>;

type Client = {
  id: string;
  full_name: string;
  cpf: string | null;
  cnpj: string | null;
};

export function NewQuote() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
  });

  const formatDocument = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
  };

  const searchClients = async () => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    try {
      const formattedSearch = searchTerm.replace(/[^\w\s]/g, '').toLowerCase();
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, cpf, cnpj')
        .or(`full_name.ilike.%${formattedSearch}%,cpf.ilike.%${formattedSearch}%,cnpj.ilike.%${formattedSearch}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setValue('client_name', client.full_name);
    setValue('client_document', client.cpf || client.cnpj || '');
    setSearchTerm('');
    setSearchResults([]);
  };

  const clearSelectedClient = () => {
    setSelectedClient(null);
    setValue('client_name', '');
    setValue('client_document', '');
  };

  const onSubmit = async (data: QuoteForm) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase.from('quotes').insert([
        {
          ...data,
          status: 'pending',
          user_id: userData.user.id,
          client_id: selectedClient?.id || null,
        },
      ]);

      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-text hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-3xl font-bold text-text font-poppins">Novo Orçamento</h1>
            <p className="text-gray-600 font-open-sans">Preencha os dados do orçamento</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
          {/* Busca de Cliente */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text mb-4">Buscar Cliente Cadastrado</h2>
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchClients()}
                    placeholder="Busque por nome, CPF ou CNPJ"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={!!selectedClient}
                  />
                  {searching && (
                    <div className="absolute right-3 top-2.5">
                      <LoadingSpinner />
                    </div>
                  )}
                </div>
                {!selectedClient && (
                  <button
                    onClick={searchClients}
                    disabled={searching}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Resultados da busca */}
              {searchResults.length > 0 && !selectedClient && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                  <ul className="max-h-60 overflow-auto">
                    {searchResults.map((client) => (
                      <li
                        key={client.id}
                        onClick={() => selectClient(client)}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="font-medium">{client.full_name}</div>
                        <div className="text-sm text-gray-600">
                          {client.cpf || client.cnpj}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Cliente selecionado */}
            {selectedClient && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md flex justify-between items-center">
                <div>
                  <div className="font-medium">{selectedClient.full_name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedClient.cpf || selectedClient.cnpj}
                  </div>
                </div>
                <button
                  onClick={clearSelectedClient}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Nome do Cliente
                </label>
                <input
                  {...register('client_name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nome completo"
                />
                {errors.client_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.client_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Documento
                </label>
                <input
                  {...register('client_document')}
                  onChange={(e) => {
                    e.target.value = formatDocument(e.target.value);
                    setValue('client_document', e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="CPF ou CNPJ"
                />
                {errors.client_document && (
                  <p className="mt-1 text-sm text-red-600">{errors.client_document.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Descrição do Serviço
              </label>
              <textarea
                {...register('service_description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Descreva detalhadamente o serviço a ser realizado"
              />
              {errors.service_description && (
                <p className="mt-1 text-sm text-red-600">{errors.service_description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Observações
              </label>
              <textarea
                {...register('observations')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Observações adicionais (opcional)"
              />
              {errors.observations && (
                <p className="mt-1 text-sm text-red-600">{errors.observations.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Valor
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    {...register('value')}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
                {errors.value && (
                  <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Forma de Pagamento
                </label>
                <select
                  {...register('payment_method')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="À vista">À vista</option>
                  <option value="Cartão de crédito">Cartão de crédito</option>
                  <option value="Cartão de débito">Cartão de débito</option>
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Transferência">Transferência</option>
                </select>
                {errors.payment_method && (
                  <p className="mt-1 text-sm text-red-600">{errors.payment_method.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-5 w-5 mr-2" />
                Salvar Orçamento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}