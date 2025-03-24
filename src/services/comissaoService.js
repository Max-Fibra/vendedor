// comissaoService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_NOCODB_URL;
const API_TOKEN = process.env.REACT_APP_NOCODB_TOKEN;
const TABELA_ID = "m007s1znd8hpu6r";

const headers = {
  "xc-token": API_TOKEN,
};

export const buscarComissoes = async () => {
  const res = await axios.get(`${API_URL}/api/v2/tables/${TABELA_ID}/records`, { headers });
  const registro = res.data.list[0];

  const comissoes =
    typeof registro.Valores_Comissão === "string"
      ? JSON.parse(registro.Valores_Comissão).comissoes
      : registro.Valores_Comissão.comissoes;

  return {
    id: registro.Id,
    comissoes,
  };
};

export const atualizarComissoes = async (id, novasComissoes) => {
  const payload = {
    Id: id,
    Valores_Comissão: JSON.stringify({ comissoes: novasComissoes }),
  };

  return axios.patch(`${API_URL}/api/v2/tables/${TABELA_ID}/records`, payload, { headers });
};
