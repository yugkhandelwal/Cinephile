import { Film, Github, Twitter, Instagram } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Link } from "react-router-dom";
import { toast } from "@/shared/hooks/use-toast";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Movies", href: "/movies" },
    { label: "TV Shows", href: "/tv-shows" },
    { label: "Search", href: "/search" },
    { label: "My Watchlist", href: "/watchlist" }
  ];

  const socialLinks = [
    { label: "GitHub", icon: Github, href: "https://github.com" },
    { label: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { label: "Instagram", icon: Instagram, href: "https://instagram.com" }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    toast({
      title: "Subscribed!",
      description: "You've successfully subscribed to our newsletter.",
    });
    setEmail("");
  };

  return (
    <footer className="border-t border-white/5 bg-transparent mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Film className="w-6 h-6" />
              </div>
              <span className="text-2xl font-heading font-bold text-white tracking-tight">Cinephile</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Your daily dose of cinematic magic. Discover, track, and share your passion.
            </p>
            <div className="flex items-center gap-3 text-muted-foreground">
              {socialLinks.map((social) => (
                <a 
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm text-white uppercase tracking-wider">Explore</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm text-white uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-white transition-colors">
                  Cookie Preferences
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm text-white uppercase tracking-wider">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get informed about new releases and trending content
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input 
                type="email"
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary focus-visible:border-primary"
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 transition-colors">
                →
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <span className="text-red-500">❤️</span> and TMDB
          </p>
          <div className="flex gap-4">
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Cinephile. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
