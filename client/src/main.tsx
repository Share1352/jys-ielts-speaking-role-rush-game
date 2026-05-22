import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useSocket } from './lib/socket.js';
import { TeacherPage } from './pages/TeacherPage.js';
import { StudentPage } from './pages/StudentPage.js';
import { ViewerPage } from './pages/ViewerPage.js';

function randomCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function randomToken() {
  return Math.random().toString(36).slice(2, 14);
}

function LandingPage() {
  const [roomCode, setRoomCode] = useState(randomCode());
  const [hostToken, setHostToken] = useState(randomToken());

  const links = useMemo(() => {
    const cleanRoom = roomCode.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase();
    const encodedToken = encodeURIComponent(hostToken.trim());
    return {
      roomCode: cleanRoom,
      teacher: `/teacher/${cleanRoom}?host=${encodedToken}`,
      student: `/join/${cleanRoom}`,
      viewer: `/viewer/${cleanRoom}`
    };
  }, [roomCode, hostToken]);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}>
      <h1>JYS IELTS Speaking Role Rush</h1>
      <p>Host setup page for teachers. Generate one room, share the student and viewer links, then open the teacher link to run the full game.</p>

      <section>
        <h2>1) Prepare room details</h2>
        <label>
          Room code
          <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 12 }} />
        </label>
        <label>
          Host token (keep private)
          <input value={hostToken} onChange={(e) => setHostToken(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, marginBottom: 12 }} />
        </label>
      </section>

      <section>
        <h2>2) Open and share links</h2>
        <ul>
          <li><strong>Teacher (private):</strong> <a href={links.teacher}>{links.teacher}</a></li>
          <li><strong>Student (share):</strong> <a href={links.student}>{links.student}</a></li>
          <li><strong>Viewer (screen share):</strong> <a href={links.viewer}>{links.viewer}</a></li>
        </ul>
      </section>

      <section>
        <h2>3) Host flow checklist</h2>
        <ol>
          <li>Students join with names from the student link.</li>
          <li>Open the viewer link on your shared screen.</li>
          <li>Start round, run prep, speaker turns, guessing, reveal, and scoring from the teacher dashboard.</li>
        </ol>
      </section>
    </main>
  );
}

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

  return <LandingPage />;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
