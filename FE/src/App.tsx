import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./styles/theme";
import GeneratorPage from "./pages/GeneratorPage"; // ← thay đổi đường dẫn

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GeneratorPage />
    </ThemeProvider>
  );
}

export default App;
