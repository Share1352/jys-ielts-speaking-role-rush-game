import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { AnyPayload } from './types.js';

export function useSocket() {
  const [socket] = useState<Socket>(() => io('/', { transports: ['websocket'] }));
  useEffect(() => { return () => { socket.close(); }; }, [socket]);
  return socket;
}

export function call(socket: Socket, event: string, payload: object) {
  return new Promise<void>((resolve, reject) => {
    socket.emit(event, payload, (ack: { ok: boolean; error?: string }) => {
      if (ack?.ok) resolve();
      else reject(new Error(ack?.error || 'Action failed'));
    });
  });
}

export function callWithAck<T>(socket: Socket, event: string, payload: object) {
  return new Promise<T>((resolve, reject) => {
    socket.emit(event, payload, (ack: { ok: boolean; error?: string } & T) => {
      if (ack?.ok) resolve(ack);
      else reject(new Error(ack?.error || 'Action failed'));
    });
  });
}

export function useRoomState(socket: Socket) {
  const [payload, setPayload] = useState<AnyPayload | null>(null);
  useEffect(() => {
    const onState = (next: AnyPayload) => setPayload(next);
    socket.on('room:state', onState);
    return () => { socket.off('room:state', onState); };
  }, [socket]);
  return [payload, setPayload] as const;
}
