import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useSocket } from './lib/socket.js';
import { TeacherPage } from './pages/TeacherPage.js';
import { StudentPage } from './pages/StudentPage.js';
import { ViewerPage } from './pages/ViewerPage.js';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

function randomCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function randomToken() {
  return Math.random().toString(36).slice(2, 14);
}

function LandingPage() {
  const [roomCode, setRoomCode] = useState(randomCode());
  const [hostToken, setHostToken] = useState(randomToken());
  const [copiedKey, setCopiedKey] = useState<null | 'teacher' | 'student' | 'viewer'>(null);

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

  const copyLink = async (key: 'teacher' | 'student' | 'viewer', value: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${value}`);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1400);
    } catch {
      setCopiedKey(null);
    }
  };

  return (
    <main className='app-shell stack-md'>
      <header className='card app-header landing-header'>
        <h1>JYS IELTS Speaking Role Rush</h1>
        <p>Set up one room, protect the host link, and share class links for synchronized speaking gameplay.</p>
      </header>

      <section className='dashboard-columns'>
        <article className='card stack-md'>
          <div>
            <h2>Room setup</h2>
            <p className='microcopy'>Use short room codes and keep the host token private to control the teacher dashboard.</p>
          </div>
          <label>
            Room code
            <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} className='input' />
          </label>
          <label>
            Host token (keep private)
            <input value={hostToken} onChange={(e) => setHostToken(e.target.value)} className='input' />
          </label>
          <div className='status-pill'>Active room code: {links.roomCode || 'EMPTY'}</div>
        </article>

        <article className='card stack-md'>
          <div>
            <h2>Share links</h2>
            <p className='microcopy'>Open host privately. Share student + viewer links with class participants.</p>
          </div>

          <div className='link-card link-card--private stack-sm'>
            <strong>Private host link</strong>
            <a href={links.teacher}>{links.teacher}</a>
            <button className='btn btn--ghost' onClick={() => copyLink('teacher', links.teacher)} type='button'>
              {copiedKey === 'teacher' ? 'Copied' : 'Copy host link'}
            </button>
          </div>

          <div className='link-card link-card--share stack-sm'>
            <strong>Share with class: student link</strong>
            <a href={links.student}>{links.student}</a>
            <button className='btn btn--ghost' onClick={() => copyLink('student', links.student)} type='button'>
              {copiedKey === 'student' ? 'Copied' : 'Copy student link'}
            </button>
          </div>

          <div className='link-card link-card--share stack-sm'>
            <strong>Share with class: viewer link</strong>
            <a href={links.viewer}>{links.viewer}</a>
            <button className='btn btn--ghost' onClick={() => copyLink('viewer', links.viewer)} type='button'>
              {copiedKey === 'viewer' ? 'Copied' : 'Copy viewer link'}
            </button>
          </div>
        </article>
      </section>

      <section className='panel stack-sm'>
        <h2>Host checklist</h2>
        <p className='microcopy'>Use this quick flow before each game round.</p>
        <ol>
          <li>Share the student link for join names.</li>
          <li>Open viewer link on your shared meeting screen.</li>
          <li>Open private host link and run prep, speaker turns, reveal, and scoring.</li>
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
