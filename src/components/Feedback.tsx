import { useEffect, useRef, type ReactNode } from 'react';
import { Markdown } from './Markdown';

const PRAISE = ['Nice!', 'Correct!', 'Spot on!', 'Great work!', 'Nailed it!', 'Exactly right!'];

/** The bar that slides up after answering, with the explanation and a Continue button. */
export function Feedback({ good, explain, onContinue, extra }: { good: boolean; explain?: string; onContinue: () => void; extra?: ReactNode }) {
  const button = useRef<HTMLButtonElement>(null);
  const title = useRef(good ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : 'Not quite');
  useEffect(() => {
    button.current?.focus();
  }, []);
  return (
    <>
      <div className="feedback-spacer" />
      <div className={`feedback ${good ? 'good' : 'bad'}`} role="status">
        <div className="feedback-inner">
          <div className="feedback-body">
            <h3>{good ? '✓ ' : '✗ '}{title.current}</h3>
            {explain && <Markdown md={explain} />}
            {extra}
          </div>
          <button ref={button} className="btn btn-primary btn-lg" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </>
  );
}
