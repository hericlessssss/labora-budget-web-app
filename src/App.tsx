import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewQuote } from './pages/NewQuote';
import { QuotesList } from './pages/QuotesList';
import { EditQuote } from './pages/EditQuote';
import { ContractGeneration } from './pages/ContractGeneration';
import { ClientRegistration } from './pages/ClientRegistration';
import { ClientsList } from './pages/ClientsList';
import { ClientEdit } from './pages/ClientEdit';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/*"
            element={
              <>
                <Header />
                <div className="flex-1 pt-16">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/new-quote" element={<NewQuote />} />
                    <Route path="/quotes" element={<QuotesList />} />
                    <Route path="/edit-quote/:id" element={<EditQuote />} />
                    <Route path="/contracts" element={<ContractGeneration />} />
                    <Route path="/new-client" element={<ClientRegistration />} />
                    <Route path="/clients" element={<ClientsList />} />
                    <Route path="/edit-client/:id" element={<ClientEdit />} />
                  </Routes>
                </div>
              </>
            }
          />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}