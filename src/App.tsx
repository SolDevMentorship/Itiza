import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AllGifts from "./pages/AllGifts";
import WalletContextProvider from "./components/walletConnect";
import { Layout } from "./components/Layout";
import Landing from "./pages/Landing";

function App() {
  return (
    <WalletContextProvider>
      <Router>
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Layout> <Dashboard /> </Layout>} />
            <Route path="/allgifts" element={<Layout> <AllGifts /> </Layout>} />
        </Routes>
      </Router>
    </WalletContextProvider>
  );
}

export default App;
