
import { Button } from "@/components/ui/button";
import { Baby, Menu, CreditCard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthDialog from "@/components/auth/AuthDialog";
import UserMenu from "@/components/auth/UserMenu";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (section: string) => {
    if (location.pathname === '/') {
      // If we're on the home page, just scroll to the section
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're on a different page, navigate to home page with hash
      navigate(`/#${section}`);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Baby className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">NameMe</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => handleNavigation('features')} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => handleNavigation('pricing')} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => handleNavigation('about')} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {!loading && (
              <>
                {user && profile ? (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{profile.credits} Credits</span>
                    </div>
                    <UserMenu />
                  </>
                ) : (
                  <>
                    <AuthDialog>
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </AuthDialog>
                    <AuthDialog>
                      <Button size="sm" className="gradient-primary text-white">
                        Get Started
                      </Button>
                    </AuthDialog>
                  </>
                )}
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="space-y-4">
              <button 
                onClick={() => handleNavigation('features')} 
                className="block text-muted-foreground hover:text-primary transition-colors w-full text-left"
              >
                Features
              </button>
              <button 
                onClick={() => handleNavigation('pricing')} 
                className="block text-muted-foreground hover:text-primary transition-colors w-full text-left"
              >
                Pricing
              </button>
              <button 
                onClick={() => handleNavigation('about')} 
                className="block text-muted-foreground hover:text-primary transition-colors w-full text-left"
              >
                About
              </button>
              <div className="pt-4 space-y-2">
                {!loading && (
                  <>
                    {user && profile ? (
                      <UserMenu />
                    ) : (
                      <>
                        <AuthDialog>
                          <Button variant="outline" size="sm" className="w-full">
                            Sign In
                          </Button>
                        </AuthDialog>
                        <AuthDialog>
                          <Button size="sm" className="w-full gradient-primary text-white">
                            Get Started
                          </Button>
                        </AuthDialog>
                      </>
                    )}
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
