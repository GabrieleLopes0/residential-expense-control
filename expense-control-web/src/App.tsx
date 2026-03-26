// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Pessoas } from "./pages/Pessoas";
import { Categorias } from "./pages/Categorias";
import { Transacoes } from "./pages/Transacoes";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Header simples */}
        <header className="bg-blue-500 text-white p-4 text-xl font-bold">
          Minha Casa
        </header>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pessoas" element={<Pessoas />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/transacoes" element={<Transacoes />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;