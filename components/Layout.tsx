
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Jungle Storybook Background */}
      <div className="jungle-bg"></div>
      
      {/* The Moon */}
      <div className="moon floating-slow"></div>
      
      {/* Tree Silhouettes */}
      <svg className="tree-silhouette left-[-10%] w-[40%] h-auto opacity-80" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 400 L70 300 Q80 250 50 150 Q20 50 60 0 L100 0 Q140 50 110 150 Q80 250 90 300 L110 400 Z" />
        <path d="M10 400 L30 350 Q40 320 20 280 Q0 240 30 200 L50 200 Q70 240 40 280 Q20 320 30 350 L50 400 Z" opacity="0.6" />
      </svg>
      
      <svg className="tree-silhouette right-[-5%] w-[35%] h-auto opacity-80 scale-x-[-1]" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 400 L70 300 Q80 250 50 150 Q20 50 60 0 L100 0 Q140 50 110 150 Q80 250 90 300 L110 400 Z" />
      </svg>

      {/* Atmospheric Leaves/Motes */}
      <div className="fixed top-1/4 left-[10%] text-4xl opacity-20 floating-slow" style={{ animationDelay: '1s' }}>🍃</div>
      <div className="fixed top-1/2 right-[15%] text-3xl opacity-20 floating-slow" style={{ animationDelay: '4s' }}>🍃</div>
      <div className="fixed bottom-1/4 left-[20%] text-2xl opacity-10 floating-slow" style={{ animationDelay: '7s' }}>✨</div>
      
      <main className="relative z-10 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;
