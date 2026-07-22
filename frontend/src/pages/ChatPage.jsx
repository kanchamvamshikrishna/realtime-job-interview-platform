import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useListConversationsQuery, useGetConversationQuery } from '../features/chat/chatApi';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../features/auth/useAuth';
import { Spinner } from '../components/Spinner';

const ConversationList = ({ activeUserId }) => {
  const { data, isLoading, refetch } = useListConversationsQuery();
  const { socket, onlineUsers } = useSocketContext();
  const conversations = data?.data?.conversations || [];

  useEffect(() => {
    if (!socket) return;
    socket.on('receive_message', refetch);
    return () => socket.off('receive_message', refetch);
  }, [socket, refetch]);

  if (isLoading) return <Spinner />;

  return (
    <div className="w-full shrink-0 border-gray-200 sm:w-64 sm:border-r dark:border-gray-800">
      <h2 className="mb-2 px-3 pt-3 text-sm font-semibold text-gray-500 dark:text-gray-400">Conversations</h2>
      {conversations.length === 0 && (
        <p className="px-3 text-sm text-gray-400">No conversations yet.</p>
      )}
      <div className="space-y-1 px-2">
        {conversations.map((c) => {
          const other = c.otherUser;
          if (!other) return null;
          const isOnline = onlineUsers.has(other._id);
          return (
            <Link
              key={c._id}
              to={`/chat/${other._id}`}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                activeUserId === other._id ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className="min-w-0">
                <p className="truncate font-medium">{other.name}</p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {c.lastMessage?.content}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const ChatThread = ({ otherUserId }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocketContext();
  const { data, isLoading } = useGetConversationQuery(otherUserId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (data?.data?.messages) setMessages(data.data.messages);
  }, [data]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_conversation', { otherUserId });

    const handleReceive = (message) => {
      const belongsHere = message.sender === otherUserId || message.recipient === otherUserId;
      if (belongsHere) setMessages((prev) => [...prev, message]);
    };
    const handleTyping = ({ userId }) => {
      if (userId === otherUserId) setIsTyping(true);
    };
    const handleStopTyping = ({ userId }) => {
      if (userId === otherUserId) setIsTyping(false);
    };

    socket.on('receive_message', handleReceive);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit('typing', { recipientId: otherUserId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { recipientId: otherUserId });
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('send_message', { recipientId: otherUserId, content: input.trim() });
    setInput('');
    clearTimeout(typingTimeout.current);
    socket.emit('stop_typing', { recipientId: otherUserId });
  };

  if (isLoading) return <Spinner />;

  const otherUser = data?.data?.otherUser;
  const isOnline = onlineUsers.has(otherUserId);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
        <div>
          <p className="font-semibold">{otherUser?.name || 'Unknown user'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = (m.sender._id || m.sender) === user._id;
          return (
            <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        {isTyping && <p className="text-xs italic text-gray-400">{otherUser?.name} is typing…</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-200 p-3 dark:border-gray-800">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export const ChatPage = () => {
  const { otherUserId } = useParams();

  return (
    <div className="flex h-[75vh] overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <ConversationList activeUserId={otherUserId} />
      {otherUserId ? (
        <ChatThread key={otherUserId} otherUserId={otherUserId} />
      ) : (
        <div className="flex flex-1 items-center justify-center text-gray-400">
          Select a conversation to start chatting
        </div>
      )}
    </div>
  );
};
