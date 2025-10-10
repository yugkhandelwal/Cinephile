import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Film, Search, X, User, LogOut, Settings, Heart, BookmarkPlus, ChevronDown } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { useAuth } from "@/context/AuthProvider";
import { useEffect, useMemo, useRef, useState } from "react";
import { tmdb, toPoster, toTitle, toYear } from "@/shared/api/tmdb/client";
import { searchQuerySchema } from "@/shared/lib/validation";
import { TmdbSearchResult } from "@/shared/api/tmdb/types";
import { validateSearchQuery } from "@/shared/lib/inputSanitization";

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
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const userButtonRef = useRef<HTMLButtonElement | null>(null);
  const { user, loading, signOut } = useAuth();
  
  // Validate and sanitize query (preserve spaces for display)
  const sanitizedQuery = useMemo(() => {
    const validation = validateSearchQuery(query, { preserveSpaces: true });
    return validation.sanitized;
  }, [query]);
  // wire side effects for autosuggest
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useNavbarEffects(query, setSuggestions, setOpen, boxRef, (fn) => setActiveIndex((i) => fn(i)), setSearchExpanded, setQuery);
  
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
  { name: "Recommendations", path: "/recommendations" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50" />
      
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground rounded px-3 py-1">Skip to content</a>
      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Modern Logo with Magnetic Effect */}
          <Link to="/" className="flex items-center gap-2 group relative">
            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-2.5 rounded-xl group-hover:rounded-2xl group-hover:shadow-lg group-hover:shadow-primary/50 group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Film className="w-6 h-6 text-primary-foreground relative z-10" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">
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
            <div className="hidden md:block relative" ref={boxRef}>
              {!searchExpanded ? (
                // Search Button (collapsed state) - Enhanced with glow effect
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
              ) : (
                // Search Bar (expanded state)
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (sanitizedQuery.trim()) {
                      navigate(`/search?q=${encodeURIComponent(sanitizedQuery)}`);
                      setOpen(false);
                      setSearchExpanded(false);
                      setQuery("");
                    }
                  }}
                  className="relative animate-in slide-in-from-right duration-300"
                >
                  <div className="relative">
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        // Preserve spaces during typing for better UX
                        const validation = validateSearchQuery(rawValue, { preserveSpaces: true });
                        
                        // Always update with sanitized value
                        if (validation.isValid || rawValue === '') {
                          setQuery(validation.sanitized);
                          setOpen(validation.sanitized.trim().length >= 2);
                        } else if (validation.error) {
                          // For suspicious input, just clear it
                          console.warn('Invalid search input detected:', validation.error);
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
                      placeholder="Search movies, shows…"
                      className="h-10 w-64 rounded-3xl border-2 border-border/50 bg-background/50 backdrop-blur-sm px-12 text-sm 
                                focus:outline-none focus:border-primary/50 focus:bg-background focus:rounded-2xl
                                transition-all duration-300 ease-out
                                placeholder:text-muted-foreground/50"
                    />
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-300" />
                    
                    {/* Close button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchExpanded(false);
                        setQuery("");
                        setOpen(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Suggestions Dropdown */}
                  {open && suggestions.length > 0 && (
                    <div className="absolute z-50 mt-3 w-[24rem] max-h-96 overflow-auto rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl shadow-2xl shadow-primary/10 animate-in fade-in slide-in-from-top-2 duration-200">
                      {suggestions.map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            navigate(`/title/${s.title ? 'movie' : 'tv'}/${s.id}`);
                            setOpen(false);
                            setSearchExpanded(false);
                            setQuery("");
                          }}
                          className={`w-full text-left px-4 py-3 flex items-center gap-4 transition-all duration-200 group
                                      ${idx === activeIndex ? 'bg-primary/10 scale-[0.98]' : 'hover:bg-accent/50 hover:scale-[0.99]'}
                                      ${idx === 0 ? 'rounded-t-xl' : ''}
                                      ${idx === suggestions.length - 1 ? 'rounded-b-xl' : ''}
                                      border-b border-border/20 last:border-0`}
                        >
                          <div className="relative flex-shrink-0 overflow-hidden rounded-lg group-hover:shadow-lg transition-shadow duration-200">
                            <img 
                              src={toPoster(s.poster_path)} 
                              loading="lazy" 
                              decoding="async" 
                              className="w-10 h-14 object-cover group-hover:scale-110 transition-transform duration-300" 
                              alt={toTitle(s)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors duration-200">
                              {toTitle(s)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span>{toYear(s)}</span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                s.title ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                              }`}>
                                {s.title ? 'Movie' : 'TV'}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              )}
            </div>
            <ThemeToggle />
            
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

                      {/* My Favorites */}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate("/recommendations");
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent/50 transition-all duration-200 group text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors duration-200">
                          <Heart className="w-4 h-4 text-pink-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Recommendations</p>
                          <p className="text-xs text-muted-foreground">Personalized picks</p>
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
      </div>
    </nav>
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
  setQuery: (v: string) => void
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
        const res = await tmdb.multi.search(validationResult.data, 1);
        const filtered = res.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 8);
        setSuggestions(filtered);
        setActiveIndex(() => -1);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [query, setSuggestions, setActiveIndex]);

  // Close search bar and dropdown when clicking outside
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const el = boxRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        setOpen(false);
        setSearchExpanded(false);
        setQuery("");
      }
    }
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [boxRef, setOpen, setSearchExpanded, setQuery]);
}
