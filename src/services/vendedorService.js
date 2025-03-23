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






export const buscarTodosVendedores = buscarVendedores;
