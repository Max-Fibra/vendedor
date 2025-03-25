import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import styles from './VerificarIndicacoesPage.module.css';
import { buscarTodosRegistrosIndicacoes } from '../../services/indicacaoService';

const VerificarIndicacoesPage = () => {
  const [registros, setRegistros] = useState([]);
  const [abertos, setAbertos] = useState({});

  useEffect(() => {
    const carregarDados = async () => {
      const todos = await buscarTodosRegistrosIndicacoes();
      setRegistros(todos);
    };

    carregarDados();
  }, []);

  const toggle = (registroId, index) => {
    setAbertos(prev => ({
      ...prev,
      [`${registroId}-${index}`]: !prev[`${registroId}-${index}`]
    }));
  };

  return (
    <Layout vendedor={{ nome: "Administrador" }}>
      <div className={styles.container}>
        <h1 className={styles.titulo}>📋 Verificar Indicações</h1>

        {registros.map((registro) => (
          <div key={registro.Id} className={styles.vendedorBox}>
            <h2 className={styles.nomeVendedor}>🧑‍💼 {registro.Vendedor}</h2>

            {(registro.Json_Indicações?.indicacoes || []).map((ind, index) => {
              const chave = `${registro.Id}-${index}`;
              const statusCor =
                ind.status === "aprovado"
                  ? styles.statusAprovado
                  : ind.status === "negado"
                  ? styles.statusNegado
                  : styles.statusPendente;

              return (
                <details
                  key={index}
                  className={`${styles.card} ${styles.acordeon}`}
                  open={abertos[chave]}
                  onToggle={() => toggle(registro.Id, index)}
                >
                  <summary className={styles.tituloResumo}>
                    🧾 {ind.nome} — <span className={`${styles.status} ${statusCor}`}>{ind.status}</span>
                  </summary>

                  <div className={styles.cardContent}>
                    <p><strong>👤 Pessoa que Indicou:</strong> {ind.indicador}</p>
                    <p><strong>📞 Telefone do Indicador:</strong> {ind.telefoneIndicador}</p>

                    <hr className={styles.hr} />

                    <p><strong>🙋‍♂️ Indicado:</strong> {ind.nome}</p>
                    <p><strong>📱 Telefone do Indicado:</strong> {ind.telefone}</p>
                    <p><strong>📅 Data:</strong> {ind.data}</p>
                    <p><strong>📎 Protocolo:</strong> {ind.protocoloFicha || "—"}</p>

                    <div className={styles.extraInfo}>
                      <p>
                        <strong>📌 Status do Nome:</strong>{" "}
                        {ind.statusNome || "—"}
                      </p>

                      <p>
                        <strong>📍 Local Viável:</strong>{" "}
                        {ind.localViavel ? "Sim" : "Não"}
                      </p>

                      <p>
                        <strong>📝 Preencheu Ficha:</strong>{" "}
                        {ind.preencheuFicha ? "Sim" : "Não"}
                      </p>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default VerificarIndicacoesPage;
