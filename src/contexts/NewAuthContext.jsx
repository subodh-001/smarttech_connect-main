import React from 'react';
import { MongoAuthProvider, useAuth as useMongoAuth } from './MongoAuthContext';

// This is a wrapper component that provides backward compatibility
// with existing code that uses AuthContext while using the new MongoDB-based auth

// Re-export the useAuth hook from MongoAuthContext
export const useAuth = useMongoAuth;

// Wrap the MongoAuthProvider to maintain compatibility
export const AuthProvider = ({ children }) => {
  return <MongoAuthProvider>{children}</MongoAuthProvider>;
};