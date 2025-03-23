import { useState, useEffect } from "react";
import styles from "./Layout.module.css";
import { Link } from "react-router-dom";

const Layout = ({
  children,
  vendedor,
  ultimaAtualizacao,
  totalComissoes,
  mostrarHeader = true,
}) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const fecharMenu = () => setMenuAberto(false);

  return (
    <div className={styles.layout}>
      {/* BACKDROP */}
      {menuAberto && <div className={styles.backdrop} onClick={fecharMenu} />}

      {/* SIDEBAR */}
      <div
        className={`${styles.sidebar} ${menuAberto ? styles.sidebarAberto : ""}`}
      >
        {/* Botão X para fechar */}
        <button className={styles.closeButton} onClick={fecharMenu}>
          ✖
        </button>

        <h2>📊 Max Dashboard</h2>
        <nav className={styles.nav}>
          {vendedor?.nome === "Administrador" ? (
            <>
              <Link to="/admin" onClick={fecharMenu}>📄 Vendas</Link>
              <Link to="/admin/metrics" onClick={fecharMenu}>📈 Métricas</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" onClick={fecharMenu}>📄 Vendas</Link>
              <Link to="/metrics" onClick={fecharMenu}>📈 Métricas</Link>
              <Link to="/config" onClick={fecharMenu}>⚙️ Configuração</Link>
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
      </div>

      {/* BOTÃO ☰ */}
      <main className={styles.main}>
      {isMobile && (
          <button className={styles.menuToggle} onClick={() => setMenuAberto(true)}>
            ☰
          </button>
        )}


        {mostrarHeader && (
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
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;
