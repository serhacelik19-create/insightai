import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';

function ChatBot({ isOpen, onClose, messages = [], setMessages, financialRecords = [] }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch chat history from database when chat opens
  useEffect(() => {
    if (isOpen) {
      const fetchHistory = async () => {
        try {
          const history = await api.getChatHistory();
          if (history && history.length > 0) {
            setMessages(history.map(item => ({
              role: item.role === 'user' ? 'user' : 'ai',
              content: item.content
            })));
          }
        } catch (err) {
          console.warn("Failed to load chat history.", err);
        }
      };
      fetchHistory();
    }
  }, [isOpen, setMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    setInput('');

    try {
      const data = await api.sendChatMessage(text);
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (err) {
      handleFallbackResponse(text);
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackResponse = (text) => {
    if (!financialRecords || financialRecords.length === 0) {
      setMessages(prev => [...prev, { role: 'ai', content: 'I am in simulated mode. However, in order to perform detailed analysis, you first need to upload your financial data.' }]);
      return;
    }
    
    const worstMonth = financialRecords.reduce((min, r) => r.profit < min.profit ? r : min, financialRecords[0]);
    const totalRev = financialRecords.reduce((s, r) => s + r.revenue, 0);
    const totalProf = financialRecords.reduce((s, r) => s + r.profit, 0);
    const profitMargin = totalRev > 0 ? ((totalProf / totalRev) * 100).toFixed(1) : 0;
    
    let content = `I am currently in simulated mode (server did not respond). When I analyze your data, you have a total revenue of $${totalRev.toLocaleString('en-US')} and an average profit margin of ${profitMargin}%. The most notable period was ${worstMonth.date}. As for your question: Cutting expenses or focusing on high profit margins could be a good step based on these statistics.`;
    
    setMessages(prev => [...prev, { role: 'ai', content }]);
  };

  const clearChatHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/api/chat/clear`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages([
          { role: 'ai', content: 'Chat history cleared. We can start with a new analysis or question. How can I help?' }
        ]);
      }
    } catch (err) {
      console.error("Failed to clear chat history.", err);
    }
  };

  const handleAddToActionTracker = async (content) => {
    if (!token) return;
    
    // Remove markdown formatting and make a clean title
    let cleanText = content.replace(/[#*`_\[\]()]/g, '');
    let actionTitle = cleanText.trim();
    if (actionTitle.length > 80) {
      actionTitle = actionTitle.substring(0, 77) + "...";
    }
    
    try {
      const res = await fetch(`${apiBase}/api/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: actionTitle, 
          impact: 'AI Recommendation' 
        })
      });
      if (res.ok) {
        alert("Action successfully added! You can check it from the Tracking List on the 'Overview' page.");
      } else {
        alert("An error occurred while adding the action.");
      }
    } catch (err) {
      console.error(err);
      alert("Server connection error.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const getPrompts = () => {
    if (!financialRecords || financialRecords.length === 0) {
      return [
        "What is my biggest risk this month?",
        "Which is my best product?",
        "How can I reduce costs?"
      ];
    }
    const worstMonth = financialRecords.reduce((min, r) => r.profit < min.profit ? r : min, financialRecords[0]);
    const prompts = [];
    if (worstMonth.profit < 0) {
       prompts.push(`How do I fix the $${Math.abs(worstMonth.profit).toLocaleString('en-US')} loss in ${worstMonth.date}?`);
    } else {
       prompts.push(`How can I increase my profit performance in ${worstMonth.date}?`);
    }
    
    if (financialRecords.length > 1) {
       const last = financialRecords[financialRecords.length - 1];
       const prev = financialRecords[financialRecords.length - 2];
       if (last.expenses > prev.expenses) {
          prompts.push("How can I get the sudden increase in my expenses under control?");
       } else {
          prompts.push("What are your recommendations to push my profitability even higher?");
       }
    } else {
       prompts.push("How can I reduce costs?");
    }
    prompts.push("Can you make a profit/loss forecast for next month?");
    return prompts;
  };
  
  const prompts = getPrompts();

  return (
    <>
      <div className={`chat-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <div className={`ai-chat-panel ${isOpen ? 'open' : ''}`}>
        <div className="chat-panel-header">
          <div className="chat-panel-title">
            <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
            <span>InsightAI Advisor</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={clearChatHistory} 
                style={{ 
                  backgroundColor: 'transparent', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-secondary)', 
                  padding: '0.35rem 0.65rem', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--bg-main)'; e.target.style.color = 'var(--color-primary)'; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--text-secondary)'; }}
              >
                New Chat
              </button>
            <button className="close-chat-btn" onClick={onClose} style={{ display: 'flex', alignItems: 'center' }}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="chat-messages-area" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.length <= 1 && (
            <div style={{ margin: '1rem 0', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              If you don't have financial data yet or need support, I can help you with the format!
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'ai' || msg.role === 'model' ? 'flex-start' : 'flex-end', width: '100%' }}>
              <div className={`chat-bubble ${msg.role === 'ai' || msg.role === 'model' ? 'ai' : 'user'}`} style={{ maxWidth: '85%', padding: '0.75rem 1rem', lineHeight: '1.5' }}>
                {msg.role === 'ai' || msg.role === 'model' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              {(msg.role === 'ai' || msg.role === 'model') && index > 0 && (
                <button 
                  onClick={() => handleAddToActionTracker(msg.content)}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-primary)',
                    background: 'transparent',
                    border: '1px solid var(--color-primary-light)',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    marginTop: '0.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s ease',
                    alignSelf: 'flex-start'
                  }}
                  onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--color-primary-light)' }}
                  onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent' }}
                >
                  <Plus size={12} /> Add to Actions
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble ai" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', alignSelf: 'flex-start' }}>
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        <div className="chat-input-area">
          {messages.length <= 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {prompts.map((prompt, i) => (
                <button 
                  key={i} 
                  className="btn btn-outline" 
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '16px', background: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          <form className="chat-form" onSubmit={handleSubmit}>
            <input 
              type="text" 
              className="chat-text-input"
              placeholder="Ask about revenue, costs, anomalies, or predictions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }} disabled={loading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ChatBot;
