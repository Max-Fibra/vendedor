import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_NOCODB_URL + '/api/v2',
  headers: {
    'xc-token': process.env.REACT_APP_NOCODB_TOKEN,
    'Content-Type': 'application/json',
  },
});

const TABLE_ID = 'ms1bmef6emrjww0'; // Tabela de Indicações

// Função comum para buscar o vendedor, evitando repetição
const buscarVendedorPorNome = async (vendedor) => {
  const { data } = await api.get(`/tables/${TABLE_ID}/records`);
  return data.list.find((r) => r.Vendedor.toLowerCase() === vendedor.toLowerCase()) || null;
};

// Buscar registro do vendedor
export const buscarRegistroPorVendedor = async (vendedor) => {
  const registro = await buscarVendedorPorNome(vendedor);
  return registro ? registro : null;
};

// Buscar o UnicID de um vendedor
export const buscarUnicIDPorVendedor = async (vendedor) => {
  const registro = await buscarVendedorPorNome(vendedor);
  return registro?.UnicID || null;
};

// Atualizar indicações
export const atualizarIndicacoes = async (recordId, novasIndicacoes) => {
  const payload = {
    Id: recordId,
    Json_Indicações: { indicacoes: novasIndicacoes },
  };

  const res = await api.patch(`/tables/${TABLE_ID}/records`, payload);
  return res.data;
};

// Criar ou atualizar o registro do vendedor
export const criarOuAtualizarRegistroIndicacao = async (vendedor, idUnic) => {
  const registroExistente = await buscarVendedorPorNome(vendedor);

  const payload = {
    Vendedor: vendedor,
    UnicID: idUnic,
    Json_Indicações: registroExistente?.Json_Indicações || { indicacoes: [] },
  };

  if (registroExistente) {
    return await api.patch(`/tables/${TABLE_ID}/records`, { Id: registroExistente.Id, ...payload });
  } else {
    return await api.post(`/tables/${TABLE_ID}/records`, payload);
  }
};

// Criar novo registro de indicação
export const criarRegistroIndicacao = async (vendedor, idUnic, indicacoes = []) => {
  const payload = {
    Vendedor: vendedor,
    UnicID: idUnic,
    Json_Indicações: { indicacoes },
  };

  const res = await api.post(`/tables/${TABLE_ID}/records`, payload);
  return res.data;
};

// Buscar registro por código de indicação
export const buscarRegistroPorCodigoIndicacao = async (codigo) => {
  const { data } = await api.get(`/tables/${TABLE_ID}/records`);
  
  return data.list.find((r) => {
    const unicId = r.UnicID?.toLowerCase();
    const vendedor = r.Vendedor?.toLowerCase();
    const code = codigo?.toLowerCase();
    
    return unicId === code || vendedor === code.split('-')[0];
  }) || null;
};


export const buscarVendedores = async () => {
  const { data } = await api.get("/tables/m3cqlvi5625ahqs/records");
  
  const vendedores = [];

  // Função para gerar um código único
  const gerarCodigoUnico = (nome) => `${nome.toLowerCase().replace(/\s+/g, "")}-${Math.random().toString(36).substring(2, 8)}`;

  // Iteração para processar os vendedores
  data.list.forEach((item) => {
    const objVendedores = item.Vendedor;

    if (objVendedores && typeof objVendedores === "object") {
      Object.values(objVendedores).forEach((v) => {
        // Adicionando um ID único, se não existir
        const codigoUnico = v.UnicID || gerarCodigoUnico(v.nome);

        if (v.nome && v.email) {
          vendedores.push({
            nome: v.nome,
            email: v.email,
            telefone: v.telefone || null,
            classificacao: v.Classificação || "Não Informado",
            "ReceberNotificação": v["ReceberNotificação"] || "False", // 👈 adiciona isso
            Bloqueado: v.Bloqueado || "False", // 👈 aqui!
            CodigoIndicacao: v.CodigoIndicacao || null, // 👈 só leitura!
            UnicID: codigoUnico,  // 👈 Agora tem o UnicID gerado ou obtido
          });
        }
      });
    }
  });

  return vendedores;
};
