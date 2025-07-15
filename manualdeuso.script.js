// Configuración MQTT (HiveMQ Cloud)
const broker = "90883d7a8ff64950af6e002e4bd77ee3.s1.eu.hivemq.cloud";
const port = 8884;
const topic = "casa/sensores";


// Elementos del DOM
const wifiElement = document.getElementById("wifi");

// Variables para control de tiempo
let lastMessageTime = 0;
const timeoutDuration = 3000; // 10 segundos sin mensajes = desconectado
let timeoutTimer;

// Cliente MQTT
const clientId = "web_" + parseInt(Math.random() * 100, 10);
const client = new Paho.Client(broker, port, clientId);

// Función para manejar desconexión por tiempo
function checkConnection() {
    const currentTime = Date.now();
    if (currentTime - lastMessageTime > timeoutDuration) {
        wifiElement.textContent = "DESCONECTADA";
        wifiElement.style.color = "#F44336";
      }
}

// Manejo de conexión perdida
client.onConnectionLost = (response) => {
    console.error("Conexión perdida:", response.errorMessage);
    wifiElement.textContent = "DESCONECTADA";
    wifiElement.style.color = "#F44336";
    clearInterval(timeoutTimer);
};

// Manejo de mensajes recibidos
client.onMessageArrived = (message) => {
    try {
        const data = JSON.parse(message.payloadString);
        wifiElement.textContent = data.wifi || "CONECTADA"; // Si no viene wifi, mostrar "conectada"
        wifiElement.style.color = "#4CAF50";
               
        // Actualizar el tiempo del último mensaje
        lastMessageTime = Date.now();
        console.log("Datos actualizados:", data);
    } catch (error) {
        console.error("Error al procesar mensaje:", error);
    }
};

// Opciones de conexión
const options = {
    useSSL: true,
    userName: "github",
    password: "Ivan4826",
    onSuccess: () => {
        console.log("Conectado a HiveMQ Cloud");
        client.subscribe(topic);
        // Iniciar temporizador para verificar conexión
        lastMessageTime = Date.now();
        timeoutTimer = setInterval(checkConnection, 1000); // Verificar cada segundo
    },
    onFailure: (error) => {
        console.error("Error de conexión:", error.errorMessage);
        wifiElement.textContent = "DESCONECTADA";
        wifiElement.style.color = "#F44336";
        }
};

// Iniciar conexión MQTT
client.connect(options);
