import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function EditQuote() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const fetchQuote = async () => {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setQuote(data);
      }
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      navigate('/quotes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/quotes')}
            className="flex items-center text-text hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-text font-poppins">Editar Orçamento</h1>
          <p className="text-gray-600 font-open-sans">Atualize os dados do orçamento</p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p>Implementação do formulário de edição virá aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}