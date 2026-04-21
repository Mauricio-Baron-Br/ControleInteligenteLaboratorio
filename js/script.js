  // SIMULAÇÃO DE SENSORES DE TEMPERATURA UMIDADE
  function atualizarSensores() {
    const temp = (22 + Math.random() * 5).toFixed(1);
    const umid = Math.floor(45 + Math.random() * 20);
    document.getElementById("temp-val").textContent = `${temp}°C`;
    document.getElementById("umid-val").textContent = `${umid}%`;
  }

  // PERSISTÊNCIA (Local Storage)
  function salvarConfiguracoes() {
    const config = {
      luz: {
        hL: document.getElementById("hora-ligar-luz").value,
        hD: document.getElementById("hora-desligar-luz").value,
        dias: Array.from(document.querySelectorAll("#dias-luz input")).map(c => c.checked)
      },
      bancada: {
        hL: document.getElementById("hora-ligar-bancada").value,
        hD: document.getElementById("hora-desligar-bancada").value,
        dias: Array.from(document.querySelectorAll("#dias-bancada input")).map(c => c.checked)
      }
    };
    localStorage.setItem("lab_v6_data", JSON.stringify(config));
  }

  function carregarConfiguracoes() {
    const salvo = JSON.parse(localStorage.getItem("lab_v6_data"));
    if (salvo) {
      document.getElementById("hora-ligar-luz").value = salvo.luz.hL;
      document.getElementById("hora-desligar-luz").value = salvo.luz.hD;
      document.querySelectorAll("#dias-luz input").forEach((c, i) => c.checked = salvo.luz.dias[i]);
      
      document.getElementById("hora-ligar-bancada").value = salvo.bancada.hL;
      document.getElementById("hora-desligar-bancada").value = salvo.bancada.hD;
      document.querySelectorAll("#dias-bancada input").forEach((c, i) => c.checked = salvo.bancada.dias[i]);
    }
    adicionarLog("Sistemas de monitoramento e automação online.");
  }

  function adicionarLog(msg) {
    const log = document.getElementById("log-lista");
    const tempo = new Date().toLocaleTimeString();
    log.innerHTML = `<div class="log-item"><span class="log-time">[${tempo}]</span> ${msg}</div>` + log.innerHTML;
  }

  // LÓGICA DOS DISPOSITIVOS
  function alternarLuz() {
    const s = document.getElementById("status-luz"), b = document.getElementById("btn-luz");
    if (s.textContent === "Acesa") {
       s.textContent = "Apagada"; s.className = "status-badge bg-off"; b.textContent = "Ligar"; b.className = "btn btn-ligar";
    } else {
      s.textContent = "Acesa"; s.className = "status-badge bg-on"; b.textContent = "Desligar"; b.className = "btn btn-desligar";
    }
    if (s.textContent === "Acesa"){
      enviarDados('a');
    } 
     if (s.textContent === "Apagada") {
      enviarDados('b');
    }
    adicionarLog(`Luz Principal: ${s.textContent}`);
  }

  function alternarBancada() {
    const s = document.getElementById("status-bancada"), b = document.getElementById("btn-bancada");
    if (s.textContent === "Ligada") {
      s.textContent = "Desligada"; s.className = "status-badge bg-off"; b.textContent = "Ligar"; b.className = "btn btn-ligar";
    } else {
      s.textContent = "Ligada"; s.className = "status-badge bg-on"; b.textContent = "Desligar"; b.className = "btn btn-desligar";
    }
    if (s.textContent === "Ligada"){
      enviarDados('c');
    } 
     if (s.textContent === "Desligada") {
      enviarDados('d');
    }
    adicionarLog(`Bancada: ${s.textContent}`);
  }
