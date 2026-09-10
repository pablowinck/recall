export type WorkspaceView = 'today' | 'library' | 'connections' | 'study';
export interface AppearanceActions {
  dark: boolean;
  toggleTheme: () => void;
  signOut: () => void;
}
export interface NavigationProps extends AppearanceActions {
  view: WorkspaceView;
  navigate: (view: WorkspaceView) => void;
  email: string;
}
