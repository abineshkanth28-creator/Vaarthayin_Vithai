import React, { useState, useEffect } from 'react';
import { Message, Language } from '../types';
import { useLanguage } from '../LanguageContext';
import { Trash2, Edit, Plus, LogOut, Save, X, Music, Calendar, Clock, Type, Link as LinkIcon, MessageSquare } from 'lucide-react';

const Admin: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessage, setEditingMessage] = useState<Partial<Message> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoggedIn(true);
      fetchMessages();
    }
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        setIsLoggedIn(true);
        fetchMessages();
      } else {
        alert(t.invalidPassword);
      }
    } catch {
      alert(t.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  };

  const cleanGoogleDriveUrl = (url: string) => {
    if (!url) return '';
    // Handle standard share links: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
    }
    // Handle open links: https://drive.google.com/open?id=FILE_ID
    const openIdMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (url.includes('drive.google.com') && openIdMatch && openIdMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${openIdMatch[1]}`;
    }
    return url;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage) return;

    const token = localStorage.getItem('admin_token');
    const method = editingMessage.id ? 'PUT' : 'POST';
    const url = editingMessage.id ? `/api/messages/${editingMessage.id}` : '/api/messages';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editingMessage),
      });

      if (res.ok) {
        setEditingMessage(null);
        setIsAdding(false);
        fetchMessages();
      } else {
        alert(t.errorSaving);
      }
    } catch {
      alert(t.errorOccurred);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;

    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) fetchMessages();
    } catch {
      alert(t.errorDeleting);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-800">{t.admin} {t.login}</h1>
            <p className="text-slate-500 text-sm">{t.enterPassword}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? t.verifying : t.login}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">{t.admin}</h1>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">{t.messages} ({messages.length})</h2>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingMessage({
                title: '',
                subtitle: '',
                date: new Date().toISOString().split('T')[0],
                duration: '00:00',
                audioUrl: '',
                thumbnail: `https://picsum.photos/seed/${Date.now()}/400/400`,
              });
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            <Plus size={18} /> {t.new} {language === Language.TAMIL ? 'செய்தி' : 'Message'}
          </button>
        </div>

        {(isAdding || editingMessage) && (
          <div className="bg-white rounded-3xl shadow-lg border border-indigo-100 p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{editingMessage?.id ? t.editMessage : t.addMessage}</h3>
              <button onClick={() => { setEditingMessage(null); setIsAdding(false); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Type size={12} /> {t.title}</label>
                <input
                  type="text"
                  value={editingMessage?.title || ''}
                  onChange={(e) => setEditingMessage({ ...editingMessage, title: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Type size={12} /> {t.subtitle}</label>
                <input
                  type="text"
                  value={editingMessage?.subtitle || ''}
                  onChange={(e) => setEditingMessage({ ...editingMessage, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Calendar size={12} /> {t.date}</label>
                <input
                  type="date"
                  value={editingMessage?.date || ''}
                  onChange={(e) => setEditingMessage({ ...editingMessage, date: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Clock size={12} /> {t.duration} (MM:SS)</label>
                <input
                  type="text"
                  value={editingMessage?.duration || ''}
                  onChange={(e) => setEditingMessage({ ...editingMessage, duration: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="45:20"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2"><LinkIcon size={12} /> {t.audioLink} (Google Drive MP3)</label>
                <input
                  type="url"
                  value={editingMessage?.audioUrl || ''}
                  onChange={(e) => setEditingMessage({ ...editingMessage, audioUrl: cleanGoogleDriveUrl(e.target.value) })}
                  className="w-full bg-white border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                  placeholder="Paste Google Drive link here..."
                  required
                />
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] text-indigo-600 font-bold">
                    How to get Google Drive Direct Link:
                  </p>
                  <p className="text-[9px] text-slate-500 leading-relaxed">
                    1. Share your MP3 file as "Anyone with the link".<br/>
                    2. Copy the File ID from the link.<br/>
                    3. Use this format: <code className="bg-white px-1 rounded border border-indigo-200 text-indigo-700">https://drive.google.com/uc?export=download&id=YOUR_FILE_ID</code>
                  </p>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Music size={12} /> {t.thumbnailLink}</label>
                <input
                  type="url"
                  value={editingMessage?.thumbnail || ''}
                  onChange={(e) => setEditingMessage({ ...editingMessage, thumbnail: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://..."
                />
              </div>

              {/* Sub-messages Management */}
              <div className="md:col-span-2 space-y-4 border-t border-slate-100 pt-6 mt-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={16} className="text-indigo-600" />
                    {t.subtitles}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newSub = {
                        id: `sub-${Date.now()}`,
                        title: '',
                        date: editingMessage?.date || '',
                        duration: '00:00',
                        audioUrl: '',
                        thumbnail: editingMessage?.thumbnail || '',
                      };
                      setEditingMessage({
                        ...editingMessage,
                        subMessages: [...(editingMessage?.subMessages || []), newSub]
                      });
                    }}
                    className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1"
                  >
                    <Plus size={12} /> {t.addMessage}
                  </button>
                </div>

                <div className="space-y-3">
                  {editingMessage?.subMessages?.map((sub, idx) => (
                    <div key={sub.id} className="bg-slate-50 p-4 rounded-2xl space-y-3 border border-slate-100 relative group">
                      <button
                        type="button"
                        onClick={() => {
                          const newSubs = editingMessage.subMessages?.filter((_, i) => i !== idx);
                          setEditingMessage({ ...editingMessage, subMessages: newSubs });
                        }}
                        className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Sub-Title</label>
                          <input
                            type="text"
                            value={sub.title}
                            onChange={(e) => {
                              const newSubs = [...(editingMessage.subMessages || [])];
                              newSubs[idx] = { ...sub, title: e.target.value };
                              setEditingMessage({ ...editingMessage, subMessages: newSubs });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Audio URL</label>
                          <input
                            type="url"
                            value={sub.audioUrl}
                            onChange={(e) => {
                              const newSubs = [...(editingMessage.subMessages || [])];
                              newSubs[idx] = { ...sub, audioUrl: cleanGoogleDriveUrl(e.target.value) };
                              setEditingMessage({ ...editingMessage, subMessages: newSubs });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Paste Google Drive link..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!editingMessage?.subMessages || editingMessage.subMessages.length === 0) && (
                    <p className="text-[10px] text-slate-400 italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      No sub-messages added yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {t.save}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img src={msg.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 truncate">{msg.title}</h4>
                <p className="text-xs text-slate-400 font-medium">{msg.date} • {msg.duration}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingMessage(msg)}
                  className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-50 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <p>{t.noMessages}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
