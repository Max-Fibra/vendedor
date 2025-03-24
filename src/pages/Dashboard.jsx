import { useEffect, useState } from "react";
import { baixarJsonVendedor } from "../services/api";
import { buscarVendedorPorEmail } from "../services/vendedorService";
import Layout from "../components/Layout";
import styles from "./Dashboard.module.css";
import {
  getControlePorVendedor,
  createControleVendas,
  updateControleVendas
} from "../services/controleVendas";

import { buscarComissoes } from "../services/comissaoService";



import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";



const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro"
];

const Dashboard = () => {
  const [vendas, setVendas] = useState([]);
  const [vendedor, setVendedor] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [abertos, setAbertos] = useState({});
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const [buscaProtocolo, setBuscaProtocolo] = useState("");
  const [controle, setControle] = useState({});
  const [recordId, setRecordId] = useState(null);
  const [valoresComissao, setValoresComissao] = useState({});


  const ultimaAtualizacao = vendas.length
    ? vendas.map((v) => v.dataHora).sort().reverse()[0]
    : null;

  useEffect(() => {
    const vendedorSalvo = JSON.parse(localStorage.getItem("vendedor"));


    
    if (!vendedorSalvo || !vendedorSalvo.email) {
      window.location.href = "/";
      return;
    }

    setVendedor(vendedorSalvo);

    buscarVendedorPorEmail(vendedorSalvo.email).then((dadosCompletos) => {
      if (dadosCompletos?.Classificação) {
        setVendedor((prev) => ({
          ...prev,
          classificacao: dadosCompletos.Classificação
        }));
      }
    });
    buscarComissoes().then(({ comissoes }) => {
      setValoresComissao(comissoes);
    });

    const nomeSanitizado = vendedorSalvo.nome.toLowerCase().replace(/\s+/g, "_");
    const emailSanitizado = vendedorSalvo.email.toLowerCase().replace(/[@.]/g, "_");
    const nomeArquivo = `${nomeSanitizado}__${emailSanitizado}.json`;

    const carregarVendas = () => {
      fetch(baixarJsonVendedor(`/api/vendedor-json/${nomeArquivo}`))
        .then((res) => res.json())
        .then((dados) => {
          if (Array.isArray(dados)) setVendas(dados);
        })
        .catch(() => setVendas([]))
        .finally(() => setCarregando(false));
    };

    

    const carregarControle = async () => {
      const existente = await getControlePorVendedor(vendedorSalvo.nome);
      if (existente) {
        setControle(existente.DadosClientesVendedores || {});
        setRecordId(existente.Id);
      } else {
        const novo = await createControleVendas({
          Title: vendedorSalvo.nome,
          DadosClientesVendedores: {}
        });
        setControle({});
        setRecordId(novo.Id);
      }
    };

    

    carregarVendas();
    carregarControle();
    const interval = setInterval(carregarVendas, 500);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const vendedorSalvo = JSON.parse(localStorage.getItem("vendedor"));
  
    if (!vendedorSalvo || !vendedorSalvo.email) {
      window.location.href = "/";
      return;
    }
  
    const atualizarControle = async () => {
      try {
        const existente = await getControlePorVendedor(vendedorSalvo.nome);
        if (existente) {
          setControle(existente.DadosClientesVendedores || {});
          setRecordId(existente.Id);
        }
      } catch (erro) {
        console.error("Erro ao atualizar controle de vendas:", erro);
      }
    };
  
    atualizarControle(); // primeira chamada imediata
    const interval = setInterval(atualizarControle, 3000); // atualiza a cada 3 segundos
  
    return () => clearInterval(interval);
  }, []);
  

  
  const toggleAberto = (chave) => {
    setAbertos((prev) => {
      const jáEstáAberto = prev[chave];
      return jáEstáAberto ? {} : { [chave]: true };
    });
  };


  // 📄 Exportar para PDF
const exportarPDF = () => {
  const doc = new jsPDF();
  doc.text("Relatório de Vendas", 14, 16);

  const tabela = vendasFiltradas.map((venda) => {
    const statusCliente = controle[venda.cpf] || {};
    return [
      venda.nome,
      venda.cpf,
      venda.protocolo,
      venda.dataHora,
      `R$ ${calcularComissao(statusCliente).toFixed(2).replace(".", ",")}`,
    ];
  });

  autoTable(doc, {
    startY: 20,
    head: [["Nome", "CPF", "Protocolo", "Data", "Comissão"]],
    body: tabela,
  });

  doc.save(`relatorio-vendas-${vendedor?.nome || "vendedor"}.pdf`);
};

// 📊 Exportar para Excel
const exportarExcel = () => {
  const dados = vendasFiltradas.map((venda) => {
    const statusCliente = controle[venda.cpf] || {};
    return {
      Nome: venda.nome,
      CPF: venda.cpf,
      Protocolo: venda.protocolo,
      Data: venda.dataHora,
      Comissão: `R$ ${calcularComissao(statusCliente).toFixed(2).replace(".", ",")}`,
    };
  });

  const planilha = XLSX.utils.json_to_sheet(dados);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, planilha, "Relatório");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `relatorio-vendas-${vendedor?.nome || "vendedor"}.xlsx`);
};
  
  

  
  
  
  
  

  const filtrarVendas = () => {
    return vendas.filter((venda) => {
      const [dia, mes] = venda.dataHora.split(",")[0].split("/");
      const correspondeMes = mesSelecionado === "" || Number(mes) - 1 === Number(mesSelecionado);
      const correspondeBusca = venda.protocolo?.toLowerCase().includes(buscaProtocolo.toLowerCase());
      return correspondeMes && correspondeBusca;
    });
  };

  const calcularComissao = (status) => {
    const pagou = status["Pagou Taxa"] === "SIM";
    const ativo = status["Ativado"] === "SIM";
    const bloqueado = status["Bloqueado"] === "SIM";
    const desistiu = status["Desistiu"] === "SIM";
  
    // Se desistiu ou está bloqueado, sem comissão
    if (desistiu || bloqueado || !vendedor?.classificacao) return 0;
  
    // Se não pagou taxa mas está ativo, usar valor da classificação "Sem Taxa"
    if (!pagou && ativo) {
      const valorStr = valoresComissao?.["Sem Taxa"]?.valor || "R$ 0,00";
      const numero = parseFloat(valorStr.replace("R$", "").replace(",", ".").trim());
      return isNaN(numero) ? 0 : numero;
    }
  
    // Se pagou e está ativo, usar valor da classificação do vendedor
    if (pagou && ativo) {
      const valorStr = valoresComissao?.[vendedor.classificacao]?.valor || "R$ 0,00";
      const numero = parseFloat(valorStr.replace("R$", "").replace(",", ".").trim());
      return isNaN(numero) ? 0 : numero;
    }
  
    return 0;
  };
  
  
  const vendasFiltradas = filtrarVendas(); // <-- define antes de usar

  

  const totalComissoes = vendasFiltradas.reduce((total, venda) => {
    const statusCliente = controle[venda.cpf] || {};
    return total + calcularComissao(statusCliente);
  }, 0);
  


  const handleCheckboxChange = async (cpf, campo, checked) => {
    if (!recordId) {
      console.warn("Tentando salvar sem recordId ainda disponível!");
      return;
    }
  
    const atualizado = {
      ...controle,
      [cpf]: {
        ...controle[cpf],
        [campo]: checked ? "SIM" : "NAO"
      }
    };
    setControle(atualizado);
  
    await updateControleVendas(recordId, {
      DadosClientesVendedores: atualizado
    });
  };
  

  if (!vendedor) return null;
  if (carregando) return <div style={{ padding: "2rem" }}>🔄 Carregando...</div>;

  return (
    <Layout
    vendedor={vendedor}
    ultimaAtualizacao={ultimaAtualizacao}
    totalComissoes={totalComissoes} // <-- adiciona aqui
  >

    <p style={{ fontWeight: "bold", fontSize: "16px", margin: "0 0 1rem 0", color: "#0d1117" }}>
      🏅 Sua classificação:{" "}
      <span style={{ color: "#007bff" }}>{vendedor?.classificacao || "Não definida"}</span>
    </p>


      <div className={styles.container}>
        <div className={styles.filtros}>
          <div className={styles.filtroLinha}>
            <label className={styles.filtroLabel}>
              <span>📅</span> Filtro por mês:
              <select
                className={styles.select}
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(e.target.value)}
              >
                <option value="">Todos</option>
                {meses.map((mes, index) => (
                  <option key={index} value={index}>{mes}</option>
                ))}
              </select>
            </label>

            <label className={styles.filtroLabel}>
              <span>🔍</span> Buscar por protocolo:
              <input
                type="text"
                className={styles.input}
                placeholder="Digite o protocolo..."
                value={buscaProtocolo}
                onChange={(e) => setBuscaProtocolo(e.target.value)}
              />
            </label>

            <div className={styles.acoesRelatorio}>
              <button className={styles.botaoRelatorio} onClick={exportarPDF}>
                📄 Exportar PDF
              </button>
              <button className={styles.botaoRelatorio} onClick={exportarExcel}>
                📊 Exportar Excel
              </button>
            </div>


          </div>

          {mesSelecionado !== "" && (
            <p className={styles.totalMes}>
              ✅ <strong>{vendasFiltradas.length}</strong> vendas encontradas para <strong>{meses[mesSelecionado]}</strong>
            </p>
          )}
        </div>

        {vendasFiltradas.length === 0 ? (
          <p className={styles.emptyText}>Nenhuma venda registrada com esse filtro.</p>
        ) : (
          <div className={styles.grid}>
            {vendasFiltradas.map((venda, index) => {
              const chaveUnica = `${venda.cpf}_${venda.dataHora}`;
              const isOpen = abertos[chaveUnica] || false;
              const status = controle[venda.cpf] || {};

              return (
                <div key={chaveUnica} className={styles.cardWrapper}>
                <div className={styles.cardHeader} onClick={() => toggleAberto(chaveUnica)}>
                  <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <strong>{venda.nome}</strong>
                    {status?.Autorizado && (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor:
                            status.Autorizado === "APROVADO" ? "#d1fae5" :
                            status.Autorizado === "NEGADO" ? "#fee2e2" :
                            "#e5e7eb",
                          color:
                            status.Autorizado === "APROVADO" ? "#065f46" :
                            status.Autorizado === "NEGADO" ? "#991b1b" :
                            "#374151"
                        }}
                      >
                        {status.Autorizado}
                      </span>
                    )}
                  </span>
                  <span>{venda.dataHora}</span>
                </div>


                {isOpen && (
                  <div className={isOpen ? styles.cardBody : styles.cardBodyHidden}>
                    <>
                      <p><strong>Protocolo:</strong> {venda.protocolo}</p>
                      <p><strong>CPF:</strong> {venda.cpf}</p>
                      <p><strong>Telefone:</strong> {venda.telefone1}</p>

                      <p>
                        <strong>Comissão:</strong>{" "}
                        <span style={{ color: "#2e7d32" }}>
                          R$ {calcularComissao(status).toFixed(2).replace(".", ",")}
                        </span>
                      </p>

                      <div className={styles.checkboxGroup}>
                      {['Pagou Taxa', 'Bloqueado', 'Ativado', 'Desistiu'].map((campo) => {
                          const autorizado = status?.Autorizado;
                          const bloqueado = autorizado === "APROVADO" || autorizado === "NEGADO";

                          return (
                            <label key={campo}>
                              <input
                                type="checkbox"
                                checked={status[campo] === 'SIM'}
                                onChange={(e) => handleCheckboxChange(venda.cpf, campo, e.target.checked)}
                                disabled={bloqueado}
                              />{" "}
                              {campo}
                            </label>
                          );
                        })}

                      </div>
                    </>
                  </div>
                )}


                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;