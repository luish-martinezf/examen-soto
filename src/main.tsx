import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PrimeReactProvider } from "@primereact/core";
import Aura from "@primeuix/themes/aura";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./index.css";
import App from "./App.tsx";
import { store } from "./app/store";
import { initializeTheme } from "./theme/theme";

initializeTheme();

const primereact = {
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: "primereact",
        order: "theme, base, primereact",
        darkModeSelector: ".dark",
        cssLayer: false,
        cssVariables: true,
        scoped: false,
      },
    },
  },
  license: import.meta.env.VITE_PRIME_REACT_LICENSE,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrimeReactProvider {...primereact} preflight={false}>
      <Provider store={store}>
        <App />
      </Provider>
    </PrimeReactProvider>
  </StrictMode>,
);
