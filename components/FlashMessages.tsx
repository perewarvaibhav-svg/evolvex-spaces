'use client';
import { useState, useEffect } from 'react';

export default function FlashMessages({ messages: initialMessages }: { messages: { cat: string, msg: string }[] }) {
  const [messages, setMessages] = useState(initialMessages);

  // Read URL params for any client side flash overrides (like error=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === '1') {
      setMessages(prev => [...prev, { cat: 'danger', msg: 'Invalid email or password.' }]);
      // remove param from URL without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (!messages || messages.length === 0) return null;

  return (
    <div className="flash-wrap">
      {messages.map((m, i) => (
        <div key={i} className={`flash ${m.cat}`}>{m.msg}</div>
      ))}
    </div>
  );
}
