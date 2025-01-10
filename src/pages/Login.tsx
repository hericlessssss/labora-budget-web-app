import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

const registerSchema = loginSchema.extend({
  confirmPassword: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: LoginForm) => {
    try {
      setErrorMessage(null);
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message === 'Email not confirmed') {
          // For unconfirmed emails, we'll try to sign up again
          const { error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                email_confirm: true,
              },
            },
          });

          if (signUpError) throw signUpError;
          
          // Try to sign in immediately since email confirmation is disabled
          const { error: secondSignInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (secondSignInError) throw secondSignInError;
          
          navigate('/dashboard');
          return;
        }
        throw error;
      }

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      setErrorMessage('Email ou senha incorretos');
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      setErrorMessage(null);
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            email_confirm: true,
          },
        },
      });

      if (error) throw error;

      // Try to sign in immediately since email confirmation is disabled
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (!signInError) {
        navigate('/dashboard');
        return;
      }
      
      // If immediate sign-in fails, show success message and return to login
      setErrorMessage('Conta criada com sucesso! Faça login para continuar.');
      setIsRegistering(false);
      registerForm.reset();
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      setErrorMessage('Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEFF1] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          {isRegistering ? (
            <UserPlus className="mx-auto h-12 w-12 text-[#6A1B9A]" />
          ) : (
            <LogIn className="mx-auto h-12 w-12 text-[#6A1B9A]" />
          )}
          <h2 className="mt-6 text-3xl font-bold text-[#212121] font-['Poppins']">
            {isRegistering ? 'Criar Conta' : 'Bem-vindo'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-['Open_Sans']">
            {isRegistering
              ? 'Preencha os dados para criar sua conta'
              : 'Faça login para acessar o sistema'}
          </p>
        </div>

        {errorMessage && (
          <div className={`p-4 rounded-md ${
            errorMessage.includes('sucesso') 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {errorMessage}
          </div>
        )}

        {isRegistering ? (
          <form className="mt-8 space-y-6" onSubmit={registerForm.handleSubmit(onRegister)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#212121] font-['Open_Sans']">
                  Email
                </label>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6A1B9A] focus:border-[#6A1B9A]"
                  placeholder="seu@email.com"
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212121] font-['Open_Sans']">
                  Senha
                </label>
                <input
                  {...registerForm.register('password')}
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6A1B9A] focus:border-[#6A1B9A]"
                  placeholder="••••••••"
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212121] font-['Open_Sans']">
                  Confirmar Senha
                </label>
                <input
                  {...registerForm.register('confirmPassword')}
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6A1B9A] focus:border-[#6A1B9A]"
                  placeholder="••••••••"
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6A1B9A] hover:bg-[#4A148C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6A1B9A] transition-colors duration-200"
              >
                Criar Conta
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6A1B9A] transition-colors duration-200"
              >
                Voltar para Login
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={loginForm.handleSubmit(onLogin)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#212121] font-['Open_Sans']">
                  Email
                </label>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6A1B9A] focus:border-[#6A1B9A]"
                  placeholder="seu@email.com"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212121] font-['Open_Sans']">
                  Senha
                </label>
                <input
                  {...loginForm.register('password')}
                  type="password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6A1B9A] focus:border-[#6A1B9A]"
                  placeholder="••••••••"
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6A1B9A] hover:bg-[#4A148C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6A1B9A] transition-colors duration-200"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6A1B9A] transition-colors duration-200"
              >
                Criar Nova Conta
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}