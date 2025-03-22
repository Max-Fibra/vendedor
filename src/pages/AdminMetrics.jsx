import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { buscarTodosVendedores } from "../services/vendedorService";
import { getControleVendas } from "../services/controleVendas";
import { baixarJsonVendedor } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./Metrics.module.css";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff6b6b", "#00c49f"];
const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const AdminMetrics = () => {
  const [vendas, setVendas] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());

  const vendedor = { nome: "Administrador" }; // mockado para o Layout

  useEffect(() => {
    const carregarTodosJSONs = async () => {
      try {
        const vendedores = await buscarTodosVendedores();
        const controle = await getControleVendas();

        const todasVendas = [];

        for (const vendedor of vendedores) {
          const nomeSanitizado = vendedor.nome.toLowerCase().replace(/\s+/g, "_");
          const emailSanitizado = vendedor.email.toLowerCase().replace(/[@.]/g, "_");
          const nomeArquivo = `${nomeSanitizado}__${emailSanitizado}.json`;

          try {
            const res = await fetch(baixarJsonVendedor(`/api/vendedor-json/${nomeArquivo}`));
            const dados = await res.json();

            if (Array.isArray(dados)) {
              dados.forEach(v => v.vendedor = vendedor.nome);
              todasVendas.push(...dados);
            }
          } catch (erro) {
            console.warn(`Erro ao carregar JSON de ${nomeArquivo}`, erro);
          }
        }

        setVendas(todasVendas);
      } catch (erro) {
        console.error("Erro ao carregar métricas do admin:", erro);
      }
    };

    carregarTodosJSONs();
  }, []);

  const ultimaAtualizacao = vendas.length
    ? vendas.map((v) => v.dataHora).sort().reverse()[0]
    : null;

  const vendasFiltradas = vendas.filter((v) => {
    const [dia, mes] = v.dataHora?.split(",")[0]?.split("/") || [];
    return Number(mes) - 1 === mesSelecionado;
  });

  const contarPorCampo = (campo) => {
    const contagem = {};
    vendasFiltradas.forEach((v) => {
      const valor = v[campo];
      if (valor) contagem[valor] = (contagem[valor] || 0) + 1;
    });
    return Object.entries(contagem).map(([name, value]) => ({ name, value }));
  };

  const planosData = contarPorCampo("plano");
  const bairrosData = contarPorCampo("bairro");

  const vendasPorVendedor = () => {
    const contagem = {};
    vendasFiltradas.forEach((v) => {
      const vendedor = v.vendedor;
      if (vendedor) contagem[vendedor] = (contagem[vendedor] || 0) + 1;
    });
    return Object.entries(contagem).map(([name, value]) => ({ name, value }));
  };
  
  const vendedoresData = vendasPorVendedor();
  

  return (
    <Layout vendedor={vendedor} ultimaAtualizacao={ultimaAtualizacao}>
      <div className={styles.container}>
        <h2 className={styles.title}>📊 Métricas Gerais</h2>

        <div className={styles.filtros}>
          <label className={styles.filtroLabel}>
            <span className={styles.filtroIcon}>📅</span>
            <span className={styles.filtroText}>Filtrar por mês:</span>
            <select
              className={styles.select}
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(Number(e.target.value))}
            >
              {meses.map((mes, index) => (
                <option key={index} value={index}>{mes}</option>
              ))}
            </select>
          </label>

          <p className={styles.contagem}>
            ✅ {vendasFiltradas.length} venda{vendasFiltradas.length !== 1 && "s"} registradas em {meses[mesSelecionado]}
          </p>
        </div>

        <div className={styles.charts}>
          <div className={styles.chartBox}>
            <h3>📦 Planos mais vendidos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={planosData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4c6ef5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartBox}>
            <h3>📍 Bairros com mais vendas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bairrosData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {bairrosData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartBox}>
            <h3>🙋 Vendas por Vendedor</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendedoresData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#00b894" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default AdminMetrics;
