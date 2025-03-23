import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import { ShieldCheck } from "lucide-react";
import Lottie from "lottie-react";
import { isAdmin } from "../services/adminService";
import loginAnimacao from "../assets/login.json";

import { buscarVendedores as buscarDoNoco } from "../services/nocodb";
import { buscarVendedores } from "../services/vendedorService";




import styles from "./Login.module.css";


const Login = () => {
  const [email, setEmail] = useState("");
  const [vendedores, setVendedores] = useState([]);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    buscarVendedores().then((res) => {
      //console.log("🔥 Vendedores carregados:", res); // 👈 aqui
      setVendedores(res);
    });
  }, []);
  

  const handleLogin = async () => {
    const vendedorEncontrado = vendedores.find(
      (v) => v.email?.toLowerCase() === email.toLowerCase()
    );
  
    const ehAdmin = await isAdmin(email);
  
    if (vendedorEncontrado) {
      //console.log("🔍 Vendedor encontrado:", vendedorEncontrado); // <-- aqui!
      localStorage.setItem("vendedor", JSON.stringify(vendedorEncontrado));
      navigate(ehAdmin ? "/admin" : "/dashboard");
    } else if (ehAdmin) {
      // Cria um objeto temporário para admins que não estão na tabela de vendedores
      const adminTemporario = {
        nome: "Administrador",
        email,
      };
      localStorage.setItem("vendedor", JSON.stringify(adminTemporario));
      navigate("/admin");
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
