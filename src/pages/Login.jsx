import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buscarVendedores } from "../services/nocodb";
import { Button } from "../components/ui/button";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">🔐 Login do Vendedor</h2>
        <input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring"
        />
        {erro && <p className="text-red-500 text-sm">{erro}</p>}
        <Button className="w-full" onClick={handleLogin}>
          Entrar
        </Button>
      </div>
    </div>
  );
};

export default Login;
