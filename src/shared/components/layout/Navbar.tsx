import { Link, useLocation, useNavigate } from "react-router-dom";
import { generateSeoUrl } from "@/shared/lib/utils";
import { createPortal } from "react-dom";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Film, Search, X, User, LogOut, Settings, BookmarkPlus, ChevronDown, Home, Tv, Compass } from "lucide-react";

import { useAuth } from "@/context/AuthProvider";
import { useEffect, useMemo, useRef, useState } from "react";
import { tmdb, toPoster, toTitle, toYear } from "@/shared/api/tmdb/client";
import { searchQuerySchema } from "@/shared/lib/validation";
import { TmdbSearchResult } from "@/shared/api/tmdb/types";
import { validateSearchQuery } from "@/shared/lib/inputSanitization";

type SearchFilter = 'multi' | 'movie' | 'tv';
const filterLabels: Record<SearchFilter, string> = {
  multi: 'Movies & TV Shows',
  movie: 'Movies',
  tv: 'TV Shows'
};
const nextFilter: Record<SearchFilter, SearchFilter> = {
  multi: 'movie',
  movie: 'tv',
  tv: 'multi'
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TmdbSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(0);
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('multi');
  const [isScrolled, setIsScrolled] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches') || '[]'); } 
    catch { return []; }
  });
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const userButtonRef = useRef<HTMLButtonElement | null>(null);
  const { user, loading, signOut } = useAuth();
  
  const saveRecentSearch = (q: string) => {
    if (!q.trim()) return;
    setRecentSearches(prev => {
      const updated = [q.trim(), ...prev.filter(item => item !== q.trim())].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  // Validate and sanitize query (preserve spaces for display)
  const sanitizedQuery = useMemo(() => {
    const validation = validateSearchQuery(query, { preserveSpaces: true });
    return validation.sanitized;
  }, [query]);
  // wire side effects for autosuggest
   
  useNavbarEffects(query, setSuggestions, setOpen, boxRef, (fn) => setActiveIndex((i) => fn(i)), setSearchExpanded, setQuery, searchFilter);
  
  // Track scroll position for dynamic navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initialize
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu dropdown when clicking outside
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const el = userMenuRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [userMenuRef, setUserMenuOpen]);

  // Global Cmd+K listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchExpanded((open) => {
          if (!open) {
            setTimeout(() => inputRef.current?.focus(), 100);
            return true;
          }
          return false;
        });
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Focus trap for search modal
  useEffect(() => {
    if (!searchExpanded) return;
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = document.getElementById('search-modal');
    if (!modal) return;
    
    const focusableContent = modal.querySelectorAll(focusableElements);
    if (focusableContent.length === 0) return;
    
    const firstFocusableElement = focusableContent[0] as HTMLElement;
    const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
      if (!isTabPressed) return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchExpanded, suggestions, open, recentSearches]);
  
  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Browse", path: "/movies", icon: Compass },
    { name: "TV Shows", path: "/tv-shows", icon: Tv },
    { name: "Watchlist", path: "/watchlist", icon: BookmarkPlus },
  ];

  const mobileNavLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Browse", path: "/movies", icon: Compass },
    { name: "Search", path: "/search", icon: Search },
    { name: "Watchlist", path: "/watchlist", icon: BookmarkPlus },
  ];

  const isTitlePage = location.pathname.startsWith('/title/') || location.pathname.startsWith('/movie/') || location.pathname.startsWith('/tv/');

  return (
    <>
      <div className={`${isTitlePage ? 'hidden' : 'hidden md:flex'} fixed left-0 right-0 z-50 justify-center px-4 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled ? 'top-2 md:top-4' : 'top-0'}`}>
        <nav className={`w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative pointer-events-auto flex items-center justify-between ${
          isScrolled 
            ? 'max-w-6xl md:lg-surface md:rounded-full px-4 py-2 md:px-6 md:py-2 md:shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:border md:border-white/10' 
            : 'max-w-7xl bg-transparent px-4 py-3 md:px-6 md:py-4 border-transparent'
        }`}>
          {/* Apple-style Frosted Glass Background Layer - Only visible when scrolled on desktop */}
          <div className={`hidden md:block absolute inset-0 rounded-full transition-opacity duration-500 -z-10 ${isScrolled ? 'opacity-100 lg-lens' : 'opacity-0'}`}>
            <div className="lg-highlight rounded-full"></div>
            <div className="lg-rim rounded-full"></div>
          </div>

          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground rounded px-3 py-1 z-50">Skip to content</a>
          
          {/* Logo - Left/Center */}
          <div className="flex-1 flex items-center justify-center md:justify-start z-10">
            <Link to="/" className="flex items-center gap-2 group relative translate-y-1">
              <img src="/logo_cropped.png" alt="Cinephile" className="w-11 h-11 sm:w-12 sm:h-12 group-hover:scale-110 transition-transform duration-300 relative z-10 drop-shadow-lg" />
              <span className={`hidden md:block font-heading font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-500 ${isScrolled ? 'text-2xl' : 'text-3xl'}`}>
                Cinephile
              </span>
            </Link>
          </div>

          {/* Links - Center */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-8 z-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative group py-2"
              >
                <span className={`text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? "text-primary drop-shadow-[0_0_8px_rgba(145,70,255,0.5)]"
                    : "text-white/70 group-hover:text-white"
                }`}>
                  {link.name}
                </span>
                
                <span className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full transition-all duration-300 ${
                  location.pathname === link.path 
                    ? "w-full" 
                    : "w-0 group-hover:w-full"
                }`} />
                
                <span className="absolute -inset-2 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10" />
              </Link>
            ))}
          </div>

          {/* Actions - Right */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-2 md:gap-4 z-10">
              {/* Animated Search Button/Bar */}
              <div className="relative">
                {/* Search Button (collapsed state) */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full opacity-0 group-hover:opacity-100 blur transition-all duration-300" />
                  
                  {/* Search Icon Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open search"
                    onClick={() => {
                      setSearchExpanded(true);
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="relative rounded-full hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                </div>

                {searchExpanded && createPortal(
                  <div 
                    id="search-modal"
                    className="fixed inset-0 z-[100] flex justify-center items-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => {
                      setSearchExpanded(false);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <form
                      ref={boxRef}
                      onClick={(e) => e.stopPropagation()}
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (sanitizedQuery.trim()) {
                          saveRecentSearch(sanitizedQuery);
                          // Prevent navigation to generic search page on enter
                        }
                      }}
                      className="w-full max-w-xl mx-4 flex flex-col gap-3 animate-in zoom-in-95 duration-200"
                    >
                      {/* Header: Title and Controls */}
                      <div className="flex items-center justify-between px-1">
                        <h2 className="text-xl font-bold text-white tracking-tight">Search</h2>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-xs font-medium text-white/80 cursor-pointer hover:bg-[#222] transition-colors select-none">
                                {filterLabels[searchFilter]}
                                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="z-[200] bg-[#1a1a1a] border-white/10 text-white/80">
                              <DropdownMenuItem onClick={() => setSearchFilter('multi')} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                Movies & TV Shows
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSearchFilter('movie')} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                Movies
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSearchFilter('tv')} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                TV Shows
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchExpanded(false);
                              setQuery("");
                              setOpen(false);
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <X className="w-4 h-4 text-white/80" />
                          </button>
                        </div>
                      </div>

                      {/* Search Input */}
                      <div className="relative group">
                        <input
                          ref={inputRef}
                          value={query}
                          onChange={(e) => {
                            const rawValue = e.target.value;
                            const validation = validateSearchQuery(rawValue, { preserveSpaces: true });
                            if (validation.isValid || rawValue === '') {
                              setQuery(validation.sanitized);
                              setOpen(validation.sanitized.trim().length >= 2);
                            } else if (validation.error) {
                              setQuery(validation.sanitized);
                              setOpen(false);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (!open || !suggestions.length) {
                              if (e.key === 'Escape') {
                                setSearchExpanded(false);
                                setQuery("");
                                setOpen(false);
                              }
                              return;
                            }
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setActiveIndex((i) => Math.max(i - 1, 0));
                            } else if (e.key === 'Enter') {
                              if (activeIndex >= 0) {
                                e.preventDefault();
                                const it = suggestions[activeIndex];
                                saveRecentSearch(toTitle(it));
                                const mediaType = it.title ? 'movie' : 'tv';
                                navigate(generateSeoUrl(mediaType, it.id, it.title || it.name));
                                setOpen(false);
                                setSearchExpanded(false);
                                setQuery("");
                              }
                            } else if (e.key === 'Escape') {
                              setOpen(false);
                              setSearchExpanded(false);
                              setQuery("");
                            }
                          }}
                          placeholder="Type here to search..."
                          className="w-full h-12 rounded-xl border border-white/10 bg-[#0a0a0a] px-12 text-sm font-medium
                                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-white/30 focus:bg-[#111] text-white
                                    placeholder:text-white/40 transition-all duration-200 shadow-inner"
                        />
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      </div>

                      {/* Suggestions / Recent Dropdown container */}
                      <div 
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden mt-1 flex flex-col min-h-[100px]"
                        aria-live="polite"
                      >
                        {open && suggestions.length > 0 ? (
                          <div className="max-h-[50vh] overflow-y-auto py-2">
                            {suggestions.map((s, idx) => (
                              <button
                                key={s.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  saveRecentSearch(toTitle(s));
                                  const mediaType = s.title ? 'movie' : 'tv';
                                  navigate(generateSeoUrl(mediaType, s.id, s.title || s.name));
                                  setOpen(false);
                                  setSearchExpanded(false);
                                  setQuery("");
                                }}
                                className={`w-full text-left px-4 py-2.5 flex items-center gap-4 transition-colors group
                                            ${idx === activeIndex ? 'bg-white/5' : 'hover:bg-white/5'}`}
                              >
                                <div className="relative flex-shrink-0 rounded-md overflow-hidden bg-white/5 w-10 h-14">
                                  <img 
                                    src={toPoster(s.poster_path)} 
                                    loading="lazy" 
                                    className="w-full h-full object-cover" 
                                    alt={toTitle(s)}
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium truncate text-white/90 group-hover:text-white">
                                    {toTitle(s)}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                                    <span>{toYear(s)}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span>{s.title ? 'Movie' : 'TV Show'}</span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">Recent</span>
                              {recentSearches.length > 0 && (
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setRecentSearches([]);
                                    localStorage.removeItem('recentSearches');
                                  }}
                                  className="text-[10px] text-white/40 hover:text-white/80 transition-colors uppercase"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                            <div className="flex flex-col">
                              {recentSearches.length > 0 ? (
                                recentSearches.map((recent, idx) => (
                                  <div 
                                    key={idx}
                                    onClick={() => {
                                      setQuery(recent);
                                      setTimeout(() => inputRef.current?.focus(), 50);
                                    }}
                                    className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer text-white/60 text-sm group"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    <span className="group-hover:text-white">{recent}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-white/30 text-xs italic px-2 py-4">No recent searches</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                , document.body)}
              </div>

              {/* Auth Section (Desktop only) */}
              {!loading && !user && (
                <Button 
                  onClick={() => navigate("/auth")} 
                  className="hidden sm:flex rounded-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
              
              {!loading && user && (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    ref={userButtonRef}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' && userMenuOpen) {
                        setUserMenuOpen(false);
                        setFocusedMenuIndex(0);
                      } else if (e.key === 'ArrowDown' && userMenuOpen) {
                        e.preventDefault();
                        setFocusedMenuIndex(0);
                        const firstItem = userMenuRef.current?.querySelector('[data-menu-item="0"]') as HTMLElement;
                        firstItem?.focus();
                      }
                    }}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    aria-label="User account menu"
                    className="flex items-center gap-2 group relative p-1 rounded-full hover:bg-accent/50 transition-all duration-200"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-lg group-hover:scale-110 transition-all duration-200 ring-2 ring-primary/20 group-hover:ring-primary/40">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    
                    <ChevronDown className={`w-4 h-4 text-foreground/70 transition-transform duration-300 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-popover/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                        <p className="text-sm font-medium text-foreground">Signed in as</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            navigate("/account");
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent/50 transition-all duration-200 group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                            <Settings className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Account Settings</p>
                            <p className="text-xs text-muted-foreground">Manage your profile</p>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            navigate("/watchlist");
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent/50 transition-all duration-200 group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-200">
                            <BookmarkPlus className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">My Watchlist</p>
                            <p className="text-xs text-muted-foreground">Saved movies & shows</p>
                          </div>
                        </button>

                        <div className="my-2 border-t border-border/50" />

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut();
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-destructive/10 transition-all duration-200 group text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors duration-200">
                            <LogOut className="w-4 h-4 text-destructive" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-destructive">Sign Out</p>
                            <p className="text-xs text-muted-foreground">Log out of your account</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Loading State */}
              {loading && (
                <div className="hidden md:block w-9 h-9 rounded-full bg-muted animate-pulse" />
              )}
            </div>
        </nav>
      </div>

      {/* Fixed Bottom Tab Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 animate-fade-in pb-safe">
        <div className="bg-black/90 backdrop-blur-3xl border-t border-white/10 px-2 py-2 flex items-center justify-between overflow-hidden relative">
          {/* Animated glow matching active tab */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            {mobileNavLinks.map((link, idx) => (
               location.pathname === link.path && (
                 <div key={link.path} className="absolute w-1/5 h-full bg-primary blur-[20px] transition-all duration-500" style={{ left: `${(idx / 5) * 100}%` }} />
               )
            ))}
            {(location.pathname === '/account' || location.pathname === '/auth') && (
               <div className="absolute w-1/5 h-full bg-primary blur-[20px] transition-all duration-500" style={{ left: `80%` }} />
            )}
          </div>

          {mobileNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-1 relative z-10 group"
              >
                <div className={`relative flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <Icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-200'}`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
          
          <Link
            to={user ? "/account" : "/auth"}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-1 relative z-10 group"
          >
            <div className={`relative flex items-center justify-center transition-transform duration-300 ${location.pathname === '/account' || location.pathname === '/auth' ? 'scale-110' : 'group-hover:scale-110'}`}>
              {user ? (
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md transition-colors ${location.pathname === '/account' ? 'bg-primary text-white border-2 border-primary/50' : 'bg-gray-700 text-gray-300 border border-gray-500 group-hover:bg-gray-600'}`}>
                   {user.email?.[0].toUpperCase()}
                 </div>
              ) : (
                 <User className={`w-6 h-6 transition-colors duration-300 ${location.pathname === '/auth' ? 'text-primary' : 'text-gray-400 group-hover:text-gray-200'}`} />
              )}
            </div>
            <span className={`text-[10px] font-medium transition-colors duration-300 ${location.pathname === '/account' || location.pathname === '/auth' ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
              {user ? 'Profile' : 'Sign In'}
            </span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;

// side-effects
// fetch suggestions with debounce and close on outside click
function useNavbarEffects(
  query: string, 
  setSuggestions: (v: any[]) => void, 
  setOpen: (v: boolean) => void, 
  boxRef: React.RefObject<HTMLDivElement>, 
  setActiveIndex: (fn: (i: number) => number) => void,
  setSearchExpanded: (v: boolean) => void,
  setQuery: (v: string) => void,
  searchFilter: 'multi' | 'movie' | 'tv'
) {
  useEffect(() => {
    const ctrl = new AbortController();
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    // Validate query before making API call
    const validationResult = searchQuerySchema.safeParse(query);
    if (!validationResult.success) {
      setSuggestions([]);
      return;
    }
    
    const t = setTimeout(async () => {
      try {
        let res;
        if (searchFilter === 'movie') res = await tmdb.movies.search(validationResult.data, 1);
        else if (searchFilter === 'tv') res = await tmdb.tv.search(validationResult.data, 1);
        else res = await tmdb.multi.search(validationResult.data, 1);

        let filtered = res.results;
        if (searchFilter === 'multi') {
          filtered = filtered.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv');
        }
        setSuggestions(filtered.slice(0, 8));
        setActiveIndex(() => -1);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [query, setSuggestions, setActiveIndex, searchFilter]);

}
