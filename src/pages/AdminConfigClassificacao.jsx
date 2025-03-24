import { useEffect, useState } from "react";
import { buscarTodosVendedores, atualizarCampoVendedor } from "../services/vendedorService";
import Layout from "../components/Layout";

const opcoesClassificacao = ["Diamante", "Ouro", "Prata", "Bronze", "Sem classificação"];

const AdminConfigClassificacao = () => {
  const [vendedores, setVendedores] = useState([]);
  const [status, setStatus] = useState({});

  const carregarVendedores = async () => {
    const lista = await buscarTodosVendedores();
    setVendedores(lista);
  };

  useEffect(() => {
    carregarVendedores();
  }, []);

  const atualizarClassificacao = async (email, novaClassificacao) => {
    await atualizarCampoVendedor(email, "Classificação", novaClassificacao);
    setStatus(prev => ({ ...prev, [email]: "✅ Atualizado!" }));
    setTimeout(() => setStatus(prev => ({ ...prev, [email]: "" })), 2000);
    await carregarVendedores(); // 👈 recarrega após atualizar
  };

  return (
    <Layout vendedor={{ nome: "Administrador" }}>
      <div style={{ padding: "2rem" }}>
        <h2 style={{ marginBottom: "2rem" }}>🏆 <span style={{ fontWeight: "bold" }}>Configuração de Classificação dos Vendedores</span></h2>

        <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {vendedores.map((v) => (
            <div
              key={v.email}
              style={{
                border: "1px solid #ccc",
                borderRadius: "12px",
                padding: "1.5rem",
                background: "#fefefe",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>👤 {v.nome}</h3>
              <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: "1rem" }}>{v.email}</p>

              <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                Classificação:
                <select
                  value={v.classificacao || ""}
                  onChange={(e) => atualizarClassificacao(v.email, e.target.value)}
                  style={{
                    marginLeft: "0.5rem",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #aaa",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="">Selecione...</option>
                  {opcoesClassificacao.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </label>

              {status[v.email] && (
                <div style={{ marginTop: "0.5rem", color: "green", fontSize: "0.85rem" }}>
                  {status[v.email]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminConfigClassificacao;
