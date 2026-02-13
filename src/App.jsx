import "./App.css";
import { Routes, Route, Outlet } from "react-router-dom";

import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import ResetPassword from "./pages/ResetPassword";

import Home from "./pages/Home";
import Add from "./pages/Add";
import View from "./pages/View";
import AnimalDetails from "./pages/AnimalDetails";
import EditAnimalDetails from "./pages/EditAnimalDetails";
import UpdateWeight from "./pages/UpdateWeight";
import UpdateTreatmentDate from "./pages/UpdateTreatmentDate";
import Analytics from "./pages/Analytics";

import ProtectedRoute from "./routes/ProtectedRoute";
import Footer from "./components/Footer";

function AppLayout() {
  return (
    <div className="app-shell">
      <Outlet />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/createAccount" element={<CreateAccount />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<AppLayout />}>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <Add />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view"
          element={
            <ProtectedRoute>
              <View />
            </ProtectedRoute>
          }
        />
        <Route
          path="/animals/:animalId"
          element={
            <ProtectedRoute>
              <AnimalDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:animalId"
          element={
            <ProtectedRoute>
              <EditAnimalDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/updateWeight/:animalId"
          element={
            <ProtectedRoute>
              <UpdateWeight />
            </ProtectedRoute>
          }
        />
        <Route
          path="/updateTreatmentDate/:animalId"
          element={
            <ProtectedRoute>
              <UpdateTreatmentDate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
