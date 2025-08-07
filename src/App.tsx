import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import WalletContextProvider from "./components/walletConnect";
import { Layout } from "./components/Layout";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import OldDashboard from "./pages/OldDashboard";

function App() {
  return (
    <WalletContextProvider>
      <Router>
        <Routes>
            <Route path="/" element={<Landing />} />
                  <Route path="/oldDashboard" element={<Layout><OldDashboard /></Layout>} />
            <Route path="/old" element={<Home />} />
            <Route path="/dashboard" element={<Layout> <Dashboard /> </Layout>} />
            <Route path="/categories" element={<Categories />} />
        </Routes>
      </Router>
    </WalletContextProvider>
  );
}

export default App;
