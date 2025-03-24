import { useEffect, useState } from "react";
import { buscarTodosVendedores, atualizarCampoVendedor } from "../services/vendedorService";
import Layout from "../components/Layout";

const AdminConfigNotificacoes = () => {
  const [vendedores, setVendedores] = useState([]);
  const [status, setStatus] = useState({});

  const carregar = async () => {
    const lista = await buscarTodosVendedores();

    // 🔄 Normaliza para campo com acento, que é o correto no NocoDB
    const listaCorrigida = lista.map((v) => ({
      ...v,
      "ReceberNotificação": v["ReceberNotificação"] || v.ReceberNotificacao || "False",
    }));

    setVendedores(listaCorrigida);
  };

  useEffect(() => {
    carregar();
  }, []);

  const atualizar = async (email, campo, valor) => {
    await atualizarCampoVendedor(email, campo, valor); // usa "ReceberNotificação"
    setStatus((prev) => ({ ...prev, [email]: "✅ Salvo!" }));
    setTimeout(() => setStatus((prev) => ({ ...prev, [email]: "" })), 1500);
    await carregar();
  };

  return (
    <Layout vendedor={{ nome: "Administrador" }}>
      <div style={{ padding: "2rem" }}>
        <h2 style={{ marginBottom: "2rem" }}>📢 <strong>Notificações</strong></h2>
        <p style={{ marginBottom: "2rem", color: "#666" }}>
          Ative ou desative as notificações para cada vendedor.
        </p>

        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          {vendedores.map((v) => (
            <div
              key={v.email}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "1.5rem",
                background: "#fff",
              }}
            >
              <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>👤 {v.nome}</h3>
              <p style={{ fontSize: "0.9rem", color: "#555" }}>{v.email}</p>

              <label style={{ display: "block", marginTop: "1rem" }}>
                <input
                  type="checkbox"
                  checked={v["ReceberNotificação"] === "True"}
                  onChange={(e) =>
                    atualizar(v.email, "ReceberNotificação", e.target.checked ? "True" : "False")
                  }
                  style={{ marginRight: "8px" }}
                />
                Receber notificações
              </label>

              {status[v.email] && (
                <p style={{ color: "green", marginTop: "0.5rem" }}>{status[v.email]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminConfigNotificacoes;
