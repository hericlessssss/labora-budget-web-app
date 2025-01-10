import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewQuote } from './pages/NewQuote';
import { QuotesList } from './pages/QuotesList';
import { ClientRegistration } from './pages/ClientRegistration';
import { ClientsList } from './pages/ClientsList';
import { ClientEdit } from './pages/ClientEdit';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-quote" element={<NewQuote />} />
        <Route path="/quotes" element={<QuotesList />} />
        <Route path="/new-client" element={<ClientRegistration />} />
        <Route path="/clients" element={<ClientsList />} />
        <Route path="/edit-client/:id" element={<ClientEdit />} />
      </Routes>
    </BrowserRouter>
  );
}