import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_NOCODB_URL + '/api/v2',
  headers: {
    'xc-token': process.env.REACT_APP_NOCODB_TOKEN,
  },
});

export const buscarVendedores = async () => {
    try {
      const res = await api.get('/tables/m3cqlvi5625ahqs/records');
      const todos = [];
  
      res.data.list.forEach((row) => {
        const vendedoresObj = row.Vendedor; // já é um objeto!
  
        if (typeof vendedoresObj === "object" && vendedoresObj !== null) {
          Object.values(vendedoresObj).forEach((v) => {
            if (v?.email) {
              todos.push({
                nome: v.nome || "Sem Nome",
                email: v.email,
              });
            }
          });
        }
      });
  
      return todos;
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
      return [];
    }
  };
  
  