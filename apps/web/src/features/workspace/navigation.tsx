import { BookOpen, CalendarDays, Cable, LogOut, Moon, Sun } from 'lucide-react';
import { IconButton, Tooltip } from '@radix-ui/themes';
import { RecallBrand } from '@/components/brand';

export type WorkspaceView = 'today' | 'library' | 'connections' | 'study';
interface NavigationProps {
  view: WorkspaceView;
  navigate: (view: WorkspaceView) => void;
  email: string;
  dark: boolean;
  toggleTheme: () => void;
  signOut: () => void;
}
const sections = [
  { id: 'today', title: 'Hoje', icon: CalendarDays },
  { id: 'library', title: 'Biblioteca', icon: BookOpen },
  { id: 'connections', title: 'Conexões', icon: Cable },
] as const;

/** Mantém navegação consistente entre dispositivos. Exemplo: <WorkspaceNavigation {...props} />. */
export function WorkspaceNavigation(props: NavigationProps): React.JSX.Element {
  return (
    <aside className="sidebar">
      <RecallBrand />
      <nav aria-label="Navegação principal">
        {sections.map(({ id, title, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${props.view === id ? 'active' : ''}`}
            aria-current={props.view === id ? 'page' : undefined}
            onClick={() => props.navigate(id)}
          >
            <Icon size={20} />
            <span>{title}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="study-note">
          <span>NO SEU RITMO</span>
          <p>
            Consistência vale mais
            <br />
            que pressa.
          </p>
        </div>
        <div className="profile">
          <span className="avatar">{props.email[0]?.toUpperCase()}</span>
          <span className="profile-name">
            Meu espaço<small>{props.email}</small>
          </span>
        </div>
        <div className="profile-actions">
          <Tooltip content={props.dark ? 'Usar tema claro' : 'Usar tema escuro'}>
            <IconButton
              variant="ghost"
              aria-label={props.dark ? 'Usar tema claro' : 'Usar tema escuro'}
              onClick={props.toggleTheme}
            >
              {props.dark ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
          </Tooltip>
          <Tooltip content="Sair da conta">
            <IconButton variant="ghost" aria-label="Sair da conta" onClick={props.signOut}>
              <LogOut size={18} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
