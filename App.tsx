
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import LoginScreen from './components/screens/LoginScreen';
import SignupScreen from './components/screens/SignupScreen';
import ChatScreen from './components/screens/ChatScreen';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { currentUser } = useAuth();
  const [showLogin, setShowLogin] = React.useState(true);

  if (!currentUser) {
    return showLogin ? (
      <LoginScreen onSwitchToSignup={() => setShowLogin(false)} />
    ) : (
      <SignupScreen onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  return (
    <ChatProvider>
      <ChatScreen />
    </ChatProvider>
  );
};

export default App;
