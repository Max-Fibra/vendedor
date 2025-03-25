import React, { useEffect, useState } from 'react';
import { buscarVendedorPorEmail } from '../../services/vendedorService';
import {
  criarOuAtualizarRegistroIndicacao,
  buscarUnicIDPorVendedor,
  buscarRegistroPorCodigoIndicacao
} from '../../services/indicacaoService';

import Layout from '../../components/Layout';
import { Link2, ClipboardList, Megaphone } from 'lucide-react';
import styles from './IndicacoesPage.module.css';

const IndicacoesPage = () => {
  const [vendedor, setVendedor] = useState(null);
  const [codigoLink, setCodigoLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [registro, setRegistro] = useState(null);

  useEffect(() => {
    const vendedorSalvo = JSON.parse(localStorage.getItem("vendedor"));
    if (!vendedorSalvo || !vendedorSalvo.email) {
      window.location.href = "/";
      return;
    }

    const carregarVendedor = async () => {
      const dados = await buscarVendedorPorEmail(vendedorSalvo.email);
      if (dados) {
        setVendedor(dados);

        const codigoExistente = await buscarUnicIDPorVendedor(dados.nome);
        if (codigoExistente) {
          setCodigoLink(`${window.location.origin}/indicar?codigo=${codigoExistente}`);

          const registroCompleto = await buscarRegistroPorCodigoIndicacao(codigoExistente);
          setRegistro(registroCompleto);
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
    setCodigoLink(`${window.location.origin}/#/indicar?codigo=${codigo}`)


    // Atualiza o registro após criar novo código
    const registroCompleto = await buscarRegistroPorCodigoIndicacao(novoCodigo);
    setRegistro(registroCompleto);

    setLoading(false);
  };

  useEffect(() => {
    if (!vendedor) return;
  
    const interval = setInterval(async () => {
      try {
        const codigoExistente = await buscarUnicIDPorVendedor(vendedor.nome);
        if (codigoExistente) {
          const registroAtualizado = await buscarRegistroPorCodigoIndicacao(codigoExistente);
          setRegistro(registroAtualizado);
        }
      } catch (err) {
        console.error("Erro ao atualizar contador de cliques:", err);
      }
    }, 300); // Atualiza a cada 5 segundos
  
    return () => clearInterval(interval); // Limpeza ao desmontar
  }, [vendedor]);
  
  

  // Quantidade de indicações registradas
  // Pega o valor real salvo no campo separado
  const totalCliques = registro?.ContadorCliques || 0;


  return (
    <Layout vendedor={vendedor}>
      <div className={styles.container}>
        <h1 className={styles.titulo}>
          <Megaphone size={24} className="text-pink-600" />
          Indicações
        </h1>

        <div className={styles.grid}>
          {/* Card do link */}
          <div className={styles.card}>
            <h2><Link2 size={18} /> Link de Indicação</h2>

            {!codigoLink ? (
              <>
                <p>Clique no botão abaixo para gerar seu link único de indicação.</p>
                <button
                  onClick={gerarLink}
                  disabled={loading}
                  className={`${styles.botao} ${styles.botaoVerde}`}
                >
                  {loading ? 'Gerando...' : 'Gerar Link de Indicação'}
                </button>
              </>
            ) : (
              <>
                <p>Você já tem um link gerado.</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codigoLink);
                    alert("Link copiado para a área de transferência! ✅");
                  }}
                  className={styles.botao}
                  title={codigoLink}
                >
                  📋 Copiar Link de Indicação
                </button>
                <p><strong>Cliques:</strong> {totalCliques}</p>
              </>
            )}
          </div>

          {/* Card de histórico */}
          <div className={styles.card}>
            <h2><ClipboardList size={18} /> Minhas Indicações</h2>
            <p>Veja o histórico de quem já foi indicado.</p>
            <button
              onClick={() => window.location.href = '/indicacoes/minhas'}
              className={styles.botao}
            >
              Ver Minhas Indicações
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IndicacoesPage;
