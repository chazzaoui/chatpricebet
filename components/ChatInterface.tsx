'use client';

import { useState, useEffect, useRef } from 'react';
import { useConversations, useMessages } from '@xmtp/react-sdk';
import { useAccount } from 'wagmi';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  client: any;
  initClient: () => Promise<void>;
}

export function ChatInterface({
  client,
  initClient,
}: ChatInterfaceProps) {
  const { address } = useAccount();
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversations, isLoading: conversationsLoading } =
    useConversations();
  
  // useMessages hook - safely handle null/undefined
  let messagesResult;
  try {
    messagesResult = useMessages(selectedConversation);
  } catch (error) {
    // Fallback if hook doesn't handle null
    messagesResult = { messages: [], sendMessage: async () => {}, isLoading: false };
  }
  
  const messages = messagesResult?.messages || [];
  const sendMessage = messagesResult?.sendMessage || (async () => {});
  const messagesLoading = messagesResult?.isLoading || false;

  useEffect(() => {
    if (!client && address && !isInitializing) {
      setIsInitializing(true);
      initClient().finally(() => setIsInitializing(false));
    }
  }, [client, address, initClient, isInitializing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await sendMessage(messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!client) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
        {isInitializing ? (
          <div className="flex items-center justify-center gap-3 text-white">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p>Initializing XMTP client...</p>
          </div>
        ) : (
          <p className="text-white">XMTP client not initialized</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden flex flex-col h-[600px]">
      {/* Conversation List Sidebar */}
      <div className="flex h-full">
        <div className="w-64 border-r border-white/20 bg-white/5 p-4 overflow-y-auto">
          <h3 className="text-white font-semibold mb-4">
            Conversations
          </h3>
          {conversationsLoading ? (
            <div className="text-white/60 text-sm">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-white/60 text-sm">
              No conversations yet. Start chatting!
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.topic}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedConversation?.topic === conv.topic
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-medium truncate">
                    {conv.peerAddress.slice(0, 6)}...
                    {conv.peerAddress.slice(-4)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="text-white/60 text-center">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-white/60 text-center">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message: any) => {
                    const isMe =
                      message.senderAddress.toLowerCase() ===
                      address?.toLowerCase();
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isMe
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/20 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {format(
                              new Date(message.sentAt),
                              'HH:mm'
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/20 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && handleSendMessage()
                    }
                    placeholder="Type a message..."
                    className="flex-1 bg-white/10 text-white placeholder-white/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/60">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
