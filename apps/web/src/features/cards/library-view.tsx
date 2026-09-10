'use client';
import { useState } from 'react';
import { Button, Select, TextField } from '@radix-ui/themes';
import { ArrowLeft, ArrowRight, BookOpen, Plus, Search } from 'lucide-react';
import type { RecallClient } from '@recall/client';
import type { Deck, Flashcard } from '@recall/contracts';
import { ErrorNotice, LoadingState } from '@/components/feedback';
import { useLibrary } from './use-library';
import { NewDeckDialog } from './new-deck-dialog';

interface LibraryProps {
  client: RecallClient;
  decks: Deck[];
  revision: number;
  create: () => void;
  edit: (card: Flashcard) => void;
  refresh: () => void;
}

/** Biblioteca pesquisável com paginação real. Exemplo: <LibraryView {...props} />. */
export function LibraryView(props: LibraryProps): React.JSX.Element {
  const [search, setSearch] = useState('');
  const [deck, setDeck] = useState('');
  const [page, setPage] = useState(0);
  const { result, loading, error } = useLibrary(props.client, search, deck, page, props.revision);
  return (
    <div className="view-enter">
      <header className="page-header">
        <div>
          <span className="eyebrow">O QUE VOCÊ QUER LEMBRAR</span>
          <h1>Sua biblioteca.</h1>
          <p>Palavras, ideias e pequenas descobertas.</p>
        </div>
        <Button onClick={props.create}>
          <Plus size={17} />
          Novo cartão
        </Button>
      </header>
      <div className="library-toolbar">
        <TextField.Root
          aria-label="Buscar cartões"
          placeholder="Buscar uma palavra, pergunta ou resposta…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          size="3"
        >
          <TextField.Slot>
            <Search size={18} />
          </TextField.Slot>
        </TextField.Root>
        <Select.Root
          value={deck || 'all'}
          onValueChange={(value) => {
            setDeck(value === 'all' ? '' : value);
            setPage(0);
          }}
        >
          <Select.Trigger aria-label="Filtrar por baralho" />
          <Select.Content>
            <Select.Item value="all">Todos os baralhos</Select.Item>
            {props.decks.map((item) => (
              <Select.Item key={item.id} value={item.id}>
                {item.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <NewDeckDialog client={props.client} done={props.refresh} />
      </div>
      {error ? (
        <ErrorNotice message={error} retry={props.refresh} />
      ) : loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="result-label">
            {result.total} {result.total === 1 ? 'cartão' : 'cartões'}
          </div>
          <div className="card-grid">
            {result.cards.map((card) => (
              <CardTile key={card.id} card={card} edit={() => props.edit(card)} />
            ))}
          </div>
          {!result.cards.length && (
            <div className="empty-state">
              <BookOpen size={32} strokeWidth={1.4} />
              <h2>
                {search || deck ? 'Nenhum cartão encontrado.' : 'Sua próxima descoberta mora aqui.'}
              </h2>
              <p>
                {search || deck
                  ? 'Tente outra busca ou escolha outro baralho.'
                  : 'Crie seu primeiro cartão e comece a construir sua memória.'}
              </p>
              {!search && <Button onClick={props.create}>Criar cartão</Button>}
            </div>
          )}
          <div className="pagination">
            <Button variant="soft" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ArrowLeft size={16} />
              Anterior
            </Button>
            <span>
              Página {page + 1} de {Math.max(1, Math.ceil(result.total / 24))}
            </span>
            <Button
              variant="soft"
              disabled={(page + 1) * 24 >= result.total}
              onClick={() => setPage(page + 1)}
            >
              Próxima
              <ArrowRight size={16} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function CardTile({ card, edit }: { card: Flashcard; edit: () => void }): React.JSX.Element {
  const due = new Date(card.due_at) <= new Date();
  return (
    <button className="library-card" onClick={edit}>
      <span className={`card-status ${card.suspended ? 'paused' : due ? 'ready' : ''}`}>
        {card.suspended
          ? 'Pausado'
          : card.schedule === null
            ? 'Novo'
            : due
              ? 'Para revisar'
              : 'Agendado'}
      </span>
      <h2>{card.front}</h2>
      <p>{card.back}</p>
      <div className="tag-list">
        {card.tags.slice(0, 3).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <span className="card-edit-hint">
        Editar cartão <ArrowRight size={14} />
      </span>
    </button>
  );
}
