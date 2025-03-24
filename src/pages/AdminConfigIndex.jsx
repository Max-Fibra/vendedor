import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const cards = [
  {
    titulo: "🏅 Classificação de Vendedores",
    descricao: "Defina quais vendedores são Diamante, Ouro, Prata ou Bronze.",
    rota: "/admin/config-classificacao"
  },
  {
    titulo: "📄 Ajuste de comissão",
    descricao: "Edite aqui os valores de comissão.",
    rota: "/admin/config-comissão"
  },
  {
    titulo: "📢 Notificações",
    descricao: "Controle quem recebe alertas por WhatsApp e e-mail.",
    rota: "/admin/config-notificacoes"
  }
];

const AdminConfigIndex = () => {
  const navigate = useNavigate();

  return (
    <Layout vendedor={{ nome: "Administrador" }}>
      <div style={{ padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>⚙️ Painel de Configurações</h2>
        <div style={{ display: "grid", gap: "1rem" }}>
          {cards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => navigate(card.rota)}
              style={{
                padding: "1rem",
                border: "1px solid #ccc",
                borderRadius: "10px",
                cursor: "pointer",
                background: "#f9f9f9",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#eaeaea"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#f9f9f9"}
            >
              <h3 style={{ margin: 0 }}>{card.titulo}</h3>
              <p style={{ marginTop: "0.5rem", color: "#555" }}>{card.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminConfigIndex;
