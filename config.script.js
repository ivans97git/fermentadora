// ==============================================
// CONFIGURACIÓN Y CONSTANTES
// ==============================================

// Configuración MQTT (HiveMQ Cloud)
const broker = "90883d7a8ff64950af6e002e4bd77ee3.s1.eu.hivemq.cloud";
const port = 8884;
const topic = "casa/sensores";
const topicConfiguracion = "casa/config";    // Tópico para enviar configuración al ESP32
const timeoutDuration = 10000; // 10 segundos sin mensajes = desconectado

// Valores por defecto
const valoresPorDefecto = {
    temperatura: 22.5,
    humedad: 65,
    tiempo: 1440 // 24 horas en minutos
};

// ==============================================
// VARIABLES GLOBALES
// ==============================================

// Variables de configuración
let configTemperatura = valoresPorDefecto.temperatura;
let configHumedad = valoresPorDefecto.humedad;
let configTiempo = valoresPorDefecto.tiempo;

// Variables para control de conexión
let lastMessageTime = 0;
let timeoutTimer;
let ultimoValorCargado = null;

// ==============================================
// ELEMENTOS DEL DOM
// ==============================================

const wifiElement = document.getElementById("wifi");
const temperatureElement = document.getElementById("temperature");
const humidityElement = document.getElementById("humidity");
const nivelAguaElement = document.getElementById("nivelAgua");

// ==============================================
// CLIENTE MQTT
// ==============================================

const clientId = "web_" + parseInt(Math.random() * 100, 10);
const client = new Paho.Client(broker, port, clientId);

// Opciones de conexión MQTT
const options = {
    useSSL: true,
    userName: "github",
    password: "Ivan4826",
    onSuccess: onConnectSuccess,
    onFailure: onConnectFailure
};

// ==============================================
// FUNCIONES DE CONEXIÓN MQTT
// ==============================================

function onConnectSuccess() {
    console.log("Conectado a HiveMQ Cloud");
    client.subscribe(topic);
    // Iniciar temporizador para verificar conexión
    lastMessageTime = Date.now();
    timeoutTimer = setInterval(checkConnection, 1000); // Verificar cada segundo
}

function onConnectFailure(error) {
    console.error("Error de conexión:", error.errorMessage);
    updateConnectionStatus(false);
}

function onConnectionLost(response) {
    console.error("Conexión perdida:", response.errorMessage);
    updateConnectionStatus(false);
    clearInterval(timeoutTimer);
}

function onMessageArrived(message) {
    try {
        const data = JSON.parse(message.payloadString);
        updateUI(data);
        
        // Actualizar el tiempo del último mensaje
        lastMessageTime = Date.now();
        console.log("Datos actualizados:", data);
    } catch (error) {
        console.error("Error al procesar mensaje:", error);
    }
}

// Asignar handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// ==============================================
// FUNCIONES DE CONTROL DE CONEXIÓN
// ==============================================

function checkConnection() {
    const currentTime = Date.now();
    if (currentTime - lastMessageTime > timeoutDuration) {
        updateConnectionStatus(false);
    }
}

function updateConnectionStatus(connected) {
    if (connected) {
        wifiElement.textContent = "CONECTADA";
        wifiElement.style.color = "#4CAF50";
    } else {
        wifiElement.textContent = "DESCONECTADA";  
        wifiElement.style.color = "#F44336";
        temperatureElement.textContent = "--";
        humidityElement.textContent = "--";
        nivelAguaElement.textContent = "--";
    }
}

// ==============================================
// FUNCIONES DE ACTUALIZACIÓN DE UI
// ==============================================

function updateUI(data) {
    wifiElement.textContent = data.wifi || "CONECTADA";
    wifiElement.style.color = "#4CAF50";
    temperatureElement.textContent = data.temperatura;
    humidityElement.textContent = data.humedad;
    nivelAguaElement.textContent = data.nivelAgua;
}

// ==============================================
// FUNCIONES DE CONFIGURACIÓN
// ==============================================

function actualizarVariablesConfiguracion() {
    configTemperatura = parseFloat(document.getElementById('temperatura').value) || valoresPorDefecto.temperatura;
    configHumedad = parseInt(document.getElementById('humedad').value) || valoresPorDefecto.humedad;
    configTiempo = parseInt(document.getElementById('tiempo').value) || valoresPorDefecto.tiempo;
    
    console.log('Variables actualizadas:', {
        temperatura: configTemperatura,
        humedad: configHumedad,
        tiempo: configTiempo
    });
}

function cargarConfiguracion() {
    // Actualizar las variables primero
    actualizarVariablesConfiguracion();
    
    // Crear objeto con la configuración
    const configuracion = {
        temperatura: configTemperatura,
        humedad: configHumedad,
        tiempo: configTiempo,
        timestamp: new Date().toISOString()
    };

    // Publicar la configuración via MQTT
    const message = new Paho.Message(JSON.stringify(configuracion));
    message.destinationName = topicConfiguracion;
    client.send(message);
    
    console.log('Configuración enviada:', configuracion);
    alert(`Configuración enviada al ESP32:\nTemperatura: ${configTemperatura}°C\nHumedad: ${configHumedad}%\nTiempo: ${configTiempo} minutos`);
    
    // Guardar localmente (opcional)
    ultimoValorCargado = configuracion;
    localStorage.setItem('ultimoValorFermentadora', JSON.stringify(ultimoValorCargado));
}

// ==============================================
// EVENT LISTENERS
// ==============================================

document.getElementById('cargar').addEventListener('click', cargarConfiguracion);
document.getElementById('temperatura').addEventListener('change', actualizarVariablesConfiguracion);
document.getElementById('humedad').addEventListener('change', actualizarVariablesConfiguracion);
document.getElementById('tiempo').addEventListener('change', actualizarVariablesConfiguracion);

// ==============================================
// INICIALIZACIÓN
// ==============================================

// Iniciar conexión MQTT
client.connect(options);
