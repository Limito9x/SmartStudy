import "./App.css";
import AppRoutes from "./routes";
import GlobalLoading from "./components/ui/common/GlobalLoading";

function App() {
  return (
    <>
      <AppRoutes />
      <GlobalLoading />
    </>
  );
}

export default App;
