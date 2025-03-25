import { useState } from "react";

const NovoVendedorModal = ({ onClose, onSalvar }) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("+55");

  const handleSalvar = () => {
    if (!nome || !email) {
      alert("Nome e e-mail são obrigatórios.");
      return;
    }

    // Normaliza telefone
    const telefoneFinal = telefone.startsWith("+55")
      ? telefone
      : "+55" + telefone.replace(/\D/g, "");

    onSalvar({ nome, email, telefone: telefoneFinal });
    onClose();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#fff",
        padding: "2rem",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
      }}>
        <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px", color: "#6a1b9a" }}>
          <span style={{ fontSize: "20px" }}>➕</span> Novo Vendedor
        </h3>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>Nome:</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Digite o nome"
            style={{
              width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc"
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Digite o e-mail"
            style={{
              width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc"
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>Telefone (opcional):</label>
          <input
            type="text"
            value={telefone}
            onChange={(e) => {
              let val = e.target.value.replace(/\D/g, "");
              if (!val.startsWith("55")) val = "55" + val;
              setTelefone("+" + val);
            }}
            style={{
              width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc"
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              background: "#f5f5f5", color: "#333", border: "1px solid #ccc",
              padding: "8px 14px", borderRadius: "8px", cursor: "pointer"
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            style={{
              background: "#0d6efd", color: "#fff", border: "none",
              padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer"
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NovoVendedorModal;
