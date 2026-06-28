import { Film } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const Footer = () => {
  const quickLinks = ["About", "Privacy", "Contact", "Terms"];
  const communityLinks = ["Forums", "Top Reviewers", "Discussions"];

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
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your daily dose of cinematic magic. Discover, track, and share your passion.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm text-white uppercase tracking-wider">Community</h3>
            <ul className="space-y-3">
              {communityLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm text-white uppercase tracking-wider">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get informed about new releases and trending content
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-primary focus-visible:border-primary"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 transition-colors">
                →
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Cinephile. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
