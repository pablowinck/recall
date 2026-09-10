import { Button, Progress } from '@radix-ui/themes';
import { ArrowLeft, CornerDownLeft } from 'lucide-react';
import type { StudyCard } from '@recall/contracts';
import type { StudySessionState } from './use-study-session';
import { RatingControls } from './rating-controls';

/** Contextualiza o progresso da sessão atual. Exemplo: <StudyProgress session={session} exit={exit} />. */
export function StudyProgress({
  session,
  exit,
}: {
  session: StudySessionState;
  exit: () => void;
}): React.JSX.Element {
  const total = session.completed + session.queue.length;
  return (
    <>
      <header className="study-header">
        <button className="text-button" onClick={exit}>
          <ArrowLeft size={17} />
          Sair da sessão
        </button>
        <span>
          {session.completed} de {total} revisados
        </span>
      </header>
      <Progress
        aria-label="Progresso da sessão"
        value={total ? (session.completed / total) * 100 : 0}
        size="1"
      />
    </>
  );
}

/** Renderiza texto sem executar HTML de cartões. Exemplo: <ReviewContent current={card} revealed />. */
export function ReviewContent({
  current,
  revealed,
}: {
  current?: StudyCard;
  revealed: boolean;
}): React.JSX.Element | null {
  if (!current) return null;
  return (
    <>
      <div className="study-context">
        <span className="eyebrow">LEMBRE ANTES DE REVELAR</span>
        <span>{current.card.tags[1] ?? 'Seu aprendizado'}</span>
      </div>
      <article className={`review-card ${revealed ? 'is-revealed' : ''}`}>
        <span className="eyebrow">FRENTE</span>
        <h1>{current.card.front}</h1>
        {revealed && (
          <div className="review-answer" aria-live="polite">
            <span className="eyebrow">RESPOSTA</span>
            <div>{current.card.back}</div>
          </div>
        )}
      </article>
    </>
  );
}

/** Habilita avaliação só depois de revelar. Exemplo: <StudyActions session={session} />. */
export function StudyActions({ session }: { session: StudySessionState }): React.JSX.Element {
  if (session.revealed) return <RatingControls session={session} />;
  return (
    <div className="reveal-action">
      <Button size="4" onClick={session.reveal}>
        Mostrar resposta <CornerDownLeft size={19} />
      </Button>
      <span>Espaço para revelar</span>
    </div>
  );
}
