import React from 'react';
import { HeartIcon } from './';

export const LoadingSpinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text-main">
    <HeartIcon className="animate-pulse-heart text-accent" filled />
    <p className="mt-4 text-lg opacity-70">Загрузка...</p>
  </div>
);