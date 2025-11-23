'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationsLoading, setConversationsLoading] =
    useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initAttemptedRef = useRef(false);
  const messageStreamRef = useRef<AsyncIterable<any> | null>(null);

  // Load conversations from Browser SDK
  useEffect(() => {
    if (!client) return;

    const loadConversations = async () => {
      setConversationsLoading(true);
      try {
        // Browser SDK: Get all conversations
        const allConversations = await client.conversations.list();
        setConversations(allConversations || []);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setConversationsLoading(false);
      }
    };

    loadConversations();
  }, [client]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!client || !selectedConversation) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setMessagesLoading(true);
      try {
        // Browser SDK: Stream messages from conversation
        // Clear previous stream
        if (messageStreamRef.current) {
          messageStreamRef.current = null;
        }

        // Get messages using Browser SDK
        const messageStream = selectedConversation.streamMessages();
        messageStreamRef.current = messageStream;

        const loadedMessages: any[] = [];
        for await (const message of messageStream) {
          loadedMessages.push(message);
          // Update messages as they come in
          setMessages([...loadedMessages]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();

    // Cleanup: stop message stream when conversation changes
    return () => {
      messageStreamRef.current = null;
    };
  }, [client, selectedConversation]);

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
      // Browser SDK conversations have a send method directly
      // According to docs: conversation.send(message)
      // https://docs.xmtp.org/chat-apps/sdks/browser/send-messages
      if (typeof selectedConversation.send === 'function') {
        await selectedConversation.send(messageText);
        setMessageText('');
        // The message stream should update automatically
      } else {
        console.error('Conversation does not have send method:', {
          selectedConversation,
          hasSend: 'send' in selectedConversation,
          sendType: typeof selectedConversation.send,
          methods: Object.getOwnPropertyNames(
            Object.getPrototypeOf(selectedConversation)
          ),
        });
        alert(
          'Unable to send message. The conversation object does not have a send method.'
        );
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
    if (!client || !newChatAddress.trim() || isCreatingChat) return;

    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(newChatAddress.trim())) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    setIsCreatingChat(true);
    try {
      // Use Browser SDK's newDmByIdentifier method (from docs)
      // https://docs.xmtp.org/chat-apps/sdks/browser/create-conversations
      if (client && client.conversations) {
        const identifier = {
          identifier: newChatAddress.trim().toLowerCase(),
          identifierKind: 'Ethereum' as const,
        };

        // Check if identity is reachable (optional check - show warning but allow proceeding)
        // According to docs, canMessage is a helper to check reachability, but not required
        let canMessage = true;
        try {
          const canMessageResult = await (
            client.constructor as any
          ).canMessage([identifier]);
          // canMessage returns a Map<string, boolean>
          canMessage =
            canMessageResult?.get?.(
              newChatAddress.trim().toLowerCase()
            ) ??
            canMessageResult?.[newChatAddress.trim().toLowerCase()] ??
            true; // Default to true if check fails
        } catch (error) {
          // If canMessage check fails, continue anyway
          console.warn(
            'canMessage check failed, proceeding anyway:',
            error
          );
        }

        // Show warning if not reachable, but allow user to proceed
        if (!canMessage) {
          const proceed = confirm(
            `Warning: This address (${newChatAddress.trim()}) may not be reachable on XMTP. They may need to enable XMTP first.\n\nWould you like to try creating the conversation anyway?`
          );
          if (!proceed) {
            return;
          }
        }

        // Create DM using Browser SDK's newDmByIdentifier
        // This will fail naturally if the address is truly unreachable
        const conversation =
          await client.conversations.newDmByIdentifier(identifier);

        if (conversation) {
          setSelectedConversation(conversation);
          setShowNewChatModal(false);
          setNewChatAddress('');
          console.log('DM created:', conversation);
          // Reload conversations list to include the new one
          const allConversations = await client.conversations.list();
          setConversations(allConversations || []);
        } else {
          throw new Error('Failed to create conversation');
        }
      } else {
        throw new Error('Client conversations API not available');
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
      // Use Browser SDK's group creation (from docs)
      // https://docs.xmtp.org/chat-apps/sdks/browser/create-conversations
      if (client && client.conversations) {
        // Step 1: Create identifiers array
        const identifiers = addresses.map((addr) => ({
          identifier: addr.toLowerCase(),
          identifierKind: 'Ethereum' as const,
        }));

        // Step 2: Check if all identities are reachable (optional - show warning but allow proceeding)
        let unreachableAddresses: string[] = [];
        try {
          const canMessageResult = await (
            client.constructor as any
          ).canMessage(identifiers);

          identifiers.forEach((id) => {
            const canMessage =
              canMessageResult?.get?.(id.identifier) ??
              canMessageResult?.[id.identifier] ??
              false;
            if (!canMessage) {
              unreachableAddresses.push(id.identifier);
            }
          });
        } catch (error) {
          // If canMessage check fails, continue anyway
          console.warn(
            'canMessage check failed, proceeding anyway:',
            error
          );
        }

        // Show warning if some addresses are not reachable, but allow user to proceed
        if (unreachableAddresses.length > 0) {
          const proceed = confirm(
            `Warning: The following addresses may not be reachable on XMTP: ${unreachableAddresses.join(
              ', '
            )}. They may need to enable XMTP first.\n\nWould you like to try creating the group anyway?`
          );
          if (!proceed) {
            return;
          }
        }

        // Step 3: Get inbox IDs from addresses
        // According to docs: client.findInboxIdByIdentities()
        const inboxIds = await (
          client as any
        ).findInboxIdByIdentities(identifiers);

        if (!inboxIds || inboxIds.length === 0) {
          throw new Error('Failed to get inbox IDs for addresses');
        }

        // Step 4: Create group chat with inbox IDs
        const group = await client.conversations.newGroup(inboxIds);

        if (group) {
          setSelectedConversation(group);
          setShowNewChatModal(false);
          setNewChatAddress('');
          console.log('Group created:', group);
          // Reload conversations list to include the new group
          const allConversations = await client.conversations.list();
          setConversations(allConversations || []);
        } else {
          throw new Error('Failed to create group');
        }
      } else {
        throw new Error('Client conversations API not available');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert(
        `Failed to create conversation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }. Make sure the address has XMTP enabled.`
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
              {conversations.map((conv) => {
                // Browser SDK conversations should have the send method directly
                // Check if it's a group chat (has groupId or is a Group type)
                const isGroup =
                  conv?.groupId !== undefined ||
                  conv?.kind === 'group' ||
                  'groupId' in (conv || {}) ||
                  conv?.constructor?.name === 'Group';

                // Get display name for group or DM
                let displayName = '';
                let topic = conv?.topic;

                if (isGroup) {
                  displayName =
                    conv?.groupName ||
                    `Group (${conv?.memberCount || '?'} members)` ||
                    'Group Chat';
                } else {
                  // For DMs, get peer address
                  const peerAddress =
                    conv?.peerAddress ||
                    conv?.peerIdentifier?.identifier;
                  displayName = peerAddress
                    ? `${peerAddress.slice(
                        0,
                        6
                      )}...${peerAddress.slice(-4)}`
                    : 'Unknown';
                }

                return (
                  <button
                    key={topic || `conv-${Math.random()}`}
                    onClick={() => {
                      // Browser SDK conversation objects should have send method
                      setSelectedConversation(conv);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedConversation &&
                      selectedConversation.topic === topic
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isGroup && (
                        <Users className="w-4 h-4 text-purple-400" />
                      )}
                      <div className="text-sm font-medium truncate">
                        {displayName}
                      </div>
                    </div>
                  </button>
                );
              })}
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
