import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import GiftAirtime from "./pages/GiftAirtime";
import GiftToken from "./pages/GiftToken";
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
            <Route path="/gift-airtime" element={<ProtectedRoute> <GiftAirtime /> </ProtectedRoute>} />
            <Route
            path="/gift-token"
            element={
                <ProtectedRoute>
                <GiftToken />
                </ProtectedRoute>
            }
            />
        </Routes>
      </Router>
    </WalletContextProvider>
  );
}

export default App;
