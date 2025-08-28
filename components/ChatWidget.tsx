
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, GroundingChunk } from '../types';
import { getAIInsight } from '../services/geminiService';
import { useServices } from '../contexts/ServicesContext';

interface ChatWidgetProps {}

const ChatWidget: React.FC<ChatWidgetProps> = () => {
    const { services } = useServices();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'initial', text: 'Olá! Sou seu assistente de IA. Como posso ajudar a analisar este portfólio de serviços?', sender: 'ai' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const query = userInput.trim();
        if (!query || isLoading) return;

        const newUserMessage: ChatMessage = { id: Date.now().toString(), text: query, sender: 'user' };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const { text, groundingChunks } = await getAIInsight(query, services);
            let aiResponseText = text;

            if (groundingChunks && groundingChunks.length > 0) {
              aiResponseText += `\n\n**Fontes:**\n`;
              groundingChunks.forEach((chunk, index) => {
                if (chunk.web && chunk.web.uri) {
                  aiResponseText += `* [${chunk.web.title || chunk.web.uri}](${chunk.web.uri})\n`;
                }
              });
            }

            const newAiMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
            setMessages(prev => [...prev, newAiMessage]);

        } catch (error) {
            console.error('Error fetching AI insight:', error);
            const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: 'Desculpe, ocorreu um erro ao processar sua solicitação.', sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    function markdownToHtml(text: string) {
      const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>')
        .replace(/\n/g, '<br />');
      return { __html: html };
    }
    
    return (
        <>
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 bg-gradient-to-br from-brand-dark-blue to-brand-mid-blue text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center z-50 transform hover:scale-110 transition-transform"
                aria-label="Abrir chat do assistente de IA"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" /><path d="M8 5a1 1 0 100-2 1 1 0 000 2zM12 5a1 1 0 100-2 1 1 0 000 2z" /></svg>
            </button>
            
            <div className={`fixed bottom-24 right-6 w-full max-w-md h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-40 origin-bottom-right transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="bg-gradient-to-br from-brand-dark-blue to-brand-mid-blue text-white p-4 rounded-t-2xl flex justify-between items-center">
                    <h3 className="text-lg font-bold">Assistente de IA</h3>
                    <button onClick={toggleChat} className="text-white text-2xl font-bold">&times;</button>
                </div>

                <div ref={chatHistoryRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                    {messages.map(msg => (
                        <div key={msg.id} className={`max-w-[85%] w-fit p-3 rounded-lg ${msg.sender === 'user' ? 'bg-brand-mid-blue text-white self-end' : 'bg-gray-200 text-gray-800 self-start'}`}>
                            <p dangerouslySetInnerHTML={markdownToHtml(msg.text)}></p>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="self-start bg-gray-200 p-3 rounded-lg flex items-center gap-2">
                             <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                             <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                             <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Pergunte sobre os dados..."
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-mid-blue focus:outline-none"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !userInput} className="bg-gradient-to-br from-brand-dark-blue to-brand-mid-blue text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50">
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ChatWidget;
