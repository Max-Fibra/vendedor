import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { buscarComissoes, atualizarComissoes } from "../services/comissaoService";

const AdminConfigComissao = () => {
  const [comissoes, setComissoes] = useState({});
  const [recordId, setRecordId] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const carregar = async () => {
      try {
        const { id, comissoes } = await buscarComissoes();
        setRecordId(id);
        setComissoes(comissoes);
      } catch (err) {
        console.error("Erro ao carregar comissões:", err);
      }
    };
    carregar();
  }, []);

  const handleChange = (classe, valorDigitado) => {
    let valorSemPrefixo = valorDigitado.replace(/^R\$\s?/, "");
    let novoValor = `R$ ${valorSemPrefixo}`;
    setComissoes((prev) => ({
      ...prev,
      [classe]: { valor: novoValor },
    }));
  };

  const salvar = async () => {
    try {
      await atualizarComissoes(recordId, comissoes);
      setStatus("✅ Comissões salvas!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("Erro ao salvar comissões:", err);
      setStatus("❌ Erro ao salvar.");
    }
  };

  const classificacoes = ["Diamante", "Ouro", "Prata", "Bronze", "Sem classificação"];
  const fixos = ["Sem Taxa"];

  return (
    <Layout vendedor={{ nome: "Administrador" }}>
      <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1rem" }}>📄 Ajuste de Comissão</h2>

        <p style={{ marginBottom: "2rem", fontSize: "14px", color: "#444" }}>
          Aqui você pode definir os valores de comissão com base na <strong>classificação dos vendedores</strong>,
          além de um valor separado para <strong>vendas sem taxa</strong>.
        </p>

        {/* CLASSIFICAÇÕES */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>🏆 Comissão por Classificação</h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            {classificacoes.map((classe) => (
              <div key={classe} style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontWeight: "bold", marginBottom: "4px" }}>{classe}</label>
                <input
                  type="text"
                  value={comissoes[classe]?.valor || ""}
                  onChange={(e) => handleChange(classe, e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SEM TAXA */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>💡 Comissão para Vendas Sem Pagamento de Taxa</h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            {fixos.map((classe) => (
              <div key={classe} style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontWeight: "bold", marginBottom: "4px" }}>{classe}</label>
                <input
                  type="text"
                  value={comissoes[classe]?.valor || ""}
                  onChange={(e) => handleChange(classe, e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            ))}
          </div>
          <p style={{ marginTop: "0.5rem", fontSize: "13px", color: "#666" }}>
            Este valor será usado quando o cliente estiver ativo, mas não tiver pago a taxa de instalação.
          </p>
        </div>

        {/* BOTÃO SALVAR */}
        <button
          onClick={salvar}
          style={{
            padding: "10px 20px",
            background: "#0d6efd",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          💾 Salvar alterações
        </button>

        {status && (
          <p style={{ marginTop: "1rem", color: status.includes("✅") ? "green" : "red" }}>
            {status}
          </p>
        )}
      </div>
    </Layout>
  );
};

export default AdminConfigComissao;
