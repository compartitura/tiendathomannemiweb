// components/ui/Layout.jsx
import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}