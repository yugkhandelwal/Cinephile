import { Film } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const Footer = () => {
  const quickLinks = ["About", "Privacy", "Contact", "Terms"];
  const communityLinks = ["Forums", "Top Reviewers", "Discussions"];

  return (
    <footer className="border-t border-border bg-card/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-2 rounded-lg">
                <Film className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Cinephile</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your daily dose of cinematic magic. Discover, track, and share your passion.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Community</h3>
            <ul className="space-y-2">
              {communityLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Get informed about new releases and trending content
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-background border-border"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                →
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Cinephile. Built for movie, TV, and anime lovers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
