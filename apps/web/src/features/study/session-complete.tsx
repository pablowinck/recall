import { Button } from '@radix-ui/themes';
import { ArrowRight, Check } from 'lucide-react';
import type { StudySessionState } from './use-study-session';

/** Encerra um lote sem avaliar cartões futuros. Exemplo: <SessionComplete session={session} exit={exit} />. */
export function SessionComplete({
  session,
  exit,
}: {
  session: StudySessionState;
  exit: () => void;
}): React.JSX.Element {
  return (
    <div className="session-complete view-enter">
      <span className="complete-mark">
        <Check size={35} strokeWidth={1.7} />
      </span>
      <span className="eyebrow">UM PASSO A MAIS</span>
      <h1>{session.completed ? 'Bom trabalho.' : 'Tudo em dia.'}</h1>
      <CompletionMessage completed={session.completed} />
      <Button size="3" onClick={() => void session.reload()}>
        Ver próximas revisões
        <ArrowRight size={17} />
      </Button>
      <button className="text-button" onClick={exit}>
        Voltar para hoje
      </button>
    </div>
  );
}

function CompletionMessage({ completed }: { completed: number }): React.JSX.Element {
  const message = completed
    ? `Você revisou ${completed} cartões nesta sessão.`
    : 'Nenhum cartão precisa de revisão neste momento.';
  return (
    <p>
      {message}
      <br />
      Cada encontro torna a lembrança um pouco mais forte.
    </p>
  );
}
