import { Settings, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-surface-1">
      <div className="flex h-14 items-center px-4">
        <span className="text-lg font-semibold text-text-primary">Agentis Hub</span>
      </div>
      <nav className="flex-1 px-2 py-4" aria-label="Main navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium
                    focus-visible:shadow-focus focus-visible:outline-none
                    ${isActive
                      ? 'bg-surface-3 text-text-primary'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                    }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
