import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

export function NavBar() {
  const location = useLocation();

  return (
    <nav className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="container mx-auto flex items-center px-4">
        <div className="flex space-x-4">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-2 p-4 hover:bg-gray-100 dark:hover:bg-gray-700',
              location.pathname === '/' && 'border-b-2 border-blue-500'
            )}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Chat</span>
          </Link>
          <Link
            to="/admin"
            className={cn(
              'flex items-center gap-2 p-4 hover:bg-gray-100 dark:hover:bg-gray-700',
              location.pathname === '/admin' && 'border-b-2 border-blue-500'
            )}
          >
            <Settings className="h-5 w-5" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}