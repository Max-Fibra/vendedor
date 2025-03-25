import React, { useEffect, useState } from 'react';
import { buscarRegistroPorCodigoIndicacao, atualizarIndicacoes } from '../../services/indicacaoService';

const FormularioIndicacao = () => {
  const [codigo, setCodigo] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [registro, setRegistro] = useState(null);

  const [indicador, setIndicador] = useState('');
  const [telefoneIndicador, setTelefoneIndicador] = useState('');
  const [nomeIndicado, setNomeIndicado] = useState('');
  const [telefoneIndicado, setTelefoneIndicado] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    // Suporte ao HashRouter com parâmetro ?codigo=
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    const cod = params.get('codigo');

    if (cod) {
      setCodigo(cod);

      const buscar = async () => {
        const registro = await buscarRegistroPorCodigoIndicacao(cod);
        if (registro) {
          setRegistro(registro);
          setVendedor(registro.Vendedor);
        } else {
          setMensagem('Código inválido ou não encontrado.');
        }
      };

      buscar();
    } else {
      setMensagem('Nenhum código informado na URL.');
    }
  }, []);

  const handleEnviar = async () => {
    if (!indicador || !telefoneIndicador || !nomeIndicado || !telefoneIndicado) {
      setMensagem('Preencha todos os campos.');
      return;
    }

    if (!registro) {
      setMensagem('Erro: registro do vendedor não carregado.');
      return;
    }

    const novaIndicacao = {
      vendedor,
      indicador,
      nome: nomeIndicado,
      telefone: telefoneIndicado,
      status: 'pendente',
      data: new Date().toLocaleDateString('pt-BR'),
    };

    const listaAtual = registro?.Json_Indicações?.indicacoes || [];
    const novaLista = [...listaAtual, novaIndicacao];

    await atualizarIndicacoes(registro.Id, novaLista);
    setMensagem('✅ Indicação enviada com sucesso!');
    setIndicador('');
    setTelefoneIndicador('');
    setNomeIndicado('');
    setTelefoneIndicado('');
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📨 Formulário de Indicação</h1>

      {mensagem && (
        <p className={`mb-4 font-semibold ${mensagem.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>
          {mensagem}
        </p>
      )}

      {vendedor && (
        <p className="mb-4 text-gray-700">
          Vendedor responsável: <strong>{vendedor}</strong>
        </p>
      )}

      <div className="mb-3">
        <label className="block text-sm font-medium">Seu nome</label>
        <input
          className="w-full border px-3 py-2 rounded"
          value={indicador}
          onChange={(e) => setIndicador(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium">Seu telefone</label>
        <input
          className="w-full border px-3 py-2 rounded"
          value={telefoneIndicador}
          onChange={(e) => setTelefoneIndicador(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium">Nome do indicado</label>
        <input
          className="w-full border px-3 py-2 rounded"
          value={nomeIndicado}
          onChange={(e) => setNomeIndicado(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium">Telefone do indicado</label>
        <input
          className="w-full border px-3 py-2 rounded"
          value={telefoneIndicado}
          onChange={(e) => setTelefoneIndicado(e.target.value)}
        />
      </div>

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        onClick={handleEnviar}
      >
        Enviar Indicação
      </button>
    </div>
  );
};

export default FormularioIndicacao;
