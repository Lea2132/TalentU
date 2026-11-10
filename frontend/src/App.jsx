import { useEffect, useState } from "react";
import Rutas from "./routes/Rutas";
import { API_ORIGIN } from "./config/api";

const App = () => {
  const [apiReady, setApiReady] = useState(false);
  const [showWakeup, setShowWakeup] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let activeController;
    let delayTimer;
    let requestTimer;
    const wakeupMessageTimer = setTimeout(() => setShowWakeup(true), 1200);
    const startedAt = Date.now();

    const checkApi = async () => {
      while (!cancelled && Date.now() - startedAt < 90000) {
        activeController = new AbortController();
        requestTimer = setTimeout(() => activeController.abort(), 15000);

        try {
          const response = await fetch(`${API_ORIGIN}/health`, {
            cache: "no-store",
            signal: activeController.signal,
          });

          if (response.ok) {
            if (!cancelled) {
              setApiReady(true);
              setApiFailed(false);
              setShowWakeup(false);
            }
            return;
          }
        } catch (error) {
          if (cancelled) return;
          if (error.name !== "AbortError") {
            console.warn("No se pudo comprobar la disponibilidad del servidor.");
          }
        } finally {
          clearTimeout(requestTimer);
          activeController = undefined;
        }

        await new Promise((resolve) => {
          delayTimer = setTimeout(resolve, 3000);
        });
      }

      if (!cancelled) {
        setApiFailed(true);
        setShowWakeup(true);
      }
    };

    checkApi();

    return () => {
      cancelled = true;
      activeController?.abort();
      clearTimeout(wakeupMessageTimer);
      clearTimeout(requestTimer);
      clearTimeout(delayTimer);
    };
  }, [retry]);

  return (
    <div>
      <Rutas />
      {showWakeup && !apiReady && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4"
          role="status"
          aria-live="polite"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl">
            {!apiFailed ? (
              <>
                <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
                <h1 className="text-xl font-bold text-slate-900">
                  Estamos despertando el servidor
                </h1>
                <p className="mt-2 text-slate-600">
                  El plan gratuito puede pausar la aplicación cuando no se usa.
                  Esto puede tardar hasta un minuto; por favor, espera.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-slate-900">
                  El servidor todavía no responde
                </h1>
                <p className="mt-2 text-slate-600">
                  No pudimos conectar después de varios intentos. Puedes
                  intentarlo de nuevo en unos segundos.
                </p>
                <button
                  className="mt-5 rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700"
                  onClick={() => {
                    setApiReady(false);
                    setApiFailed(false);
                    setRetry((current) => current + 1);
                  }}
                  type="button"
                >
                  Reintentar conexión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
