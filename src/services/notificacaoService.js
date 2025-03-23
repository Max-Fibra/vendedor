import axios from "axios";

// URL do servidor de notificação (ajuste para seu backend se for remoto)
const API_URL = process.env.REACT_APP_NOTIFICACAO_URL;

export const enviarStatusVenda = async (email, status, cliente, plano, protocolo, motivo) => {
    try {
      const response = await axios.post(`${API_URL}/notificar-status`, {
        email,
        status,
        cliente,
        plano,
        protocolo,
        motivo,
      });
  
      return response.data;
    } catch (error) {
      console.error("❌ Erro ao enviar notificação de status:", error.response?.data || error.message);
      throw error;
    }
  };
  
