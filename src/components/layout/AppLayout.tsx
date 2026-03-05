import { ReactNode } from "react";
import { Moon, Sun, Search } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import AppSidebar from "@/components/layout/AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

const AppLayout = ({ children, title }: AppLayoutProps) => {
  const { isDark, toggleTheme, user } = useAppStore();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-border/50 glass-card-strong flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 hover:bg-secondary transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <NotificationPanel />
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/50">
              <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                {user?.name?.charAt(0) || "A"}
              </div>
            </div>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
