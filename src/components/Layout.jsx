import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import styles from "./Layout.module.css";

const Layout = ({
  children,
  vendedor,
  ultimaAtualizacao,
  totalComissoes,
  mostrarHeader = true,
}) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  const esconderMensagem = location.pathname.startsWith("/admin/config");

  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fecharMenu = () => setMenuAberto(false);

  return (
    <div className={styles.layout}>
      {menuAberto && <div className={styles.backdrop} onClick={fecharMenu} />}

      <div className={`${styles.sidebar} ${menuAberto ? styles.sidebarAberto : ""}`}>
        <button className={styles.closeButton} onClick={fecharMenu}>
          ✖
        </button>

        <h2>📊 Max Dashboard</h2>
        <nav className={styles.nav}>
          {vendedor?.nome === "Administrador" ? (
            <>
              <Link
                to="/admin"
                onClick={fecharMenu}
                className={
                  isActive("/admin") &&
                  !isActive("/admin/metrics") &&
                  !isActive("/admin/config")
                    ? styles.ativo
                    : ""
                }
              >
                📄 Vendas
              </Link>
              <Link
                to="/admin/metrics"
                onClick={fecharMenu}
                className={isActive("/admin/metrics") ? styles.ativo : ""}
              >
                📈 Métricas
              </Link>
              <Link
                to="/admin/config"
                onClick={fecharMenu}
                className={isActive("/admin/config") ? styles.ativo : ""}
              >
                ⚙️ Configurações
              </Link>
              <Link
              to="/admin/verificar-indicacoes"
              onClick={fecharMenu}
              className={isActive("/admin/verificar-indicacoes") ? styles.ativo : ""}
            >
              🧩 Verificar Indicações
            </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                onClick={fecharMenu}
                className={isActive("/dashboard") ? styles.ativo : ""}
              >
                📄 Vendas
              </Link>
              <Link
                to="/metrics"
                onClick={fecharMenu}
                className={isActive("/metrics") ? styles.ativo : ""}
              >
                📈 Métricas
              </Link>
              <Link
                to="/config"
                onClick={fecharMenu}
                className={isActive("/config") ? styles.ativo : ""}
              >
                ⚙️ Configuração
              </Link>
              <Link
                to="/indicacoes"
                onClick={fecharMenu}
                className={isActive("/indicacoes") ? styles.ativo : ""}
              >
            
              💡 Indicações
            </Link>


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
                  <strong>R$ {totalComissoes.toFixed(2).replace(".", ",")}</strong>
                </div>
              )}
            </h1>
            {!esconderMensagem && <p>Veja suas vendas registradas abaixo.</p>}
          </div>
        )}

        {children}
      </main>
    </div>
  );
};

export default Layout;
