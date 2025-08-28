import React from 'react';
import Modal from './Modal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Como compartilhar este aplicativo?">
      <div className="space-y-4 text-gray-700">
        <p className="text-lg">
          Para que outras pessoas possam usar a "Fábrica de Ideias", o aplicativo precisa ser publicado na internet. Isso o torna acessível através de um link, como qualquer outro site.
        </p>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-bold text-brand-dark-blue mb-2">Arquitetura Segura e Pronta para a Web</h3>
          <ul className="list-disc list-outside ml-5 space-y-2">
            <li>
              <strong>Frontend e Backend Separados:</strong> Este aplicativo agora usa uma arquitetura moderna. A interface com o usuário (frontend) está separada da lógica de negócios e do acesso a dados (backend).
            </li>
            <li>
              <strong>Backend Seguro (Google Apps Script):</strong> A Planilha Google e o Google Apps Script que você configurou atuam como um backend seguro. É lá que os dados são armazenados e as chamadas para a Inteligência Artificial são feitas.
            </li>
             <li>
              <strong>Chave de API Protegida:</strong> A sua chave de API do Gemini está armazenada de forma segura no backend (nas Propriedades do Script). Ela **nunca** é exposta no navegador do usuário, o que é a prática recomendada para segurança.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Guia para o Administrador Técnico</h3>
          <p>
            O processo de publicação (ou "deployment") é uma tarefa técnica. Como a segurança da chave de API já foi resolvida no backend, o processo de hospedar o frontend é muito mais simples.
          </p>
          <p className="mt-2">
            As instruções detalhadas para o desenvolvedor ou a pessoa de TI responsável podem ser encontradas no arquivo <code className="bg-gray-200 text-sm font-mono p-1 rounded">README.md</code> na pasta do projeto. Ele explica as melhores práticas para uma publicação segura e eficiente usando serviços como Vercel ou Netlify.
          </p>
        </div>

        <div className="text-center pt-4">
            <button
            onClick={onClose}
            className="bg-brand-mid-blue text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Entendido
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default HelpModal;
