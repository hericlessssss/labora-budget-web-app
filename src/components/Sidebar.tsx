import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, LogOut, PlusCircle, ClipboardList, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed w-64 h-full bg-white shadow-lg">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <img src="https://i.imgur.com/8cADajs.png" alt="Labora Tech" className="h-8 w-auto" />
            <span className="text-xl font-bold text-text font-poppins">Labora Tech</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {[
              { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { path: '/new-quote', icon: PlusCircle, label: 'Novo Orçamento' },
              { path: '/quotes', icon: ClipboardList, label: 'Orçamentos' },
              { path: '/clients', icon: Users, label: 'Clientes' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-text hover:bg-background'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-open-sans">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-text hover:bg-background rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-open-sans">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}