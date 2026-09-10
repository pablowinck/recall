import { BookOpen, CalendarDays, Cable } from 'lucide-react';
import { RecallBrand } from '@/components/brand';
import { NavigationProfile } from './navigation-profile';
import type { NavigationProps } from './navigation-types';

export type { WorkspaceView } from './navigation-types';
const sections = [
  { id: 'today', title: 'Today', icon: CalendarDays },
  { id: 'library', title: 'Library', icon: BookOpen },
  { id: 'connections', title: 'Connections', icon: Cable },
] as const;
type NavigationSection = (typeof sections)[number];

/** Keep navigation consistent across screen sizes. Example: <WorkspaceNavigation {...props} />. */
export function WorkspaceNavigation(props: NavigationProps): React.JSX.Element {
  return (
    <aside className="sidebar">
      <RecallBrand />
      <NavigationLinks navigation={props} />
      <NavigationProfile {...props} />
    </aside>
  );
}

function NavigationLinks({ navigation }: { navigation: NavigationProps }): React.JSX.Element {
  return (
    <nav aria-label="Main navigation">
      {sections.map((section) => (
        <NavigationItem key={section.id} section={section} navigation={navigation} />
      ))}
    </nav>
  );
}

function NavigationItem({
  section,
  navigation,
}: {
  section: NavigationSection;
  navigation: NavigationProps;
}): React.JSX.Element {
  const active = navigation.view === section.id;
  const Icon = section.icon;
  return (
    <button
      className={`nav-item ${active ? 'active' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={() => navigation.navigate(section.id)}
    >
      <Icon size={20} />
      <span>{section.title}</span>
    </button>
  );
}
