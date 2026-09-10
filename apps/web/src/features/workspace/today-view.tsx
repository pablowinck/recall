import { Button } from '@radix-ui/themes';
import { ArrowRight, BookOpen, Check, Flame, Layers2, Plus } from 'lucide-react';
import type { Workspace } from '@recall/contracts';

interface TodayProps {
  workspace: Workspace;
  study: (deck?: string) => void;
  create: () => void;
  browse: () => void;
}

/** Prioriza a próxima ação de estudo. Exemplo: <TodayView {...props} />. */
export function TodayView(props: TodayProps): React.JSX.Element {
  const { stats, decks } = props.workspace;
  return (
    <div className="view-enter">
      <header className="page-header">
        <div>
          <span className="eyebrow">UM POUCO, TODOS OS DIAS</span>
          <h1>
            Hoje é um bom dia
            <br className="mobile-break" /> para lembrar.
          </h1>
          <p>Seu aprendizado continua daqui.</p>
        </div>
        <Button variant="soft" onClick={props.create}>
          <Plus size={17} />
          Novo cartão
        </Button>
      </header>
      <StudyInvitation stats={stats} study={() => props.study()} create={props.create} />
      <div className="stats-grid">
        <StatCard icon={<Check size={19} />} value={stats.reviewed_today} label="revisões hoje" />
        <StatCard icon={<Layers2 size={19} />} value={stats.total} label="cartões na biblioteca" />
        <StatCard
          icon={<Flame size={19} />}
          value={stats.streak}
          label={stats.streak === 1 ? 'dia de sequência' : 'dias de sequência'}
        />
      </div>
      <section className="decks-section">
        <div className="section-heading">
          <h2>Seus baralhos</h2>
          <button className="text-button" onClick={props.browse}>
            Ver biblioteca <ArrowRight size={16} />
          </button>
        </div>
        <div className="deck-list">
          {decks.map((deck) => (
            <button
              key={deck.id}
              className="deck-row"
              onClick={() => (deck.due_count ? props.study(deck.id) : props.browse())}
            >
              <span className="deck-icon">
                <BookOpen size={23} strokeWidth={1.5} />
              </span>
              <span className="deck-description">
                <strong>{deck.name}</strong>
                <span>{deck.card_count} cartões</span>
              </span>
              <span className={`due-badge ${deck.due_count ? '' : 'neutral'}`}>
                {deck.due_count ? `${deck.due_count} para revisar` : 'Em dia'}
              </span>
              <ArrowRight className="deck-arrow" size={18} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function StudyInvitation({
  stats,
  study,
  create,
}: {
  stats: Workspace['stats'];
  study: () => void;
  create: () => void;
}): React.JSX.Element {
  const empty = stats.total === 0;
  return (
    <section className="study-invitation">
      <div>
        <span className="eyebrow">SUA PRÓXIMA SESSÃO</span>
        <h2>
          {empty ? (
            'Toda lembrança começa\ncom um cartão.'
          ) : stats.due ? (
            <>
              <strong>{stats.due}</strong>{' '}
              {stats.due === 1 ? 'cartão esperando' : 'cartões esperando'}
              <br />
              por você.
            </>
          ) : (
            'Tudo em dia.\nMuito bem.'
          )}
        </h2>
        <p>
          {empty
            ? 'Guarde uma palavra, uma ideia ou aquela dúvida que sempre volta.'
            : stats.due
              ? 'Tente lembrar, confira a resposta e conte como foi.'
              : 'Suas próximas revisões aparecem aqui na hora certa.'}
        </p>
        <Button size="3" onClick={empty || !stats.due ? create : study}>
          {empty || !stats.due ? 'Criar um cartão' : 'Começar a revisar'}
          <ArrowRight size={18} />
        </Button>
      </div>
      <div className="invitation-art" aria-hidden="true">
        <div className="mini-card back" />
        <div className="mini-card front">
          <Layers2 size={34} strokeWidth={1.2} />
          <span>
            Um passo
            <br />
            de cada vez.
          </span>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}): React.JSX.Element {
  return (
    <div className="stat-card">
      <span>{icon}</span>
      <strong>{value}</strong>
      <p>{label}</p>
    </div>
  );
}
