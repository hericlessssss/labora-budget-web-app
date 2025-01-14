import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, ArrowLeft, Search, X, Phone } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

type Client = {
  id: string;
  full_name: string;
  cpf: string | null;
  cnpj: string | null;
};

type Category = {
  id: number;
  name: string;
  description: string | null;
};

type Service = {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  default_description: string | null;
  base_value: number | null;
};

const quoteSchema = z.object({
  client_name: z.string()
    .min(1, 'Nome do cliente é obrigatório')
    .max(100, 'Nome muito longo'),
  client_document: z.string()
    .min(1, 'Documento do cliente é obrigatório')
    .refine((val) => {
      const numbers = val.replace(/\D/g, '');
      return numbers.length === 11 || numbers.length === 14;
    }, 'CPF ou CNPJ inválido'),
  category_id: z.number().nullable(),
  service_id: z.number().nullable(),
  service_description: z.string()
    .min(1, 'Descrição do serviço é obrigatória')
    .max(1000, 'Descrição muito longa'),
  observations: z.string()
    .max(500, 'Observações muito longas')
    .optional(),
  value: z.number()
    .min(0.01, 'Valor deve ser maior que zero'),
  payment_method: z.string()
    .min(1, 'Método de pagamento é obrigatório'),
});

type QuoteForm = z.infer<typeof quoteSchema>;

export function NewQuote() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      category_id: null,
      service_id: null,
      value: 0,
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchServices(selectedCategory);
    } else {
      setServices([]);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchServices = async (categoryId: number) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === parseInt(serviceId));
    if (service) {
      if (service.default_description) {
        setValue('service_description', service.default_description);
      }
      if (service.base_value) {
        setValue('value', service.base_value);
      }
    }
  };

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
      setSubmitting(true);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Usuário não autenticado');
      }

      const quoteData = {
        ...data,
        value: Number(data.value),
        category_id: data.category_id || null,
        service_id: data.service_id || null,
        status: 'pending',
        user_id: userData.user.id,
        client_id: selectedClient?.id || null,
      };

      const { error } = await supabase.from('quotes').insert([quoteData]);

      if (error) throw error;
      navigate('/quotes');
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
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

        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
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

            {/* Seleção de Serviço */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-text mb-4">Serviço</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Categoria
                  </label>
                  <select
                    {...register('category_id', {
                      onChange: (e) => {
                        const value = e.target.value ? parseInt(e.target.value) : null;
                        setSelectedCategory(value);
                        setValue('category_id', value);
                        setValue('service_id', null);
                      },
                      setValueAs: (value) => value ? parseInt(value) : null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Serviço
                  </label>
                  <select
                    {...register('service_id', {
                      onChange: (e) => handleServiceChange(e.target.value),
                      setValueAs: (value) => value ? parseInt(value) : null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={!selectedCategory}
                  >
                    <option value="">Selecione um serviço...</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  {errors.service_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.service_id.message}</p>
                  )}
                </div>
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
                    {...register('value', {
                      setValueAs: (value) => Number(value)
                    })}
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
                disabled={submitting}
                className="flex items-center px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Salvar Orçamento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}