import { Link, useLocation } from "wouter";
import { Home, Trophy, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

export function Navigation() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    {
      path: "/",
      icon: Home,
      label: t("nav.home"),
      exact: true,
    },
    {
      path: "/ranking",
      icon: Trophy,
      label: t("nav.ranking"),
      exact: false,
    },
    {
      path: "/gems",
      icon: Gem,
      label: t("nav.gems"),
      exact: false,
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-8">
          {navItems.map(({ path, icon: Icon, label, exact }) => {
            const isActive = exact ? location === path : location.startsWith(path);
            
            return (
              <Link
                key={path}
                href={path}
                className={cn(
                  "flex items-center space-x-2 py-4 px-3 border-b-2 transition-colors duration-200",
                  isActive
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-gray-600 hover:text-primary hover:border-primary/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}