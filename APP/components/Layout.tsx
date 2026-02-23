
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { Language } from '../types';
import { Home, MessageSquare, Info, Phone, Settings, Languages, Music, ChevronDown, PlayCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
  latestMessages?: Message[];
  onMessageClick?: (msg: Message) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isSearching?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  onBack, 
  latestMessages, 
  onMessageClick,
  searchQuery,
  onSearchChange,
  isSearching
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const isHomePage = location.pathname === '/';
  const isMessagePage = location.pathname.startsWith('/message/') || location.pathname.startsWith('/player') || location.pathname.startsWith('/subtitles');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleLanguage = () => {
    setLanguage(language === Language.TAMIL ? Language.ENGLISH : Language.TAMIL);
  };

  const menuItems = [
    { label: t.menu.home, icon: <Home size={20} />, path: '/' },
    { label: t.menu.prayer, icon: <MessageSquare size={20} />, path: '#' },
    { label: t.menu.about, icon: <Info size={20} />, path: '#' },
    { label: t.menu.contact, icon: <Phone size={20} />, path: '#' },
    { label: t.admin, icon: <Settings size={20} />, path: '/admin' },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left text-indigo-600"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-800 tracking-tight">
              {title || t.appTitle}
            </h1>
            {!onBack && <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">{t.jesusLovesYou}</p>}
          </div>
          
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-indigo-600 active:scale-90 flex items-center gap-1"
            title={t.changeLanguage}
          >
            <Languages size={18} />
            <span className="text-[9px] font-bold uppercase">{language === Language.TAMIL ? 'EN' : 'தமிழ்'}</span>
          </button>

          {/* Menu Toggle Button */}
          <button 
            onClick={toggleMenu}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>

        {/* Search Bar in Header */}
        {onSearchChange !== undefined && (
          <div className="relative animate-in fade-in slide-in-from-top-2 duration-300 mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all outline-none text-sm shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
              {isSearching && (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              )}
              {searchQuery && !isSearching && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-circle fill-slate-100"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={toggleMenu}
        >
          {/* Side Drawer Content */}
          <div 
            className="absolute top-0 right-0 h-full w-64 bg-white shadow-2xl animate-in slide-in-from-right duration-300 ease-out flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">{t.appTitle}</h2>
              <button onClick={toggleMenu} className="p-2 text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
              {/* Dynamic Messages Section - ONLY on Message Pages */}
              {isMessagePage && latestMessages && latestMessages.length > 0 && (
                <div className="px-4 mb-8">
                  <div className="flex items-center gap-2 px-2 mb-4">
                    <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                      {language === Language.TAMIL ? 'செய்திகள்' : 'Sermon List'}
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {latestMessages.map((m) => {
                      const hasSubMessages = m.subMessages && m.subMessages.length > 0;
                      const isExpanded = expandedCategories[m.id];

                      return (
                        <div key={m.id} className="space-y-1">
                          <div 
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                              isExpanded ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                            }`}
                            onClick={() => {
                              if (hasSubMessages) {
                                toggleCategory(m.id);
                              } else {
                                toggleMenu();
                                if (onMessageClick) onMessageClick(m);
                              }
                            }}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              isExpanded ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {hasSubMessages ? <MessageSquare size={14} /> : <Music size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold truncate ${isExpanded ? 'text-indigo-600' : 'text-slate-700'}`}>
                                {m.title}
                              </p>
                              <p className="text-[9px] text-slate-400 font-medium">{m.date}</p>
                            </div>
                            {hasSubMessages && (
                              <div className={`transition-transform duration-300 text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}>
                                <ChevronDown size={14} />
                              </div>
                            )}
                          </div>

                          {hasSubMessages && isExpanded && (
                            <div className="ml-6 pl-4 border-l-2 border-indigo-100 space-y-1 animate-in slide-in-from-top-2 duration-300">
                              {m.subMessages?.map((sub) => {
                                return (
                                  <button 
                                    key={sub.id}
                                    className="w-full text-left flex items-center gap-3 p-2 rounded-lg transition-colors group hover:bg-indigo-50"
                                    onClick={() => {
                                      toggleMenu();
                                      if (onMessageClick) onMessageClick(sub);
                                    }}
                                  >
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center transition-all bg-white border border-slate-100 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200">
                                      <PlayCircle size={12} />
                                    </div>
                                    <span className="text-[11px] font-bold transition-colors truncate text-slate-600 group-hover:text-indigo-600">
                                      {sub.title}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Static Navigation Section */}
              <div className="px-6 mb-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-1">
                  {isHomePage ? (language === Language.TAMIL ? 'முதன்மை மெனு' : 'Main Menu') : (language === Language.TAMIL ? 'மெனு' : 'Menu')}
                </h3>
              </div>
              
              <div className="px-2 space-y-1">
                {menuItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      toggleMenu();
                      if (item.path !== '#') {
                        navigate(item.path);
                      }
                    }}
                    className="w-full text-left px-4 py-3 flex items-center gap-4 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all group"
                  >
                    <span className="text-slate-400 group-hover:text-indigo-500 transition-colors">{item.icon}</span>
                    <span className="font-bold text-sm">{item.label}</span>
                  </button>
                ))}

                {/* Language Switch inside Drawer for Home Page */}
                {isHomePage && (
                  <button
                    onClick={() => {
                      toggleLanguage();
                      toggleMenu();
                    }}
                    className="w-full text-left px-4 py-3 flex items-center gap-4 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all group"
                  >
                    <span className="text-slate-400 group-hover:text-indigo-500 transition-colors"><Languages size={20} /></span>
                    <span className="font-bold text-sm">
                      {language === Language.TAMIL ? 'English-க்கு மாற்றவும்' : 'மாற்றவும் தமிழ்'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                © 2024 {t.appTitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-12">
        {children}
      </main>
    </div>
  );
};

export default Layout;
