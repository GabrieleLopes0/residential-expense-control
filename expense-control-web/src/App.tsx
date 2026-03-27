// Componente principal com rotas da aplicação
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
