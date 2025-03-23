import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { atualizarCampoVendedor } from "../services/vendedorService"; // 👈 importa
import { buscarVendedorPorEmail } from "../services/vendedorService"; // 👈 importa também



const Config = ({ ultimaAtualizacao, totalComissoes }) => {
  const [receberNotificacao, setReceberNotificacao] = useState(false);
  const [vendedor, setVendedor] = useState(null);

  // 🔁 Recupera o vendedor do localStorage
  useEffect(() => {
    const vendedorLocal = localStorage.getItem("vendedor");
  
    if (!vendedorLocal) return;
  
    const vendedorLocalParsed = JSON.parse(vendedorLocal);
  
    buscarVendedorPorEmail(vendedorLocalParsed.email).then((vendedorAtualizado) => {
      if (vendedorAtualizado) {
        setVendedor(vendedorAtualizado);
  
        // Atualiza o localStorage com dados frescos da API
        localStorage.setItem("vendedor", JSON.stringify(vendedorAtualizado));
  
        // Inicializa o checkbox com base no campo ReceberNotificação da API
        if (typeof vendedorAtualizado.ReceberNotificação === "string") {
          setReceberNotificacao(vendedorAtualizado.ReceberNotificação === "True");
        }
      }
    });
  }, []);
  

  useEffect(() => {
    const saved = localStorage.getItem("receberNotificacao");
    if (saved) setReceberNotificacao(saved === "true");
  }, []);

  useEffect(() => {
    if (!vendedor?.email) return;
  
    // Atualiza localStorage
    localStorage.setItem("receberNotificacao", receberNotificacao);
  
    // Atualiza no NocoDB
    atualizarCampoVendedor(
      vendedor.email,
      "ReceberNotificação",
      receberNotificacao ? "True" : "False"
    );
  }, [receberNotificacao, vendedor]);
  

  return (
    <Layout
      vendedor={vendedor}
      ultimaAtualizacao={ultimaAtualizacao}
      totalComissoes={totalComissoes}
      mostrarHeader={false}
    >
      <div>
        <h2>⚙️ Configuração</h2>
        <p>Aqui você pode ajustar suas preferências.</p>

        <div style={{ marginTop: "20px" }}>
          <label style={{ fontSize: "16px" }}>
            <input
              type="checkbox"
              checked={receberNotificacao}
              onChange={(e) => setReceberNotificacao(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            Receber Notificação?
          </label>

          <p style={{ fontSize: "14px", color: "#555", marginTop: "8px" }}>
            <strong>Obs:</strong> Ao ativar essa informação, você receberá
            notificações de <strong>novas vendas</strong> adicionadas ao seu
            perfil e <strong>relatórios mensais</strong> de vendas.
          </p>
        </div>

        {/* 📞 Exibe o telefone do vendedor se disponível */}
            {vendedor?.telefone && (
            <div
                style={{
                marginTop: "30px",
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: "#fefefe",
                maxWidth: "400px",
                }}
            >
                <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                <span style={{ color: "#d50000", marginRight: "8px" }}>📞</span>
                <strong>Seu número (WhatsApp):</strong>
                </p>
                <a
                href={`https://wa.me/${vendedor.telefone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    fontSize: "16px",
                    color: "#25D366",
                    textDecoration: "none",
                    fontWeight: "bold",
                }}
                >
                {vendedor.telefone} → Abrir no WhatsApp
                </a>
            </div>
            )}

      </div>
    </Layout>
  );
};

export default Config;
