// Definição dos pinos
const int PINO_JANELA  = 2;
const int PINO_PORTA   = 3;
const int PINO_BANCADA = 4;
const int PINO_LUZ     = 5;
const int LED_STATUS   = 13;

void setup() {
  Serial.begin(9600);
  
  pinMode(PINO_PORTA, INPUT_PULLUP);
  pinMode(PINO_JANELA, INPUT_PULLUP);
  pinMode(PINO_BANCADA, OUTPUT);
  pinMode(PINO_LUZ, OUTPUT);
  pinMode(LED_STATUS, OUTPUT);

  Serial.println("Sistema Iniciado.");
}

void loop() {
  processarComandos();
  verificarSensores();
  //verificaTemperatura();
  //verificaUmidade();
  //consumoEstimado();
  delay(50); // Delay reduzido para maior responsividade
}

void processarComandos() {
  if (Serial.available() > 0) {
    char dado = Serial.read();

    // Botão de Emergência (x) - Prioridade Máxima
    if (dado == 'x') {
      desligarTudo();
      Serial.println("EMERGENCIA: Tudo desligado");
      return;
    }

    // Comandos de Operação
    switch (dado) {
      case 'a':
        acaoDispositivo(PINO_LUZ, HIGH, "Lampada ligada");
        break;
      case 'b':
        acaoDispositivo(PINO_LUZ, LOW, "Lampada desligada");
        break;
      case 'c':
        acaoDispositivo(PINO_BANCADA, HIGH, "Bancada ligada");
        break;
      case 'd':
        acaoDispositivo(PINO_BANCADA, LOW, "Bancada desligada");
        break;
    }
  }
}

void verificarSensores() {
  // Envia status apenas se o sensor for ativado (LOW devido ao PULLUP)
  if (digitalRead(PINO_PORTA) != HIGH) {
    Serial.println("e"); // Porta aberta
  }
  if (digitalRead(PINO_JANELA) != HIGH) {
    Serial.println("f"); // Janela aberta
  }
}

void acaoDispositivo(int pino, int estado, String msg) {
  digitalWrite(pino, estado);
  digitalWrite(LED_STATUS, estado);
  Serial.println(msg);
}

void desligarTudo() {
  digitalWrite(PINO_LUZ, LOW);
  digitalWrite(PINO_BANCADA, LOW);
  digitalWrite(LED_STATUS, LOW);
}
/*verificaTemperatura(){

}
verificaUmidade(){

}
consumoEstimado(){

}*/
