import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_NOCODB_URL + "/api/v2",
  headers: {
    "xc-token": process.env.REACT_APP_NOCODB_TOKEN,
    "Content-Type": "application/json",
  },
});





export const buscarVendedores = async () => {
  const { data } = await api.get("/tables/m3cqlvi5625ahqs/records");

  const vendedores = [];

  data.list.forEach((item) => {
    const objVendedores = item.Vendedor;

    if (objVendedores && typeof objVendedores === "object") {
      Object.values(objVendedores).forEach((v) => {
        //console.log("🧩 Vendedor bruto:", v); // 👀 confere aqui
       

        if (v.nome && v.email) {
          vendedores.push({
            nome: v.nome,
            email: v.email,
            telefone: v.telefone || null,
            classificacao: v.Classificação || "Não Informado",
            "ReceberNotificação": v["ReceberNotificação"] || "False", // 👈 adiciona isso
             Bloqueado: v.Bloqueado || "False", // 👈 aqui!
             CodigoIndicacao: v.CodigoIndicacao || null // 👈 só leitura!
          });
        }
      });
    }
  });

  return vendedores;
};



export const atualizarCampoVendedor = async (email, campo, valor) => {
  const { data } = await api.get("/tables/m3cqlvi5625ahqs/records");
  const registros = data.list;

  for (const item of registros) {
    const objVendedores = item.Vendedor;
    const recordId = item.Id;

    if (objVendedores && typeof objVendedores === "object") {
      for (const chave in objVendedores) {
        const v = objVendedores[chave];

        if (v.email === email) {
          objVendedores[chave][campo] = valor;

          await api.patch("/tables/m3cqlvi5625ahqs/records", {
            Id: recordId, // 👈 NocoDB exige isso no body
            Vendedor: objVendedores,
          });

          return true;
        }
      }
    }
  }

  return false;
};


export const buscarVendedorPorEmail = async (email) => {
  const { data } = await api.get("/tables/m3cqlvi5625ahqs/records");
  const registros = data.list;

  for (const item of registros) {
    const objVendedores = item.Vendedor;

    if (objVendedores && typeof objVendedores === "object") {
      for (const chave in objVendedores) {
        const v = objVendedores[chave];
        if (v.email === email) {
          return v;
        }
      }
    }
  }

  return null;
};


export const criarNovoVendedor = async ({ nome, email, telefone }) => {
  const { data } = await api.get("/tables/m3cqlvi5625ahqs/records");

  const item = data.list[0];
  const recordId = item.Id;
  const objVendedores = item.Vendedor || {};

  const novaChave = `vendedor${Object.keys(objVendedores).length + 1}`;
  const codigoUnico = `${nome.toLowerCase().replace(/\s+/g, "")}-${Math.random().toString(36).substring(2, 8)}`;

  objVendedores[novaChave] = {
    nome,
    email,
    telefone,
    Classificação: "Sem classificação",
    "ReceberNotificação": "False",
    CodigoIndicacao: codigoUnico, // 👈 salva aqui
    UnicID: codigoUnico, // 👈 também salva o UnicID
  };

  await api.patch("/tables/m3cqlvi5625ahqs/records", {
    Id: recordId,
    Vendedor: objVendedores
  });
};









export const buscarTodosVendedores = buscarVendedores;
