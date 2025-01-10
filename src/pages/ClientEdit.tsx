import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, ArrowLeft, Phone } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';

const clientSchema = z.object({
  full_name: z.string()
    .min(1, 'Nome completo é obrigatório')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, 'Nome deve conter apenas letras'),
  email: z.string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  cpf: z.string()
    .min(1, 'CPF é obrigatório')
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
    .optional()
    .or(z.literal('')),
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\(\d{2}\)\s\d{5}-\d{4}$/, 'Telefone inválido'),
  is_whatsapp: z.boolean().default(false),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().min(1, 'Estado é obrigatório'),
    zip_code: z.string()
      .min(1, 'CEP é obrigatório')
      .regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  }),
}).refine((data) => {
  return (data.cpf && data.cpf.length > 0) || (data.cnpj && data.cnpj.length > 0);
}, {
  message: "Preencha CPF ou CNPJ",
  path: ["cpf"],
});

type ClientForm = z.infer<typeof clientSchema>;

export function ClientEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        reset(data);
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      .slice(0, 18);
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{4})$/, '$1-$2')
      .slice(0, 15);
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  const onSubmit = async (data: ClientForm) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      navigate('/clients');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64 p-8 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/clients')}
              className="flex items-center text-text hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-3xl font-bold text-text font-poppins">Editar Cliente</h1>
            <p className="text-gray-600 font-open-sans">Atualize os dados do cliente</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-text mb-4">Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Nome Completo
                  </label>
                  <input
                    {...register('full_name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nome completo"
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    E-mail
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="email@exemplo.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    CPF
                  </label>
                  <input
                    {...register('cpf')}
                    onChange={(e) => {
                      e.target.value = formatCPF(e.target.value);
                      setValue('cpf', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf && (
                    <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    CNPJ
                  </label>
                  <input
                    {...register('cnpj')}
                    onChange={(e) => {
                      e.target.value = formatCNPJ(e.target.value);
                      setValue('cnpj', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="00.000.000/0000-00"
                  />
                  {errors.cnpj && (
                    <p className="mt-1 text-sm text-red-600">{errors.cnpj.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Telefone
                  </label>
                  <div className="relative">
                    <input
                      {...register('phone')}
                      onChange={(e) => {
                        e.target.value = formatPhone(e.target.value);
                        setValue('phone', e.target.value);
                      }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="(00) 00000-0000"
                    />
                    <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('is_whatsapp')}
                      className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Este número é WhatsApp</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-text mb-4">Endereço</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text mb-1">
                    CEP
                  </label>
                  <input
                    {...register('address.zip_code')}
                    onChange={(e) => {
                      e.target.value = formatCEP(e.target.value);
                      setValue('address.zip_code', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="00000-000"
                  />
                  {errors.address?.zip_code && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.zip_code.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text mb-1">
                    Rua
                  </label>
                  <input
                    {...register('address.street')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Nome da rua"
                  />
                  {errors.address?.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Número
                  </label>
                  <input
                    {...register('address.number')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Número"
                  />
                  {errors.address?.number && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.number.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Complemento
                  </label>
                  <input
                    {...register('address.complement')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Apartamento, sala, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Bairro
                  </label>
                  <input
                    {...register('address.neighborhood')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Bairro"
                  />
                  {errors.address?.neighborhood && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.neighborhood.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Cidade
                  </label>
                  <input
                    {...register('address.city')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Cidade"
                  />
                  {errors.address?.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Estado
                  </label>
                  <select
                    {...register('address.state')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                  {errors.address?.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <Save className="h-5 w-5 mr-2" />
                Atualizar Cliente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}