import { useEffect, useState } from "react";
import Layout from "../components/Layout";
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

const Metrics = () => {
  const [vendas, setVendas] = useState([]);
  const [vendedor, setVendedor] = useState(null);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());

  useEffect(() => {
    const vendedorSalvo = JSON.parse(localStorage.getItem("vendedor"));
    if (!vendedorSalvo || !vendedorSalvo.email) {
      window.location.href = "/";
      return;
    }

    setVendedor(vendedorSalvo);

    const nomeSanitizado = vendedorSalvo.nome.toLowerCase().replace(/\s+/g, "_");
    const emailSanitizado = vendedorSalvo.email.toLowerCase().replace(/[@.]/g, "_");
    const nomeArquivo = `${nomeSanitizado}__${emailSanitizado}.json`;

    const carregarVendas = () => {
      fetch(baixarJsonVendedor(`/api/vendedor-json/${nomeArquivo}`))
        .then((res) => res.json())
        .then((dados) => setVendas(Array.isArray(dados) ? dados : []))
        .catch(() => setVendas([]));
    };

    carregarVendas();
    const interval = setInterval(carregarVendas, 30000);
    return () => clearInterval(interval);
  }, []);

  const ultimaAtualizacao = vendas.length
    ? vendas
        .map((v) => v.dataHora)
        .sort()
        .reverse()[0]
    : null;

  // Filtrar vendas do mês selecionado
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

  return (
    <Layout vendedor={vendedor} ultimaAtualizacao={ultimaAtualizacao}>
      <div className={styles.container}>
        <h2 className={styles.title}>📊 Métricas de Vendas</h2>

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
                ✅ {vendasFiltradas.length} {vendasFiltradas.length === 1 ? "venda" : "vendas"} registradas em {meses[mesSelecionado]}
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
        </div>
      </div>
    </Layout>
  );
};

export default Metrics;
