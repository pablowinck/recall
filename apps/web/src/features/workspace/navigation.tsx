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
  { id: 'today', title: 'Today', icon: CalendarDays },
  { id: 'library', title: 'Library', icon: BookOpen },
  { id: 'connections', title: 'Connections', icon: Cable },
] as const;

/** Keep navigation consistent across screen sizes. Example: <WorkspaceNavigation {...props} />. */
export function WorkspaceNavigation(props: NavigationProps): React.JSX.Element {
  return (
    <aside className="sidebar">
      <RecallBrand />
      <nav aria-label="Main navigation">
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
          <span>AT YOUR OWN PACE</span>
          <p>
            Consistency matters
            <br />
            more than speed.
          </p>
        </div>
        <div className="profile">
          <span className="avatar">{props.email[0]?.toUpperCase()}</span>
          <span className="profile-name">
            My workspace<small>{props.email}</small>
          </span>
        </div>
        <div className="profile-actions">
          <Tooltip content={props.dark ? 'Use light theme' : 'Use dark theme'}>
            <IconButton
              variant="ghost"
              aria-label={props.dark ? 'Use light theme' : 'Use dark theme'}
              onClick={props.toggleTheme}
            >
              {props.dark ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
          </Tooltip>
          <Tooltip content="Sign out">
            <IconButton variant="ghost" aria-label="Sign out" onClick={props.signOut}>
              <LogOut size={18} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
