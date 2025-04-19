// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import Layout from "../components/Layout";
import { getControleVendas, updateControleVendas } from "../services/controleVendas";
import { baixarJsonVendedor } from "../services/api";
import { buscarTodosVendedores } from "../services/vendedorService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { enviarStatusVenda } from "../services/notificacaoService";
import CustomModal from "../components/CustomModal";
import { buscarComissoes } from "../services/comissaoService";
import { buscarTodosRegistrosIndicacoes, atualizarIndicacoes } from "../services/indicacaoService";






const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
];

const calcularComissao = (status, classificacao, valoresComissao) => {
    const pagou = status["Pagou Taxa"] === "SIM";
    const ativo = status["Ativado"] === "SIM";
    const bloqueado = status["Bloqueado"] === "SIM";
    const desistiu = status["Desistiu"] === "SIM";
  
    if (desistiu || bloqueado || !classificacao) return 0;
  
    if (!pagou && ativo) {
      const valorStr = valoresComissao?.["Sem Taxa"]?.valor || "R$ 0,00";
      const numero = parseFloat(valorStr.replace("R$", "").replace(",", ".").trim());
      return isNaN(numero) ? 0 : numero;
    }
  
    if (pagou && ativo) {
      const valorStr = valoresComissao?.[classificacao]?.valor || "R$ 0,00";
      const numero = parseFloat(valorStr.replace("R$", "").replace(",", ".").trim());
      return isNaN(numero) ? 0 : numero;
    }
  
    return 0;
  };
  

