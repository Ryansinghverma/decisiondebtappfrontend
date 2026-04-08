import { Link, useLocation } from 'react-router';
import { LayoutDashboard, FileText, LineChart, User, Plus } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Decisions', href: '/decisions/new', icon: FileText },
  { name: 'Insights', href: '/insights', icon: LineChart },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen border-r border-border bg-gradient-to-b from-white to-gray-50 flex flex-col shadow-sm">
      <div className="p-6 border-b border-border bg-white">
        <h1 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Decision Debt Tracker
        </h1>
        <p className="text-muted-foreground mt-1">Track & Improve</p>
      </div>
      
      {/* Quick Add Button */}
      <div className="p-4 border-b border-border bg-white">
        <Link
          to="/decisions/new"
          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Decision</span>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-200'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={isActive ? 'font-medium' : ''}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-white">
        <div className="text-center text-muted-foreground">
          <p className="mb-1">Today</p>
          <p className="font-semibold text-foreground">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
    </aside>
  );
}