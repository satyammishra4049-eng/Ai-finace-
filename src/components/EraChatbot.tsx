"use client";
import React, { useState, useEffect, useRef } from 'react';

export function EraChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([{
    role: 'assistant', 
    content: 'Hi, I am Era, your AI Finance Assistant. How can I help you today? (नमस्ते, मैं एरा हूँ, आपकी एआई फाइनेंस असिस्टेंट। मैं आपकी कैसे मदद कर सकती हूँ?)'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + data.error }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect to Era.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, fontFamily: 'sans-serif' }}>
      {isOpen ? (
        <div style={{ width: 350, height: 500, backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: 12, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <div style={{ padding: '16px', backgroundColor: '#111', color: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ margin: 0, fontSize: 16 }}>🤖 Era - Finance AI</strong>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20, padding: 0 }}>&times;</button>
          </div>
          
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, backgroundColor: '#fafafa' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', 
                backgroundColor: m.role === 'user' ? '#111' : '#e0e0e0', 
                color: m.role === 'user' ? '#fff' : '#000', 
                padding: '10px 14px', 
                borderRadius: 16, 
                borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: m.role !== 'user' ? 4 : 16,
                maxWidth: '85%', 
                fontSize: 14,
                lineHeight: 1.4
              }}>
                {m.content}
              </div>
            ))}
            {loading && <div style={{ fontSize: 13, color: '#666', fontStyle: 'italic' }}>Era is typing...</div>}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={sendMessage} style={{ display: 'flex', padding: 12, borderTop: '1px solid #ddd', backgroundColor: '#fff', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Ask Era about finance..." 
              style={{ flex: 1, padding: '10px 12px', borderRadius: 20, border: '1px solid #ccc', marginRight: 8, fontSize: 14, outline: 'none' }} 
            />
            <button type="submit" disabled={loading || !input.trim()} style={{ padding: '8px 16px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 'bold' }}>
              Send
            </button>
          </form>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#111', color: '#fff', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', cursor: 'pointer', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}>
          💬
        </button>
      )}
    </div>
  );
}
