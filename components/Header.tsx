
import React from 'react';
import type { User } from '../types';

interface HeaderProps {
  onHelpClick: () => void;
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick, user, onLogout }) => {
  return (
    <header className="relative bg-gradient-to-br from-brand-dark-blue to-brand-mid-blue text-white p-8 md:p-12 text-center shadow-lg">
       <div className="absolute top-4 right-4 flex items-center gap-2 sm:gap-4">
        {user && (
          <div className="text-right hidden sm:block">
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs opacity-80">{user.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="bg-white/20 hover:bg-white/30 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Sair"
          title="Sair"
        >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
         </svg>
        </button>
        <button
          onClick={onHelpClick}
          className="bg-white/20 hover:bg-white/30 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Ajuda e Informações sobre o App"
        >
          <span className="text-2xl">?</span>
        </button>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Fábrica de Ideias: Inovação em Serviços</h1>
      <p className="text-lg md:text-xl max-w-3xl mx-auto">
        Uma plataforma interativa para análise, priorização e exploração de um portfóio de ideias de serviços inovadores.
      </p>
    </header>
  );
};

export default Header;
