'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useConversations,
  useMessages,
  useStartConversation,
} from '@xmtp/react-sdk';
import { useAccount } from 'wagmi';
import {
  Send,
  Loader2,
  Plus,
  Users,
  UserPlus,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  client: any;
  initClient: () => Promise<void>;
}

// Placeholder conversation to prevent hook errors when none is selected
const PLACEHOLDER_CONVERSATION = {
  topic: '__placeholder__',
  peerAddress: '0x0000000000000000000000000000000000000000',
} as any;

export function ChatInterface({
  client,
  initClient,
}: ChatInterfaceProps) {
  const { address } = useAccount();
  const [selectedConversation, setSelectedConversation] =
    useState<any>(undefined);
  const [messageText, setMessageText] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatAddress, setNewChatAddress] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initAttemptedRef = useRef(false);

  const { conversations, isLoading: conversationsLoading } =
    useConversations();

  // Hook for starting new conversations (React SDK)
  const { startConversation, isLoading: isStartingConversation } =
    useStartConversation();

  // useMessages hook - must be called unconditionally per React rules
  // Use placeholder if no conversation is selected to prevent hook from crashing
  const conversationForHook =
    selectedConversation || PLACEHOLDER_CONVERSATION;
  const messagesHook = useMessages(conversationForHook);

  // Only use messages if a real conversation is selected
  const messages = selectedConversation
    ? messagesHook?.messages || []
    : [];
  const sendMessageFn = selectedConversation
    ? messagesHook?.sendMessage
    : null;
  const messagesLoading = selectedConversation
    ? messagesHook?.isLoading || false
    : false;

  // Initialize XMTP client only once when wallet is connected
  useEffect(() => {
    if (!client && address && !initAttemptedRef.current) {
      initAttemptedRef.current = true;
      initClient().catch((error) => {
        console.error('Failed to initialize XMTP:', error);
        initAttemptedRef.current = false; // Allow retry on error
      });
    }
  }, [client, address, initClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      // Try using the sendMessage function from the hook
      if (sendMessageFn && typeof sendMessageFn === 'function') {
        await sendMessageFn(messageText);
        setMessageText('');
      } else if (
        selectedConversation &&
        typeof selectedConversation.send === 'function'
      ) {
        // Fallback: try using the conversation's send method directly
        await selectedConversation.send(messageText);
        setMessageText('');
      } else {
        console.error('No valid send method found:', {
          sendMessageFn,
          selectedConversation,
        });
        alert('Unable to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(
        `Failed to send message: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  const handleCreateDM = async () => {
    if (
      !client ||
      !newChatAddress.trim() ||
      isCreatingChat ||
      isStartingConversation
    )
      return;

    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(newChatAddress.trim())) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    setIsCreatingChat(true);
    try {
      // Use React SDK's startConversation hook
      if (!startConversation) {
        throw new Error('startConversation function not available');
      }

      const conversation = await startConversation(
        newChatAddress.trim()
      );

      if (conversation) {
        setSelectedConversation(conversation);
        setShowNewChatModal(false);
        setNewChatAddress('');
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert(
        `Failed to create conversation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }. Make sure the address has XMTP enabled.`
      );
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!client || !newChatAddress.trim() || isCreatingChat) return;

    // Parse comma-separated addresses
    const addresses = newChatAddress
      .split(',')
      .map((addr) => addr.trim())
      .filter((addr) => /^0x[a-fA-F0-9]{40}$/.test(addr));

    if (addresses.length === 0) {
      alert(
        'Please enter at least one valid Ethereum address (comma-separated)'
      );
      return;
    }

    setIsCreatingChat(true);
    try {
      // Try to use Browser SDK client directly for group creation
      // Groups might need to be created via the Browser SDK
      if (
        client &&
        typeof (client as any).conversations?.newGroup === 'function'
      ) {
        const group = await (client as any).conversations.newGroup(
          addresses
        );
        setSelectedConversation(group);
        setShowNewChatModal(false);
        setNewChatAddress('');
      } else {
        // Fallback: For now, create individual conversations
        // In a full implementation, you'd use the Browser SDK's group API
        alert(
          'Group creation requires Browser SDK. Creating individual conversations for now. Please use the Browser SDK client directly for groups.'
        );
        // You could create the first conversation as a workaround
        if (startConversation && addresses.length > 0) {
          const firstConv = await startConversation(addresses[0]);
          if (firstConv) {
            setSelectedConversation(firstConv);
            setShowNewChatModal(false);
            setNewChatAddress('');
          }
        }
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert(
        `Failed to create group: ${
          error instanceof Error ? error.message : 'Unknown error'
        }. Make sure all addresses have XMTP enabled.`
      );
    } finally {
      setIsCreatingChat(false);
    }
  };

  if (!client) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-3 text-white">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Initializing XMTP client...</p>
        </div>
        <p className="text-white/60 text-sm mt-4">
          Make sure XMTP is enabled for your wallet address
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden flex flex-col h-[600px]">
      {/* Conversation List Sidebar */}
      <div className="flex h-full">
        <div className="w-64 border-r border-white/20 bg-white/5 p-4 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">
              Conversations
            </h3>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-all"
              title="Start new chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {conversationsLoading ? (
            <div className="text-white/60 text-sm">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="text-white/60 text-sm">
              No conversations yet. Click + to start chatting!
            </div>
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.topic}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedConversation &&
                    selectedConversation.topic === conv.topic
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-medium truncate">
                    {conv.peerAddress?.slice(0, 6)}...
                    {conv.peerAddress?.slice(-4)}
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

              {/* Betting Quick Action */}
              <div className="border-t border-white/20 p-3 bg-white/5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-white/80 text-sm">
                    💰 Quick Bet: Will ETH price go UP or DOWN in 5
                    min?
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Trigger custom event to switch to betting tab with UP selected
                        const event = new CustomEvent('switchToBet', {
                          detail: { prediction: true },
                        });
                        window.dispatchEvent(event);
                        // Also set hash for navigation
                        window.location.hash = 'bet';
                        // Force a small delay to ensure event is processed
                        setTimeout(() => {
                          window.location.hash = 'bet';
                        }, 100);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1"
                    >
                      <TrendingUp className="w-4 h-4" />
                      UP
                    </button>
                    <button
                      onClick={() => {
                        const event = new CustomEvent('switchToBet', {
                          detail: { prediction: false },
                        });
                        window.dispatchEvent(event);
                        window.location.hash = 'bet';
                        setTimeout(() => {
                          window.location.hash = 'bet';
                        }, 100);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1"
                    >
                      <TrendingDown className="w-4 h-4" />
                      DOWN
                    </button>
                  </div>
                </div>
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

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-white text-xl font-bold mb-4">
              Start New Chat
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  Enter Ethereum address(es)
                </label>
                <input
                  type="text"
                  value={newChatAddress}
                  onChange={(e) => setNewChatAddress(e.target.value)}
                  placeholder="0x... or 0x..., 0x... for group"
                  className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-white/60 text-xs mt-2">
                  Single address for DM, comma-separated for group
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateDM}
                  disabled={isCreatingChat || !newChatAddress.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  {isCreatingChat ? 'Creating...' : 'Create DM'}
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={isCreatingChat || !newChatAddress.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Users className="w-4 h-4" />
                  {isCreatingChat ? 'Creating...' : 'Create Group'}
                </button>
              </div>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatAddress('');
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
