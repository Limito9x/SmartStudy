import "./App.css";
import AppRoutes from "./routes";
import GlobalLoading from "./components/ui/common/GlobalLoading";
import { useSignalRNotifications } from "./hooks/useSignarlRNotifications";

function App() {
  useSignalRNotifications();

  return (
    <>
      <AppRoutes />
      <GlobalLoading />
    </>
  );
}

export default App;
