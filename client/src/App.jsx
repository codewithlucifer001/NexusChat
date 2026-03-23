import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChatProvider, useChat } from './context/ChatContext';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <ChatProvider>
        <AppRoutes />
      </ChatProvider>
    </Router>
  );
}

function AppRoutes() {
  const { user } = useChat();

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/chat"
        element={user ? <ChatPage /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} /> {/* Catch-all for unknown routes */}
    </Routes>
  )
}

export default App
