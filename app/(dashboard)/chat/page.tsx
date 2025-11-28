"use client";

import { useState } from "react";
import { Send, Heart, MessageCircle, User } from "lucide-react";

interface Message {
  id: string;
  senderName: string;
  senderImage?: string;
  message: string;
  timestamp: string;
  reactions: { emoji: string; count: number }[];
  replyTo?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderName: "Juan Pérez",
      message: "¡Hola a todos! ¿Alguien quiere entrenar hoy a las 6 PM?",
      timestamp: "2024-11-28T14:30:00",
      reactions: [{ emoji: "👍", count: 3 }],
    },
    {
      id: "2",
      senderName: "María González",
      message: "¡Yo me apunto! Voy a hacer cardio.",
      timestamp: "2024-11-28T14:32:00",
      reactions: [{ emoji: "💪", count: 2 }, { emoji: "🔥", count: 1 }],
      replyTo: "Juan Pérez",
    },
    {
      id: "3",
      senderName: "Carlos Ruiz",
      message: "Excelente sesión de piernas hoy. ¡Estoy destruido! 😅",
      timestamp: "2024-11-28T15:00:00",
      reactions: [{ emoji: "😂", count: 5 }],
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderName: "Tú",
      message: newMessage,
      timestamp: new Date().toISOString(),
      reactions: [],
      replyTo: replyingTo || undefined,
    };

    setMessages([...messages, message]);
    setNewMessage("");
    setReplyingTo(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Chat Comunitario</h1>
        <p className="text-gray-400">Conecta con otros miembros del gimnasio</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="group">
              {message.replyTo && (
                <div className="ml-14 mb-1 text-xs text-gray-500 flex items-center gap-2">
                  <MessageCircle className="w-3 h-3" />
                  Respondiendo a {message.replyTo}
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {message.senderImage ? (
                    <img src={message.senderImage} alt={message.senderName} className="w-10 h-10 rounded-full" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{message.senderName}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="bg-gray-800 rounded-lg rounded-tl-none p-3 mb-2">
                    <p className="text-gray-200">{message.message}</p>
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center gap-2">
                    {message.reactions.map((reaction, idx) => (
                      <button
                        key={idx}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs transition-colors"
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-gray-400">{reaction.count}</span>
                      </button>
                    ))}
                    <button
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 text-gray-500 hover:text-gray-300 text-xs transition-all"
                      onClick={() => setReplyingTo(message.senderName)}
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4">
          {replyingTo && (
            <div className="mb-2 flex items-center justify-between bg-gray-800/50 px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MessageCircle className="w-4 h-4" />
                Respondiendo a <span className="text-white">{replyingTo}</span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-gray-500 hover:text-white text-xs"
              >
                Cancelar
              </button>
            </div>
          )}

          <form onSubmit={sendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
