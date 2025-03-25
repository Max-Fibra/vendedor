import React, { useEffect, useState } from 'react';
import { buscarVendedorPorEmail } from '../../services/vendedorService';
import {
  criarOuAtualizarRegistroIndicacao,
  buscarUnicIDPorVendedor
} from '../../services/indicacaoService';

const IndicacoesPage = () => {
  const [vendedor, setVendedor] = useState(null);
  const [codigoLink, setCodigoLink] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔐 Simula o vendedor logado a partir do localStorage
  useEffect(() => {
    const email = localStorage.getItem('email');
    if (!email) {
      setCodigoLink(''); // Limpar o código se não tiver vendedor
      return;
    }

    const carregarVendedor = async () => {
      const dados = await buscarVendedorPorEmail(email);
      if (dados) {
        setVendedor(dados);

        const codigoExistente = await buscarUnicIDPorVendedor(dados.nome);
        if (codigoExistente) {
          // Se já tiver código, apenas gera o link
          setCodigoLink(`${window.location.origin}/indicar?codigo=${codigoExistente}`);
        }
      }
    };

    carregarVendedor();
  }, []);

  const gerarLink = async () => {
    if (!vendedor) return;

    setLoading(true);
    const novoCodigo = `${vendedor.nome.toLowerCase().replace(/\s/g, '')}-${Math.random().toString(36).substring(2, 8)}`;

    await criarOuAtualizarRegistroIndicacao(vendedor.nome, novoCodigo);
    setCodigoLink(`${window.location.origin}/indicar?codigo=${novoCodigo}`);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">📢 Indicações</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1 - Link ou botão */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-bold mb-2">🔗 Link de Indicação</h2>

          {!codigoLink ? (
            <>
              <p className="text-sm text-gray-600 mb-4">Clique abaixo para gerar seu link único de indicação.</p>
              <button
                onClick={gerarLink}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                {loading ? 'Gerando...' : 'Gerar Link'}
              </button>
            </>
          ) : (
            <div className="text-sm mt-2">
              <p>Seu link:</p>
              <a
                href={codigoLink}
                className="text-blue-600 underline break-all"
                target="_blank"
                rel="noreferrer"
              >
                {codigoLink}
              </a>
            </div>
          )}
        </div>

        {/* Card 2 - Minhas Indicações */}
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-bold mb-2">📋 Minhas Indicações</h2>
          <p className="text-sm text-gray-600 mb-4">Veja o histórico de quem você indicou.</p>
          <button
            onClick={() => window.location.href = '/indicacoes/minhas'}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
          >
            Ver Minhas Indicações
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndicacoesPage;
