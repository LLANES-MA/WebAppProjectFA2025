import React from 'react';

export default function TestComponent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">FrontDash Test</h1>
        <p className="text-muted-foreground">If you can see this, React is working correctly.</p>
        <div className="w-16 h-16 bg-primary rounded-full mx-auto"></div>
      </div>
    </div>
  );
}