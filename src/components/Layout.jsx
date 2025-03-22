import styles from "./Layout.module.css";
import { Link } from "react-router-dom";

const Layout = ({ children, vendedor, ultimaAtualizacao, totalComissoes }) => {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <h2>📊 Max Dashboard</h2>
        <nav className={styles.nav}>
            {/* Rota diferente para admin */}
            {vendedor?.nome === "Administrador" ? (
              <>
                <Link to="/admin">📄 Vendas</Link>
                <Link to="/admin/metrics">📈 Métricas</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">📄 Vendas</Link>
                <Link to="/metrics">📈 Métricas</Link>
              </>
            )}

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className={styles.logout}
            >
              🚪 Sair
            </button>
          </nav>

      </aside>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>
            Olá, {vendedor?.nome} 👋{" "}
            {ultimaAtualizacao && (
              <span className={styles.timestamp}>
                • Última atualização: {ultimaAtualizacao}
              </span>
            )}
            {totalComissoes !== undefined && (
              <div className={styles.comissaoTotal}>
                💰 Comissão total:{" "}
                <strong>
                  R$ {totalComissoes.toFixed(2).replace(".", ",")}
                </strong>
              </div>
            )}
          </h1>
          <p>Veja suas vendas registradas abaixo.</p>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