//FUNCAO DE PANICO
  function ativarPanico() {
    let flag = false;
    if(confirm("Ativar desligamento de emergência?")) {
      if(document.getElementById("status-luz").textContent === "Acesa") alternarLuz();
      if(document.getElementById("status-bancada").textContent === "Ligada") alternarBancada();
      adicionarLog("ALERTA: Protocolo de Pânico acionado.");
      flag = true;
    }
    if (flag != false){
      enviarDados('x');
    }
  }

  // AUTOMATIZAÇÃO
  function rodarAutomacao() {
    const agora = new Date();
    const horaAtual = agora.toTimeString().slice(0,5);
    const diaAtual = agora.getDay().toString();

    const verificar = (idDias, idH_On, idH_Off, idStatus, fnAlt) => {
      const dias = document.querySelectorAll(`#${idDias} input`);
      let hojeAtivo = false;
      dias.forEach(d => { if(d.checked && d.value === diaAtual) hojeAtivo = true; });

      if (hojeAtivo) {
        const hOn = document.getElementById(idH_On).value;
        const hOff = document.getElementById(idH_Off).value;
        const status = document.getElementById(idStatus).textContent;
        
        if (hOn === horaAtual && (status === "Apagada" || status === "Desligada")) fnAlt();
        if (hOff === horaAtual && (status === "Acesa" || status === "Ligada")) fnAlt();
      }
    };

    verificar('dias-luz', 'hora-ligar-luz', 'hora-desligar-luz', 'status-luz', alternarLuz);
    verificar('dias-bancada', 'hora-ligar-bancada', 'hora-desligar-bancada', 'status-bancada', alternarBancada);
  }

  // INTERVALOS
  setInterval(() => {
    document.getElementById("data-hora").textContent = new Date().toLocaleString("pt-BR");
  }, 50);

// SENSORES DA PORTA E JANELA
  function alternarSensor(tipo) {
    const el = document.getElementById(`status-${tipo}`);
    el.textContent = el.textContent === "Aberta" ? "Fechada" : "Aberta";
    adicionarLog(`${tipo.toUpperCase()} alterada para ${el.textContent}.`);
    if(tipo !='u'){
    verificarSeguranca(tipo);}
  }
//VERIFICAR SE PORTA E JANELA ESTAO ABERTOS
  function verificarSeguranca() {
    const porta = document.getElementById("status-porta").textContent;
    const janela = document.getElementById("status-janela").textContent;
    document.getElementById("aviso-porta").textContent = porta === "Aberta" ? "⚠ PORTA ABERTA!" : "";
    document.getElementById("aviso-janela").textContent = janela === "Aberta" ? "⚠ JANELA ABERTA!" : "";
  }
//FUNCAO DE CONEXAO 
let porta;
        let leitor;
        let manterLendo = true;

        async function conectarSerial() {
            if (!("serial" in navigator)) return alert("Web Serial não suportada!");

            try {
                porta = await navigator.serial.requestPort();
                const baud = document.getElementById('baudRate').value;
                await porta.open({ baudRate: parseInt(baud) });

                // Atualiza interface
                alternarInterface(true);
                document.getElementById('log').innerText = "--- Conectado ---\n";
                
                manterLendo = true;
                lerDados();
            } catch (err) {
                document.getElementById('log').innerText = "Erro ao conectar: " + err.message;
            }
        }

        async function desconectarSerial() {
            if (porta) {
                manterLendo = false; // Sinaliza para o loop de leitura parar
                
                if (leitor) {
                    await leitor.cancel(); // Cancela a leitura pendente
                }
                
                await porta.close();
                porta = null;
                
                alternarInterface(false);
                document.getElementById('log').innerText += "\n--- Desconectado ---";
            }
        }

        async function lerDados() {
            while (porta && porta.readable && manterLendo) {
                leitor = porta.readable.getReader();
                try {
                    while (true) {
                        const { value, done } = await leitor.read();
                        if (done || !manterLendo) break;
                        const texto = new TextDecoder().decode(value);
                        const log = document.getElementById('log');
                        log.innerText += texto;
                        log.scrollTop = log.scrollHeight;  
                        switch (texto) {
                        case "e":
                          alternarSensor('porta');
                          break;
                        case "f":
                          alternarSensor('janela');
                          break;
                        default:
                          alternarSensor('u');
                        }            
                    }
                } catch (err) {
                    console.error("Erro na leitura:", err);
                } finally {
                    leitor.releaseLock();
                }
                
            }
        }

        async function enviarDados(caractere) {
           const input =document.getElementById('inputComando');
            if (!porta || !porta.writable) return;
            const writer = porta.writable.getWriter();
            await writer.write(new TextEncoder().encode(caractere + "\n"));
            writer.releaseLock();

        }

        function alternarInterface(conectado) {
            document.getElementById('btnConectar').disabled = conectado;
            document.getElementById('btnDesconectar').disabled = !conectado;
            document.getElementById('btnEnviar').disabled = !conectado;
            document.getElementById('inputComando').disabled = !conectado;
        }
  setInterval(atualizarSensores, 4000);
  setInterval(rodarAutomacao, 5000);

