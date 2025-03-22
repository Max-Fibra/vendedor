import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buscarVendedores } from "../services/nocodb";
import { Button } from "../components/ui/button";
import { ShieldCheck } from "lucide-react";
import Lottie from "lottie-react";
import loginAnimacao from "../assets/login.json";


import styles from "./Login.module.css";


const Login = () => {
  const [email, setEmail] = useState("");
  const [vendedores, setVendedores] = useState([]);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    buscarVendedores().then(setVendedores);
  }, []);

  const handleLogin = () => {
    const vendedorEncontrado = vendedores.find(
        (v) => v.email?.toLowerCase() === email.toLowerCase()
      );
      

    if (vendedorEncontrado) {
      localStorage.setItem("vendedor", JSON.stringify(vendedorEncontrado));
      navigate("/dashboard");
    } else {
      setErro("E-mail não encontrado. Tente novamente.");
    }
  };

  return (
<div className={styles.container}>
  <div className={styles.card}>
  <Lottie animationData={loginAnimacao} loop={true} className={styles.animacao} />
    <h2 className={styles.title}>
      <ShieldCheck size={24} /> Login
    </h2>
    <input
      type="email"
      placeholder="Digite seu e-mail"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className={styles.input}
    />
    {erro && <p className={styles.error}>{erro}</p>}
    <Button className={styles.botaoLogin} onClick={handleLogin}>
        Entrar
      </Button>
  </div>
</div>

  );
};

export default Login;
