
import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 py-6 border-t dark:border-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} SynkNode. All rights reserved.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            GitHub
          </a>
          <a 
            href="/privacy" 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Privacy
          </a>
          <a 
            href="/terms" 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
};
