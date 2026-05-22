import React from 'react';
import { createRoot } from 'react-dom/client';
import { useSocket } from './lib/socket.js';
import { TeacherPage } from './pages/TeacherPage.js';
import { StudentPage } from './pages/StudentPage.js';
import { ViewerPage } from './pages/ViewerPage.js';

function App() {
  const socket = useSocket();
  const { pathname, search } = window.location;

  if (pathname.startsWith('/teacher/')) {
    const roomCode = pathname.split('/')[2] || '';
    const hostToken = new URLSearchParams(search).get('host') || '';
    return <TeacherPage socket={socket} roomCode={roomCode.toUpperCase()} hostToken={hostToken} />;
  }
  if (pathname.startsWith('/join/')) {
    const roomCode = pathname.split('/')[2] || '';
    return <StudentPage socket={socket} roomCode={roomCode.toUpperCase()} />;
  }
  if (pathname.startsWith('/viewer/')) {
    const roomCode = pathname.split('/')[2] || '';
    return <ViewerPage socket={socket} roomCode={roomCode.toUpperCase()} />;
  }

  return <main><h1>JYS IELTS Speaking Role Rush</h1><p>Use /teacher/:roomCode?host=:hostToken, /join/:roomCode, or /viewer/:roomCode.</p></main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
