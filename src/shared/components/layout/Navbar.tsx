import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Film, Search, X, User, LogOut, Settings, Heart, BookmarkPlus, ChevronDown } from "lucide-react";

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
  
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Movies", path: "/movies" },
    { name: "TV Shows", path: "/tv-shows" },
    { name: "My Watchlist", path: "/watchlist" },
  ];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="w-full max-w-6xl bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40 rounded-full px-6 py-2 md:px-8 md:py-2.5 relative pointer-events-auto transition-all duration-300">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground rounded px-3 py-1">Skip to content</a>
        <div className="flex items-center justify-between relative z-10">
          {/* Modern Logo with Magnetic Effect */}
          <Link to="/" className="flex items-center gap-2 group relative">
            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-2.5 rounded-xl group-hover:rounded-2xl group-hover:shadow-lg group-hover:shadow-primary/50 group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Film className="w-6 h-6 text-primary-foreground relative z-10" />
            </div>
            <span className="text-2xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">
              Cinephile
            </span>
          </Link>

          {/* Modern Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative group py-2"
              >
                <span className={`text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-foreground/70 group-hover:text-foreground"
                }`}>
                  {link.name}
                </span>
                
                {/* Animated underline */}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full transition-all duration-300 ${
                  location.pathname === link.path 
                    ? "w-full" 
                    : "w-0 group-hover:w-full"
                }`} />
                
                {/* Hover glow effect */}
                <span className="absolute -inset-2 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Animated Search Button/Bar */}
            <div className="hidden md:block relative">
              {/* Search Button (collapsed state) */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full opacity-0 group-hover:opacity-100 blur transition-all duration-300" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchExpanded(true);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                  className="relative rounded-full hover:bg-primary/10 hover:scale-110 transition-all duration-300"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>

              {/* Search Modal Overlay */}
              {searchExpanded && createPortal(
                <div 
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
                              navigate(`/title/${it.title ? 'movie' : 'tv'}/${it.id}`);
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
                                  focus:outline-none focus:border-white/30 focus:bg-[#111] text-white
                                  placeholder:text-white/40 transition-all duration-200"
                      />
                      <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    </div>

                    {/* Suggestions / Recent Dropdown container */}
                    <div className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden mt-1 flex flex-col min-h-[100px]">
                      {open && suggestions.length > 0 ? (
                        <div className="max-h-[50vh] overflow-y-auto py-2">
                          {suggestions.map((s, idx) => (
                            <button
                              key={s.id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                saveRecentSearch(toTitle(s));
                                navigate(`/title/${s.title ? 'movie' : 'tv'}/${s.id}`);
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

            {/* Auth Section */}
            {!loading && !user && (
              // Login Button (when not logged in)
              <Button 
                onClick={() => navigate("/auth")} 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-full px-6 py-2 font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Sign In
                </span>
              </Button>
            )}
            
            {!loading && user && (
              // User Menu Dropdown (when logged in)
              <div className="relative" ref={userMenuRef}>
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
                  className="flex items-center gap-2 group relative p-1 rounded-full hover:bg-accent/50 transition-all duration-200"
                >
                  {/* User Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-lg group-hover:scale-110 transition-all duration-200 ring-2 ring-primary/20 group-hover:ring-primary/40">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  
                  {/* Chevron Icon */}
                  <ChevronDown className={`w-4 h-4 text-foreground/70 transition-transform duration-300 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-popover/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                      <p className="text-sm font-medium text-foreground">Signed in as</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Account Settings */}
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

                      {/* My Watchlist */}
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



                      {/* Divider */}
                      <div className="my-2 border-t border-border/50" />

                      {/* Sign Out */}
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
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            )}
          </div>
          </div>
      </nav>
    </div>
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
