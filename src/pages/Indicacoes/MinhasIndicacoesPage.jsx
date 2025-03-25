import React, { useEffect, useState } from 'react';
import { buscarRegistroPorVendedor, atualizarIndicacoes } from '../../services/indicacaoService';
import Layout from '../../components/Layout';
import styles from './MinhasIndicacoesPage.module.css';
import { baixarJsonVendedor } from "../../services/api";
import { getControlePorVendedor } from "../../services/controleVendas";


const MinhasIndicacoesPage = () => {
  const [vendedor, setVendedor] = useState(null);
  const [indicacoes, setIndicacoes] = useState([]);
  const [registroId, setRegistroId] = useState(null);
  const [mostrarIndicador, setMostrarIndicador] = useState({});
  const [protocolosDasVendas, setProtocolosDasVendas] = useState([]);
  const [dadosVendas, setDadosVendas] = useState([]);
  const [controleVendas, setControleVendas] = useState({});



  useEffect(() => {
    const vendedorSalvo = JSON.parse(localStorage.getItem("vendedor"));
    if (!vendedorSalvo || !vendedorSalvo.nome) {
      window.location.href = "/";
      return;
    }

    setVendedor(vendedorSalvo);

    const carregarProtocolos = async (vendedor) => {
        const nomeSanitizado = vendedor.nome.toLowerCase().replace(/\s+/g, "_");
        const emailSanitizado = vendedor.email.toLowerCase().replace(/[@.]/g, "_");
        const nomeArquivo = `${nomeSanitizado}__${emailSanitizado}.json`;
      
        try {
          const res = await fetch(baixarJsonVendedor(`/api/vendedor-json/${nomeArquivo}`));
          const vendas = await res.json();
          const protocolos = vendas.map(v => v.protocolo);
          setProtocolosDasVendas(protocolos);
        } catch (err) {
          console.error("Erro ao buscar protocolos:", err);
          setProtocolosDasVendas([]);
        }
      };

    const carregarIndicacoes = async () => {
      const registro = await buscarRegistroPorVendedor(vendedorSalvo.nome);
      const lista = registro?.Json_Indicações?.indicacoes || [];
      setRegistroId(registro.Id);
      setIndicacoes(lista);
      setVendedor(vendedorSalvo);
        carregarProtocolos(vendedorSalvo);

    };

    const carregarDadosDasVendas = async () => {
        const nomeSanitizado = vendedorSalvo.nome.toLowerCase().replace(/\s+/g, "_");
        const emailSanitizado = vendedorSalvo.email.toLowerCase().replace(/[@.]/g, "_");
        const nomeArquivo = `${nomeSanitizado}__${emailSanitizado}.json`;
      
        try {
          const res = await fetch(baixarJsonVendedor(`/api/vendedor-json/${nomeArquivo}`));
          const vendas = await res.json();
          setDadosVendas(vendas || []);
          const controle = await getControlePorVendedor(vendedorSalvo.nome);
          setControleVendas(controle?.DadosClientesVendedores || {});
        } catch (err) {
          console.error("Erro ao carregar vendas:", err);
        }
      };
      

    carregarIndicacoes();
    carregarDadosDasVendas();

  }, []);

  useEffect(() => {
    if (!indicacoes || indicacoes.length === 0 || !registroId) return;
  
    const novasIndicacoes = indicacoes.map((ind) => {
      const novoStatus = obterStatusDaVendaPorProtocolo(ind.protocoloFicha);
      return {
        ...ind,
        status: novoStatus || "pendente",
      };
    });
  
    // Só atualiza se houver alguma diferença real
    const houveMudanca = novasIndicacoes.some((nova, i) => nova.status !== indicacoes[i].status);
    if (houveMudanca) {
      setIndicacoes(novasIndicacoes); // atualiza no estado local
      atualizarIndicacoes(registroId, novasIndicacoes); // salva no NocoDB
    }
  }, [dadosVendas, controleVendas]);

  useEffect(() => {
    const interval = setInterval(() => {
      const vendedorSalvo = JSON.parse(localStorage.getItem("vendedor"));
      if (!vendedorSalvo || !vendedorSalvo.nome) return;
  
      const nomeSanitizado = vendedorSalvo.nome.toLowerCase().replace(/\s+/g, "_");
      const emailSanitizado = vendedorSalvo.email.toLowerCase().replace(/[@.]/g, "_");
      const nomeArquivo = `${nomeSanitizado}__${emailSanitizado}.json`;
  
      // Atualiza vendas
      fetch(baixarJsonVendedor(`/api/vendedor-json/${nomeArquivo}`))
        .then((res) => res.json())
        .then((vendas) => setDadosVendas(vendas || []))
        .catch((err) => console.error("Erro ao atualizar vendas:", err));
  
      // Atualiza controle
      getControlePorVendedor(vendedorSalvo.nome)
        .then((controle) => {
          setControleVendas(controle?.DadosClientesVendedores || {});
        })
        .catch((err) => console.error("Erro ao atualizar controle:", err));
    }, 300); // ⏱ a cada 10 segundos
  
    return () => clearInterval(interval); // limpa o intervalo ao desmontar
  }, []);
  
  


  const obterStatusDaVendaPorProtocolo = (protocoloFicha) => {
    const venda = dadosVendas.find((v) => v.protocolo === protocoloFicha);
    if (!venda) return "pendente";
  
    const status = controleVendas[venda.cpf] || {};
    return status.Autorizado?.toLowerCase() || "pendente";
  };
  

  const toggleIndicador = (index) => {
    setMostrarIndicador(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  

  const handleCheckboxChange = (index, campo, valor) => {
    const novasIndicacoes = [...indicacoes];
    novasIndicacoes[index][campo] = valor;
    setIndicacoes(novasIndicacoes);

    // Salva no backend
    atualizarIndicacoes(registroId, novasIndicacoes);
  };

  return (
    <Layout vendedor={vendedor}>
      <div className={styles.container}>
        <h1 className={styles.titulo}>📋 Minhas Indicações</h1>

        {indicacoes.length === 0 ? (
          <p className={styles.vazio}>Nenhuma indicação registrada ainda.</p>
        ) : (
          <ul className={styles.lista}>
            {indicacoes.map((ind, index) => (
                <details className={`${styles.card} ${styles.acordeon}`}>
                    <summary className={styles.resumoLinha}>
                    <div className={styles.resumoEsquerda}>
                        <span className={styles.tituloResumo}>
                        🧾 {ind.nome} —{" "}
                        <span className={`${styles.status} ${styles[obterStatusDaVendaPorProtocolo(ind.protocoloFicha).toLowerCase()]}`}>
                            {obterStatusDaVendaPorProtocolo(ind.protocoloFicha)}
                        </span>
                        </span>
                    </div>

                    <div className={styles.resumoDireita}>
                        <strong>Status da Ficha:</strong>{" "}
                        <span
                        style={{
                            color:
                            obterStatusDaVendaPorProtocolo(ind.protocoloFicha) === "aprovado"
                                ? "green"
                                : obterStatusDaVendaPorProtocolo(ind.protocoloFicha) === "negado"
                                ? "red"
                                : "gray",
                            fontWeight: "bold",
                        }}
                        >
                        {obterStatusDaVendaPorProtocolo(ind.protocoloFicha)}
                        </span>
                    </div>
                    </summary>



            <div className={styles.cardContent}>
                <button className={styles.botaoIndicador} onClick={() => toggleIndicador(index)}>
                {mostrarIndicador[index] ? '👤 Ocultar quem indicou' : '👤 Mostrar quem indicou'}
                </button>

                {mostrarIndicador[index] && (
                <div className={styles.indicadorBox}>
                    <p><strong>👤 Pessoa que Indicou:</strong> {ind.indicador}</p>
                    <p><strong>📞 Telefone do Indicador:</strong> {ind.telefoneIndicador}</p>
                </div>
                )}

                <div className={styles.indicadoBox}>
                <p><strong>🙋‍♂️ Indicado:</strong> {ind.nome}</p>
                <p><strong>📱 Telefone do Indicado:</strong> {ind.telefone}</p>
                <p><strong>📌 Status:</strong> {ind.status}</p>
                <p><strong>📅 Data:</strong> {ind.data}</p>
                </div>

                <div className={styles.checkboxes}>
                    <label>
                        <input
                        type="checkbox"
                        checked={ind.preencheuFicha || false}
                        onChange={(e) => handleCheckboxChange(index, 'preencheuFicha', e.target.checked)}
                        /> Preencheu Ficha
                    </label>
                    
                    {/* Campo "Protocolo da Ficha" aparece somente se "Preencheu Ficha" estiver marcado */}
                    {ind.preencheuFicha && (
                        <div className={styles.protocoloBox}>
                        <label htmlFor={`protocolo-${index}`}>Protocolo da Ficha:</label>
                        <input
                            id={`protocolo-${index}`}
                            type="text"
                            placeholder="Ex: MX-20250325-0012"
                            value={ind.protocoloFicha || ""}
                            onChange={(e) => handleCheckboxChange(index, 'protocoloFicha', e.target.value)}
                            className={styles.protocoloInput}
                        />
                        {ind.preencheuFicha && ind.protocoloFicha && (
                        <p className={styles.verificacaoProtocolo}>
                            {protocolosDasVendas.includes(ind.protocoloFicha)
                            ? "✅ Protocolo encontrado"
                            : "❌ Protocolo não encontrado"}
                        </p>
                        )}

                        </div>
                    )}

                    <label>
                        <input
                        type="checkbox"
                        checked={ind.localViavel || false}
                        onChange={(e) => handleCheckboxChange(index, 'localViavel', e.target.checked)}
                        /> Local Viável
                    </label>
                    
                    <label>
                        Status do Nome:
                        <select
                        value={ind.statusNome || ''}
                        onChange={(e) => handleCheckboxChange(index, 'statusNome', e.target.value)}
                        >
                        <option value="">--</option>
                        <option value="LIMPO">LIMPO</option>
                        <option value="NEGATIVADO">NEGATIVADO</option>
                        </select>
                    </label>
                    </div>

            </div>
            </details>

              

            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default MinhasIndicacoesPage;