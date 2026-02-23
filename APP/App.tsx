
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import AudioPlayer from './components/AudioPlayer';
import Admin from './components/Admin';
import { useLanguage } from './LanguageContext';
import { Message, DailyVerse } from './types';
import { getDailyVerse, searchMessages } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [parentMessage, setParentMessage] = useState<Message | null>(null);
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchMessages();
    getDailyVerse(language).then(setDailyVerse);
  }, [language, location.pathname]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setAiMatchedIds([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Flatten messages for AI search context
        const allMessages: Message[] = [];
        messages.forEach(m => {
          allMessages.push(m);
          if (m.subMessages) m.subMessages.forEach(s => allMessages.push(s));
        });
        
        const ids = await searchMessages(searchQuery, allMessages);
        setAiMatchedIds(ids);
      } catch (err) {
        console.error("AI Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 600); // Debounce for 600ms

    return () => clearTimeout(timer);
  }, [searchQuery, messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (msg: Message) => {
    if (msg.subMessages && msg.subMessages.length > 0) {
      setParentMessage(msg);
      navigate('/subtitles');
    } else {
      navigate(`/message/${msg.id}`);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    
    // If we have AI results, use them
    if (aiMatchedIds.length > 0) {
      const allMessages: Message[] = [];
      messages.forEach(m => {
        allMessages.push(m);
        if (m.subMessages) m.subMessages.forEach(s => allMessages.push(s));
      });
      
      return aiMatchedIds
        .map(id => allMessages.find(m => m.id === id))
        .filter((m): m is Message => m !== undefined);
    }

    // Fallback to basic search while AI is loading or if it returned nothing
    const query = searchQuery.toLowerCase().trim();
    const results: Message[] = [];
    
    messages.forEach(msg => {
      const titleMatch = msg.title.toLowerCase().includes(query);
      const subtitleMatch = msg.subtitle?.toLowerCase().includes(query);
      const dateMatch = msg.date.includes(query);
      
      if (titleMatch || subtitleMatch || dateMatch) {
        results.push(msg);
      }
      
      if (msg.subMessages) {
        msg.subMessages.forEach(sub => {
          if (sub.title.toLowerCase().includes(query) || sub.date.includes(query)) {
            results.push(sub);
          }
        });
      }
    });
    
    return Array.from(new Map(results.map(item => [item.id, item])).values());
  }, [searchQuery, messages, aiMatchedIds]);

  const renderHome = () => (
    <div className="px-6 py-4 space-y-6">
      {/* Daily Verse Section */}
      {dailyVerse && (
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">{t.dailyVerse}</h3>
            <p className="text-lg font-medium leading-relaxed italic">"{dailyVerse.verse}"</p>
            <p className="mt-2 text-sm text-indigo-200 font-bold">— {dailyVerse.reference}</p>
          </div>
          <div className="absolute top-[-20%] right-[-10%] opacity-10 transform rotate-12 transition-transform group-hover:scale-110">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold text-slate-800">{t.messages}</h3>
          {(searchQuery || isSearching) && (
            <div className="flex items-center gap-2">
              {isSearching && (
                <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              )}
              <span className="text-xs text-slate-400 font-medium">
                {isSearching ? 'Searching...' : `${filteredMessages.length} ${t.results}`}
              </span>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-12 text-slate-400">{t.loading}</div>
        ) : filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleMessageClick(msg)}
              className="w-full text-left bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img src={msg.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{msg.title}</h4>
                <p className="text-sm text-slate-500 truncate">{msg.subtitle || `${msg.duration} • ${msg.date}`}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                {msg.subMessages && msg.subMessages.length > 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                )}
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <p className="text-slate-500 font-medium">{t.noMessages}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSubtitles = () => (
    <div className="px-6 py-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{parentMessage?.title}</h2>
        <p className="text-slate-500 mt-1">{parentMessage?.subtitle || t.subtitles}</p>
      </div>
      {parentMessage?.subMessages?.map((sub) => (
        <button
          key={sub.id}
          onClick={() => {
            navigate(`/message/${sub.id}`);
          }}
          className="w-full text-left bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800">{sub.title}</h4>
            <p className="text-xs text-slate-400 font-mono uppercase">{sub.duration} • {sub.date}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-indigo-600"><polygon points="6 3 20 12 6 21 6 3"/></svg>
        </button>
      ))}
    </div>
  );

  const isPlayerPage = location.pathname.startsWith('/player') || location.pathname.startsWith('/message/');

  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={
        <Layout 
          title={isPlayerPage ? t.nowPlaying : t.appTitle} 
          onBack={location.pathname !== '/' ? goBack : undefined}
          latestMessages={messages}
          onMessageClick={(msg) => navigate(`/message/${msg.id}`)}
          searchQuery={searchQuery}
          onSearchChange={location.pathname === '/' ? setSearchQuery : undefined}
          isSearching={isSearching}
        >
          <Routes>
            <Route path="/" element={renderHome()} />
            <Route path="/subtitles" element={renderSubtitles()} />
            <Route path="/message/:id" element={<MessagePage messages={messages} />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
};

const MessagePage: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Flatten messages to find the current one and its context
  // This creates a flat playlist of all playable tracks
  const playableMessages = useMemo(() => {
    const list: Message[] = [];
    messages.forEach(m => {
      if (m.subMessages && m.subMessages.length > 0) {
        m.subMessages.forEach(sub => list.push(sub));
      } else if (m.audioUrl) {
        list.push(m);
      }
    });
    return list;
  }, [messages]);

  const currentIndex = playableMessages.findIndex(m => m.id === id);
  const message = playableMessages[currentIndex];

  if (!message) return <div className="p-10 text-center">{t.noMessages}</div>;

  const handleNext = () => {
    if (currentIndex < playableMessages.length - 1) {
      navigate(`/message/${playableMessages[currentIndex + 1].id}`);
    } else {
      // Loop back to first
      navigate(`/message/${playableMessages[0].id}`);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      navigate(`/message/${playableMessages[currentIndex - 1].id}`);
    } else {
      // Go to last
      navigate(`/message/${playableMessages[playableMessages.length - 1].id}`);
    }
  };

  return (
    <AudioPlayer 
      message={message} 
      onNext={handleNext}
      onPrevious={handlePrevious}
      hasNext={playableMessages.length > 1}
      hasPrevious={playableMessages.length > 1}
    />
  );
};

export default App;
