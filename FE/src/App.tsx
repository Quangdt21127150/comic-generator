import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./styles/theme";
import GeneratorPage from "./pages/GeneratorPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GeneratorPage />
    </ThemeProvider>
  );
}

export default App;
