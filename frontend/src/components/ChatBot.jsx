import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function ChatBot({ isOpen, onClose, token, apiBase, messages = [], setMessages, financialRecords = [] }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch chat history from database when chat opens or token changes
  useEffect(() => {
    if (isOpen && token) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(`${apiBase}/api/chat/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const history = await res.json();
            if (history && history.length > 0) {
              setMessages(history);
            }
          }
        } catch (err) {
          console.warn("Sohbet geçmişi yüklenemedi.", err);
        }
      };
      fetchHistory();
    }
  }, [isOpen, token, apiBase]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      } else {
        handleFallbackResponse(text);
      }
    } catch (err) {
      handleFallbackResponse(text);
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackResponse = (text) => {
    if (!financialRecords || financialRecords.length === 0) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Simüle moddayım. Ancak detaylı analiz yapabilmem için öncelikle finansal verilerinizi yüklemeniz gerekiyor.' }]);
      return;
    }
    
    const worstMonth = financialRecords.reduce((min, r) => r.profit < min.profit ? r : min, financialRecords[0]);
    const totalRev = financialRecords.reduce((s, r) => s + r.revenue, 0);
    const totalProf = financialRecords.reduce((s, r) => s + r.profit, 0);
    const profitMargin = totalRev > 0 ? ((totalProf / totalRev) * 100).toFixed(1) : 0;
    
    let content = `Şu anda simüle moddayım (sunucu yanıt vermedi). Verilerinizi incelediğimde toplam ${totalRev.toLocaleString('tr-TR')} TL cironuz ve ortalama %${profitMargin} kâr marjınız bulunuyor. En çok dikkat çeken dönem ${worstMonth.date} olmuş. Sorunuza gelince: Giderleri kısmak veya kâr marjı yüksek odaklanmak bu istatistiklere göre iyi bir adım olabilir.`;
    
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
          { role: 'ai', content: 'Sohbet geçmişi temizlendi. Yeni bir analiz veya soruyla başlayabiliriz. Nasıl yardımcı olabilirim?' }
        ]);
      }
    } catch (err) {
      console.error("Sohbet geçmişi temizlenemedi.", err);
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
          impact: 'Yapay Zeka Önerisi' 
        })
      });
      if (res.ok) {
        alert("Aksiyon başarıyla eklendi! 'Genel Bakış' sayfasındaki Takip Listesi'nden kontrol edebilirsiniz.");
      } else {
        alert("Aksiyon eklenirken bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucu bağlantı hatası.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const getPrompts = () => {
    if (!financialRecords || financialRecords.length === 0) {
      return [
        "Bu ay en büyük riskim ne?",
        "En iyi ürünüm hangisi?",
        "Maliyetleri nasıl düşürebilirim?"
      ];
    }
    const worstMonth = financialRecords.reduce((min, r) => r.profit < min.profit ? r : min, financialRecords[0]);
    const prompts = [];
    if (worstMonth.profit < 0) {
       prompts.push(`${worstMonth.date}'daki ${Math.abs(worstMonth.profit).toLocaleString('tr-TR')} TL zararı nasıl düzeltirim?`);
    } else {
       prompts.push(`${worstMonth.date} ayındaki kâr performansımı nasıl artırabilirim?`);
    }
    
    if (financialRecords.length > 1) {
       const last = financialRecords[financialRecords.length - 1];
       const prev = financialRecords[financialRecords.length - 2];
       if (last.expenses > prev.expenses) {
          prompts.push("Giderlerimdeki ani artışı nasıl kontrol altına alabilirim?");
       } else {
          prompts.push("Kârlılığımı daha da yukarı taşımak için tavsiyelerin neler?");
       }
    } else {
       prompts.push("Maliyetleri nasıl düşürebilirim?");
    }
    prompts.push("Önümüzdeki ay için kâr/zarar tahmini yapabilir misin?");
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
            <span>InsightAI Danışmanınız</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {token && (
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
                Yeni Sohbet
              </button>
            )}
            <button className="close-chat-btn" onClick={onClose} style={{ display: 'flex', alignItems: 'center' }}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="chat-messages-area" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.length <= 1 && (
            <div style={{ margin: '1rem 0', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Henüz finansal veriniz yoksa veya desteğe ihtiyacınız varsa format konusunda yardımcı olabilirim!
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
                  <Plus size={12} /> Aksiyona Ekle
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble ai" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', alignSelf: 'flex-start' }}>
              <span className="animate-pulse">Düşünüyor...</span>
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
              placeholder="Veriler hakkında bir soru sorun (Örn: Kârı nasıl artırabilirim?)"
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
