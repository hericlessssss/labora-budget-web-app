import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, PlusCircle, ClipboardList, Users, Menu, X, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/new-quote', icon: PlusCircle, label: 'Novo Orçamento' },
    { path: '/quotes', icon: ClipboardList, label: 'Orçamentos' },
    { path: '/contracts', icon: FileText, label: 'Contratos' },
    { path: '/clients', icon: Users, label: 'Clientes' },
  ];

  return (
    <header className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <img src="https://i.imgur.com/8cADajs.png" alt="Labora Tech" className="h-8 w-auto" />
            <span className="text-xl font-bold text-text font-poppins hidden sm:block">Labora Tech</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-text hover:bg-background'
                }`}
              >
                <item.icon className="h-5 w-5 mr-2" />
                <span className="font-open-sans">{item.label}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-text hover:bg-background rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span className="font-open-sans">Sair</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-primary hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-text hover:bg-background'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="font-open-sans">{item.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-text hover:bg-background rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span className="font-open-sans">Sair</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}