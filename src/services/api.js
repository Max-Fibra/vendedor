import axios from 'axios';

const api = axios.create({
  baseURL: 'https://max.api.email.nexusnerds.com.br',
});

export const listarVendedores = async () => {
  const res = await api.get('/api/vendedores');
  return res.data;
};

export const baixarJsonVendedor = (urlRelativa) => {
  return `${api.defaults.baseURL}${urlRelativa}`;
};
