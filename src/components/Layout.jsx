import styles from "./Layout.module.css";




const Layout = ({ children, vendedor, ultimaAtualizacao, totalComissoes }) => {

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2>📊 Max Dashboard</h2>
        <nav className={styles.nav}>
          <a href="/dashboard">📄 Vendas</a>
          <a href="/metrics">📈 Métricas</a>
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

      {/* Conteúdo */}
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
