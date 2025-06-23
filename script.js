// Configuración MQTT (HiveMQ Cloud)
const broker = "90883d7a8ff64950af6e002e4bd77ee3.s1.eu.hivemq.cloud"; // Cambia por tu broker
const port = 8884; // Puerto para WebSocket (SSL)
const topic = "casa/sensores";

// Elementos del DOM
const temperatureElement = document.getElementById("temperature");
const humidityElement = document.getElementById("humidity");
const porcetajeNivelElement = document.getElementById("porcentajeNivel");


// Cliente MQTT
const clientId = "web_" + parseInt(Math.random() * 100, 10);
const client = new Paho.Client(broker, port, clientId);

// Manejo de conexión perdida
client.onConnectionLost = (response) => {
    console.error("Conexión perdida:", response.errorMessage);
};

// Manejo de mensajes recibidos
client.onMessageArrived = (message) => {
    try {
        const data = JSON.parse(message.payloadString);
        temperatureElement.textContent = data.temperatura;
        humidityElement.textContent = data.humedad;
        porcetajeNivelElement.textContent = data.porcentajenivel;
        console.log("Datos actualizados:", data);
    } catch (error) {
        console.error("Error al procesar mensaje:", error);
    }
};

// Opciones de conexión
const options = {
    useSSL: true,
    userName: "github", // Cambia por tu usuario
    password: "Ivan4826", // Cambia por tu contraseña
    onSuccess: () => {
        console.log("Conectado a HiveMQ Cloud");
        client.subscribe(topic);
    },
    onFailure: (error) => {
        console.error("Error de conexión:", error.errorMessage);
    }
};

// Iniciar conexión MQTT
client.connect(options);
