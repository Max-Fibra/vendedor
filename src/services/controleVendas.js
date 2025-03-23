import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_NOCODB_URL + '/api/v2',
  headers: {
    'xc-token': process.env.REACT_APP_NOCODB_TOKEN,
    'Content-Type': 'application/json',
  },
});

// Busca todos os dados da tabela
export const getControleVendas = async () => {
  const res = await api.get('/tables/m8xz7i1uldvt2gr/records');
  return res.data.list;
};

export const getControlePorVendedor = async (nome) => {
  const res = await api.get('/tables/m8xz7i1uldvt2gr/records');
  const match = res.data.list.find(
    (r) => r.Title?.toLowerCase() === nome.toLowerCase() && r.DadosClientesVendedores !== null
  );
  return match || null;
};




// Cria um novo registro
export const createControleVendas = async (data) => {
  const res = await api.post('/tables/m8xz7i1uldvt2gr/records', data);
  return res.data;
};

export const updateControleVendas = async (recordId, data) => {
  if (!recordId) {
    console.error("⚠️ updateControleVendas chamado com recordId inválido:", recordId);
    return;
  }

  const body = [{ Id: recordId, ...data }];
  //console.log("PATCH BODY:", body);

  const res = await api.patch('/tables/m8xz7i1uldvt2gr/records', body);
  return res.data;
};



