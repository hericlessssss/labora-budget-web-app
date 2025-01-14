import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white shadow-lg mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <img src="https://i.imgur.com/8cADajs.png" alt="Labora Tech" className="h-8 w-auto" />
            <div className="text-sm text-gray-600">
              <p className="font-semibold">Labora Tech</p>
              <p>Soluções em Tecnologia</p>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <p>C1 LOTE 11, entrada C</p>
            <p>CNPJ: 55.707.870/0001-97</p>
          </div>
          
          <div className="text-right text-sm text-gray-600">
            <p>Tel: (61) 99815-9297</p>
            <p>laborad.sign@gmail.com</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Labora Tech. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}