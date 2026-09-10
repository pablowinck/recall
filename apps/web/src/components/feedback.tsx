import { Button, Spinner } from '@radix-ui/themes';
import { AlertCircle } from 'lucide-react';

/** Indica uma espera real e acessível. Exemplo: <LoadingState />. */
export function LoadingState(): React.JSX.Element {
  return (
    <div className="loading-state" role="status">
      <Spinner size="3" />
      <span>Preparando seu espaço…</span>
    </div>
  );
}

/** Expõe uma falha recuperável. Exemplo: <ErrorNotice message={error} retry={reload} />. */
export function ErrorNotice({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}): React.JSX.Element {
  return (
    <div className="error-notice" role="alert">
      <AlertCircle size={19} />
      <span>{message}</span>
      {retry && (
        <Button variant="soft" onClick={retry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

/** Traduz erros desconhecidos sem detalhes internos. Exemplo: describeFailure(error). */
export function describeFailure(error: unknown): string {
  if (error instanceof TypeError)
    return 'Sem conexão com o servidor. Confira sua conexão e tente novamente.';
  if (error instanceof Error) return error.message;
  return 'Algo não saiu como esperado. Tente novamente.';
}
