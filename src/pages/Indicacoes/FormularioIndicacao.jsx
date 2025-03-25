import React, { useEffect, useState } from 'react';
import { buscarRegistroPorCodigoIndicacao, atualizarIndicacoes } from '../../services/indicacaoService';
import styles from './FormularioIndicacoes.module.css'; // 👈 importa o CSS module


const FormularioIndicacao = () => {
  const [codigo, setCodigo] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [registro, setRegistro] = useState(null);

  const [indicador, setIndicador] = useState('');
  const [telefoneIndicador, setTelefoneIndicador] = useState('');
  const [nomeIndicado, setNomeIndicado] = useState('');
  const [telefoneIndicado, setTelefoneIndicado] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    const cod = params.get('codigo');
  
    if (cod) {
      setCodigo(cod);
  
      const buscar = async () => {
        const registroEncontrado = await buscarRegistroPorCodigoIndicacao(cod);
        if (registroEncontrado) {
          setRegistro(registroEncontrado);
          setVendedor(registroEncontrado.Vendedor);
  
          const listaIndicacoes = registroEncontrado?.Json_Indicações?.indicacoes || [];
          const novoValor = (registroEncontrado.ContadorCliques || 0) + 1;
  
          await atualizarIndicacoes(registroEncontrado.Id, {
            Json_Indicações: {
              indicacoes: listaIndicacoes
            },
            ContadorCliques: novoValor
          });
        } else {
          setMensagem('Código inválido ou não encontrado.');
        }
      };
  
      buscar();
    } else {
      setMensagem('Nenhum código informado na URL.');
    }
  }, []);
  
  
  

  const handleEnviar = async () => {
    if (!indicador || !telefoneIndicador || !nomeIndicado || !telefoneIndicado) {
      setMensagem('Preencha todos os campos.');
      return;
    }

    if (!registro) {
      setMensagem('Erro: registro do vendedor não carregado.');
      return;
    }

    const novaIndicacao = {
      vendedor,
      indicador,
      telefoneIndicador, // 👈 Isso precisa estar presente
      nome: nomeIndicado,
      telefone: telefoneIndicado,
      status: 'pendente',
      data: new Date().toLocaleDateString('pt-BR'),
    };

    const listaAtual = registro?.Json_Indicações?.indicacoes || [];
    const novaLista = [...listaAtual, novaIndicacao];

    await atualizarIndicacoes(registro.Id, novaLista);
    setMensagem('✅ Indicação enviada com sucesso!');
    setIndicador('');
    setTelefoneIndicador('');
    setNomeIndicado('');
    setTelefoneIndicado('');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>📨 Formulário de Indicação</h1>
  
      {mensagem && (
        <p className={`${styles.mensagem} ${mensagem.startsWith('✅') ? styles.sucesso : styles.erro}`}>
          {mensagem}
        </p>
      )}
  
      {vendedor && (
        <p className="mb-4 text-gray-700">
          Vendedor responsável: <strong>{vendedor}</strong>
        </p>
      )}
  
      <label className={styles.label}>Seu nome</label>
      <input className={styles.input} value={indicador} onChange={(e) => setIndicador(e.target.value)} />
  
      <label className={styles.label}>Seu telefone</label>
      <input
          className={styles.input}
          value={telefoneIndicador}
          onChange={(e) => {
            let valor = e.target.value;

            // Remove tudo que não for número
            valor = valor.replace(/\D/g, "");

            // Garante que começa com 55
            if (!valor.startsWith("55")) {
              valor = "55" + valor;
            }

            // Limita no máximo a 13 dígitos (ex: 55 + DDD + 9 dígitos)
            valor = valor.slice(0, 13);

            setTelefoneIndicador("+" + valor);
          }}
        />

  
      <label className={styles.label}>Nome do indicado</label>
      <input className={styles.input} value={nomeIndicado} onChange={(e) => setNomeIndicado(e.target.value)} />
  
      <label className={styles.label}>Telefone do indicado</label>
      <input
          className={styles.input}
          value={telefoneIndicado}
          onChange={(e) => {
            let valor = e.target.value;

            valor = valor.replace(/\D/g, ""); // remove não números
            if (!valor.startsWith("55")) {
              valor = "55" + valor;
            }
            valor = valor.slice(0, 13); // limita o tamanho

            setTelefoneIndicado("+" + valor);
          }}
        />
  
      <button className={styles.botao} onClick={handleEnviar}>
        Enviar Indicação
      </button>
    </div>
  );
};

export default FormularioIndicacao;
