import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_NOCODB_URL + "/api/v2",
  headers: {
    "xc-token": process.env.REACT_APP_NOCODB_TOKEN,
    "Content-Type": "application/json",
  },
});





export const buscarTodosVendedores = async () => {
  const { data } = await api.get("/tables/m3cqlvi5625ahqs/records");

  const vendedores = [];

  data.list.forEach((item) => {
    const objVendedores = item.Vendedor;

    if (objVendedores && typeof objVendedores === 'object') {
      Object.values(objVendedores).forEach((v) => {
        if (v.nome && v.email) {
          vendedores.push({
            nome: v.nome,
            email: v.email,
          });
        }
      });
    }
  });

  return vendedores;
};
