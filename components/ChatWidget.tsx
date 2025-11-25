import React, { useState, useEffect, useRef } from 'react';
// Load the Google GenAI client dynamically to keep it out of the ChatWidget
// entry chunk and reduce initial bundle size.
import { ChatIcon } from './icons/ChatIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';

const systemInstruction = "You are the MmadFitbooki Assistant, a friendly and knowledgeable AI assistant for the MmadFitbooki application. Your expertise is in all types of fitness, including strength training, yoga, CrossFit, Pilates, and general wellness. Provide concise, helpful, and encouraging answers to user questions about fitness, workouts, and healthy living. Keep your answers relatively short and easy to understand. Do not answer questions outside of the fitness and wellness scope.";

type Message = {
    role: 'user' | 'model';
    text: string;
};

// Define a lightweight Chat interface for local typing; the full Chat
// type comes from '@google/genai' and is only used at runtime after
// the dynamic import.
type ChatLike = {
    sendMessageStream: (opts: { message: string }) => AsyncIterable<{ text?: string }>;
};

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [chat, setChat] = useState<ChatLike | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        const initChat = async () => {
            try {
                if (!process.env.API_KEY) {
                  console.error("API_KEY environment variable not set.");
                  setMessages([{ role: 'model', text: "Sorry, the chat is not configured correctly. Please contact support." }]);
                  return;
                }

                // Dynamically import the heavy client so bundlers can split it into a separate chunk.
                const genai = await import('@google/genai');
                const GoogleGenAI = (genai as any).GoogleGenAI;

                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const chatSession = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: systemInstruction,
                    },
                });
                setChat(chatSession as any);
                setMessages([{ role: 'model', text: "Hello! I'm the MmadFitbooki Assistant. How can I help you with your fitness goals today?" }]);
            } catch (error) {
                console.error("Failed to initialize chat:", error);
                setMessages([{ role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
            }
        };
        initChat();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chat) return;

        const userMessage: Message = { role: 'user', text: userInput };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            const responseStream = await chat.sendMessageStream({ message: currentInput });
            
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    setMessages(prev => {
                        const lastMessage = prev[prev.length - 1];
                        if (lastMessage.role === 'model') {
                            const updatedMessages = [...prev];
                            updatedMessages[prev.length - 1] = { ...lastMessage, text: lastMessage.text + chunkText };
                            return updatedMessages;
                        }
                        return prev;
                    });
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Oops! Something went wrong. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-brand-primary text-white p-3 rounded-full shadow-lg hover:bg-brand-secondary transition-transform transform hover:scale-110 z-20 focus-ring"
                aria-label={isOpen ? "Close chat" : "Open chat"}
                type="button"
            >
                {isOpen ? <CloseIcon className="w-8 h-8" /> : <ChatIcon className="w-8 h-8" />}
            </button>
            
            <div className={`fixed bottom-24 right-6 w-[calc(100vw-3rem)] max-w-sm h-[60vh] max-h-[500px] bg-surface-dark border border-border-dark rounded-lg shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-20 origin-bottom-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="p-4 border-b border-border-dark">
                    <h3 className="font-bold text-lg text-text-primary">MmadFitbooki Assistant</h3>
                    <p className="text-sm text-text-primary/80">Your AI fitness expert</p>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-background-dark text-text-primary rounded-bl-none'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xs px-4 py-3 rounded-2xl bg-background-dark text-text-primary rounded-bl-none">
                                <div className="flex items-center justify-center space-x-1">
                                    <span className="w-2 h-2 bg-text-primary/80 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-text-primary/80 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-text-primary/80 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-2 border-t border-border-dark">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask about fitness..."
                            className="flex-1 bg-background-dark border border-border-dark rounded-full px-4 py-2 text-text-primary focus:ring-brand-primary focus:border-brand-primary transition focus-ring"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !userInput.trim()}
                            className="p-2 bg-brand-primary rounded-full text-white disabled:bg-border-dark disabled:cursor-not-allowed hover:bg-brand-secondary transition-colors focus-ring"
                            aria-label="Send message"
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};