const AdminDashboard = () => {
    const [vendas, setVendas] = useState([]);
    const [controle, setControle] = useState({});
    const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
    const [carregando, setCarregando] = useState(true)
    const [acordesAbertos, setAcordesAbertos] = useState({});
    const [vendasAbertas, setVendasAbertas] = useState({});
    const [buscaProtocolo, setBuscaProtocolo] = useState("");
    const [hover, setHover] = useState(false);
    const [modal, setModal] = useState({ open: false, title: "", message: "", type: "success" });
    const [valoresComissao, setValoresComissao] = useState({});




    const atualizarStatus = async (vendedor, cpf, campo, valor) => {
        try {
          const controleDoVendedor = controle[vendedor] || {};
          const statusAtual = controleDoVendedor[cpf] || {};
          const novoStatus = {
            ...statusAtual,
            [campo]: typeof valor === "boolean" ? (valor ? "SIM" : "NÃO") : valor, // trata booleano ou string diretamente
          };
      
          const controleCompleto = await getControleVendas();
          const registro = controleCompleto.find(c => c.Title === vendedor);
      
          if (registro) {
            const atualizacao = {
              DadosClientesVendedores: {
                ...registro.DadosClientesVendedores,
                [cpf]: novoStatus,
              },
            };
      
            await updateControleVendas(registro.Id, atualizacao);
      
            setControle(prev => ({
              ...prev,
              [vendedor]: {
                ...(prev[vendedor] || {}),
                [cpf]: novoStatus,
              },
            }));
          }
        } catch (erro) {
          console.error("Erro ao atualizar status:", erro);
        }
      };
      

        // fora do useEffect (dentro do componente AdminDashboard)
        const carregarTodosJSONs = async () => {
            try {
            const vendedores = await buscarTodosVendedores();
            const controleGeral = await getControleVendas();
        
            const novasVendas = [];
            const controleMapeado = {};
            const { comissoes } = await buscarComissoes(); // 👈 aqui
        
            for (const vendedor of vendedores) {
                const nomeSanitizado = vendedor.nome.toLowerCase().replace(/\s+/g, "_");
                const emailSanitizado = vendedor.email.toLowerCase().replace(/[@.]/g, "_");
                const nomeArquivo = `${nomeSanitizado}__${emailSanitizado}.json`;
        
                try {
                const res = await fetch(baixarJsonVendedor(`/api/vendedor-json/${nomeArquivo}`));
                const dados = await res.json();
        
                if (Array.isArray(dados)) {
                    vendedor.classificacao = vendedor.classificacao || "Sem classificação";
                    dados.forEach(v => {
                      v.vendedor = vendedor.nome;
                      v.classificacao = vendedor.classificacao;
                    });

                    novasVendas.push(...dados);
        
                    const controleDoVendedor = controleGeral.find(c => c.Title === vendedor.nome);
                    controleMapeado[vendedor.nome] = controleDoVendedor?.DadosClientesVendedores || {};
                }
                } catch (erro) {
                console.warn("Erro ao carregar JSON de:", nomeArquivo, erro);
                }
            }
        
            setVendas(novasVendas);
            setControle(controleMapeado);
            setCarregando(false);
            setValoresComissao(comissoes);
            } catch (erro) {
            console.error("Erro ao buscar vendedores ou JSONs:", erro);
            }
        };
  

        useEffect(() => {
            carregarTodosJSONs();
          
            const intervalo = setInterval(() => {
              carregarTodosJSONs();
            }, 300); // 3 segundos
          
            return () => clearInterval(intervalo); // limpa ao desmontar
          }, []);
          

  const filtrarVendas = () => {
    return vendas.filter((venda) => {
      const [dia, mes] = venda.dataHora.split(",")[0].split("/");
      const correspondeMes = mesSelecionado === "" || Number(mes) - 1 === Number(mesSelecionado);
      const correspondeBusca = venda.protocolo?.toLowerCase().includes(buscaProtocolo.toLowerCase());
      return correspondeMes && correspondeBusca;
    });
  };

    const vendasFiltradas = filtrarVendas();
            const totalComissoes = vendasFiltradas.reduce((total, venda) => {
            const status = controle[venda.vendedor]?.[venda.cpf] || {};
            return total + calcularComissao(status, venda.classificacao, valoresComissao);
            }, 0);

    const exportarPDF = () => {
        const doc = new jsPDF();
        doc.text("Relatório Geral de Vendas", 14, 16);
        const tabela = vendasFiltradas.map((venda) => {
            const status = controle[venda.vendedor]?.[venda.cpf] || {};
            return [
                venda.vendedor,
                venda.nome,
                venda.cpf,
                venda.protocolo,
                venda.dataHora,
                `R$ ${calcularComissao(status, venda.classificacao, valoresComissao).toFixed(2).replace(".", ",")}`,
            ];
        });
        autoTable(doc, {
            startY: 20,
            head: [["Vendedor", "Nome", "CPF", "Protocolo", "Data", "Comissão"]],
            body: tabela,
        });
        doc.save("relatorio-vendas-geral.pdf");
    };

    const exportarExcel = () => {
        const dados = vendasFiltradas.map((venda) => {
            const status = controle[venda.vendedor]?.[venda.cpf] || {};
            return {
                Vendedor: venda.vendedor,
                Nome: venda.nome,
                CPF: venda.cpf,
                Protocolo: venda.protocolo,
                Data: venda.dataHora,
                Comissão: `R$ ${calcularComissao(status, venda.classificacao, valoresComissao).toFixed(2).replace(".", ",")}`,
            };
        });
        const planilha = XLSX.utils.json_to_sheet(dados);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, planilha, "Relatório");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "relatorio-vendas-geral.xlsx");
    };


    const toggleAccordion = (vendedor) => {
        setAcordesAbertos((prev) => ({
            ...prev,
            [vendedor]: !prev[vendedor],
        }));
    };

    const toggleVenda = (protocolo) => {
        setVendasAbertas((prev) => ({
          ...prev,
          [protocolo]: !prev[protocolo],
        }));
      };

      const atualizarStatusDaIndicacaoPorProtocolo = async (protocolo, novoStatus) => {
        const registros = await buscarTodosRegistrosIndicacoes();
      
        for (const registro of registros) {
          const indicacoes = registro.Json_Indicações?.indicacoes || [];
      
          const encontrou = indicacoes.find(ind => ind.protocoloFicha === protocolo);
          if (encontrou) {
            const novasIndicacoes = indicacoes.map(ind => {
              if (ind.protocoloFicha === protocolo) {
                return { ...ind, status: novoStatus.toLowerCase() };
              }
              return ind;
            });
      
            await atualizarIndicacoes(registro.Id, novasIndicacoes);
            //console.log(`✅ Indicação com protocolo ${protocolo} atualizada para ${novoStatus}`);
            break;
          }
        }
      };
      
      
      

    


    return (
        <>


        <Layout vendedor={{ nome: "Administrador" }} ultimaAtualizacao={null} totalComissoes={totalComissoes}>
            
            <div className={styles.container}>
                <div className={styles.filtroLinha}>
                    <label>
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

                <div className={styles.grid}>
                    {Object.entries(
                        vendasFiltradas.reduce((acc, venda) => {
                        if (!acc[venda.vendedor]) acc[venda.vendedor] = [];
                        acc[venda.vendedor].push(venda);
                        return acc;
                        }, {})
                    ).map(([vendedor, vendasDoVendedor]) => (
                        <div key={vendedor} className={styles.vendedorBloco}>
                        <button
                            onClick={() => toggleAccordion(vendedor)}
                            style={{
                            background: "#f3f3f3",
                            border: "1px solid #ccc",
                            padding: "12px 20px",
                            width: "100%",
                            textAlign: "left",
                            fontSize: "18px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            }}
                        >
                            <span>
                            {acordesAbertos[vendedor] ? "🔽" : "▶️"} {vendedor}
                            </span>
                            <span style={{ fontSize: "14px", fontWeight: "normal", color: "#666" }}>
                            {vendasDoVendedor.length} venda{vendasDoVendedor.length === 1 ? "" : "s"}
                            </span>
                        </button>

                        {acordesAbertos[vendedor] && (
                            <div style={{ marginTop: 12 }}>
                            {vendasDoVendedor.map((venda, i) => {
                                const status = controle[venda.vendedor]?.[venda.cpf] || {};

                                return (
                                    <div key={i} className={styles.cardWrapper}>
                                    <div
                                        onClick={() => toggleVenda(venda.protocolo)}
                                        style={{
                                        backgroundColor: "#f9f9f9",
                                        padding: "12px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #ddd",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <strong className={styles.nomeCliente} title={venda.nome}>
                                        {venda.nome}
                                        </strong>



                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            {status.Autorizado === "APROVADO" ? (
                                                <button
                                                style={{
                                                    backgroundColor: "#0d6efd",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    padding: "4px 10px",
                                                    fontSize: "12px",
                                                    cursor: "pointer",
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    atualizarStatus(venda.vendedor, venda.cpf, "Autorizado", null); // reabre
                                                    atualizarStatusDaIndicacaoPorProtocolo(venda.protocolo, "aprovado");
                                                }}
                                                >
                                                🔁 Reabrir
                                                </button>
                                            ) : status.Autorizado === "NEGADO" ? (
                                                <button
                                                style={{
                                                    backgroundColor: "#ffc107",
                                                    color: "#000",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    padding: "4px 10px",
                                                    fontSize: "12px",
                                                    cursor: "pointer",
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    atualizarStatus(venda.vendedor, venda.cpf, "Autorizado", null); // reanalisa
                                                    atualizarStatusDaIndicacaoPorProtocolo(venda.protocolo, "negado");
                                                }}
                                                >
                                                🔄 Reanalisar
                                                </button>
                                            ) : (
                                                <>
                                                <button
                                                    style={{
                                                    backgroundColor: "#048010",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    padding: "4px 10px",
                                                    fontSize: "12px",
                                                    cursor: "pointer",
                                                    }}
                                                    onClick={(e) => {
                                                    e.stopPropagation();
                                                    atualizarStatus(venda.vendedor, venda.cpf, "Autorizado", "APROVADO");
                                                    }}
                                                >
                                                    ✅ Aprovar
                                                </button>

                                                <button
                                                    style={{
                                                    backgroundColor: "rgb(18 18 18)",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    padding: "4px 10px",
                                                    fontSize: "12px",
                                                    cursor: "pointer",
                                                    }}
                                                    onClick={(e) => {
                                                    e.stopPropagation();
                                                    atualizarStatus(venda.vendedor, venda.cpf, "Autorizado", "NEGADO");
                                                    }}
                                                >
                                                    ❌ Negar
                                                </button>
                                                </>
                                            )}
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span>
                                            {vendasAbertas[venda.protocolo] ? "🔽" : "▶️"}{" "}
                                            <span className={styles.dataHora}>{venda.dataHora}</span>
                                            </span>


                                            {["APROVADO", "NEGADO"].includes(status.Autorizado) && (
                                                <button
                                                    style={{
                                                        backgroundColor: hover ? "#0b5ed7" : "#0d6efd",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        padding: "4px 8px",
                                                        fontSize: "12px",
                                                        cursor: "pointer",
                                                        transition: "background-color 0.2s",
                                                    }}
                                                    onMouseEnter={() => setHover(true)}
                                                    onMouseLeave={() => setHover(false)}
                                                    title="Notificar vendedor"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const statusInfo = controle[venda.vendedor]?.[venda.cpf] || {};
                                                        const status = statusInfo.Autorizado;

                                                        if (!status) {
                                                        setModal({
                                                            open: true,
                                                            title: "Status indefinido",
                                                            message: "Status ainda não definido para essa venda.",
                                                            type: "error",
                                                        });
                                                        return;
                                                        }

                                                        const motivo =
                                                        statusInfo.Desistiu === "SIM"
                                                            ? "Cliente desistiu"
                                                            : statusInfo.Bloqueado === "SIM"
                                                            ? "Cliente bloqueado"
                                                            : null;

                                                        try {
                                                        await enviarStatusVenda(
                                                            venda.vendedorEmail,
                                                            status === "APROVADO" ? "Autorizada" : "Negada",
                                                            venda.nome,
                                                            venda.plano,
                                                            venda.protocolo,
                                                            motivo
                                                        );
                                                        setModal({
                                                            open: true,
                                                            title: "✅ Notificação enviada",
                                                            message: "O vendedor foi informado sobre o status da venda.",
                                                            type: "success",
                                                        });
                                                        } catch (err) {
                                                        console.error(err);
                                                        setModal({
                                                            open: true,
                                                            title: "❌ Erro ao notificar",
                                                            message: "Não foi possivel enviar, a notificação para o vendedor não está ativo.",
                                                            type: "error",
                                                        });
                                                        }
                                                    }}
                                                    >
                                                    📩 Notificar
                                                    </button>

                                                )}

                                            </div>


                                    </div>

                                    {vendasAbertas[venda.protocolo] && (
                                        <div className={styles.cardBody}>
                                        <p><strong>Vendedor:</strong> {venda.vendedor}</p>
                                        <p><strong>Protocolo:</strong> {venda.protocolo}</p>
                                        <p><strong>CPF:</strong> {venda.cpf}</p>
                                        <p><strong>Telefone:</strong> {venda.telefone1}</p>
                                        <p><strong>Comissão:</strong> R$ {
                                                calcularComissao(status, venda.classificacao, valoresComissao)
                                                .toFixed(2).replace(".", ",")
                                                }</p>
                                        <div style={{ marginTop: 10 }}>
                                            {["Pagou Taxa", "Bloqueado", "Ativado", "Desistiu"].map((campo) => (
                                            <label key={campo} style={{ display: "block", marginBottom: 4 }}>
                                                <input
                                                type="checkbox"
                                                checked={(status?.[campo] || "NÃO") === "SIM"}
                                                onChange={(e) =>
                                                    atualizarStatus(venda.vendedor, venda.cpf, campo, e.target.checked)
                                                }
                                                />
                                                {" "}{campo}
                                            </label>
                                            ))}
                                        </div>
                                        </div>
                                    )}
                                    </div>


                                );
                            })}
                            </div>
                        )}
                        </div>
                    ))}
                    </div>

            </div>
            
        
        
        </Layout>
        {modal.open && (
            <CustomModal
                open={modal.open}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onClose={() => setModal({ ...modal, open: false })}
            />
            )}


        </>
    );
};

export default AdminDashboard;
