// Configuración MQTT (HiveMQ Cloud)
const broker = "90883d7a8ff64950af6e002e4bd77ee3.s1.eu.hivemq.cloud";
const port = 8884;
const topic = "casa/sensores";
const topice = "casa/estado";
let estado = 0 ; 
let conexion= 0 ; 

// Elementos del DOM
const wifiElement = document.getElementById("wifi");
const estadoElement = document.getElementById("estado");
const estadocElement = document.getElementById("estadoc");
const temperatureElement = document.getElementById("temperature");
const humidityElement = document.getElementById("humidity");
const nivelAguaElement = document.getElementById("nivelAgua");

// Variables para control de tiempo
let lastMessageTime = 0;
const timeoutDuration = 10000; // 10 segundos sin mensajes = desconectado
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
        estadoElement.textContent = "--";
        estadocElement.style.backgroundColor = "#E0E0E0";
        temperatureElement.textContent = "--";
        humidityElement.textContent = "--";
        nivelAguaElement.textContent = "--";
        conexion = 0;
    }
}

// Manejo de conexión perdida
client.onConnectionLost = (response) => {
    console.error("Conexión perdida:", response.errorMessage);
    wifiElement.textContent = "DESCONECTADA";
    wifiElement.style.color = "#F44336";
    estadoElement.textContent = "--";
    estadocElement.style.backgroundColor = "#E0E0E0";
    temperatureElement.textContent = "--";
    humidityElement.textContent = "--";
    nivelAguaElement.textContent = "--";
    conexion= 0;
    clearInterval(timeoutTimer);
};

// Manejo de mensajes recibidos
client.onMessageArrived = (message) => {
    try {
        const data = JSON.parse(message.payloadString);
        wifiElement.textContent = data.wifi || "CONECTADA"; // Si no viene wifi, mostrar "conectada"
        wifiElement.style.color = "#4CAF50";
        temperatureElement.textContent = data.temperatura;
        humidityElement.textContent = data.humedad;
        nivelAguaElement.textContent = data.nivelAgua;
        conexion= 1;
        if (data.estado === "1") {
        estadoElement.textContent = "OPERATIVA";
        estadoElement.style.color = "#45A049";
        estadocElement.style.backgroundColor = "#E8F5E9";
        estado=1;
        } else {
        estadoElement.textContent = "EN ESPERA";
        estadoElement.style.color = "#D32F2F";
        estadocElement.style.backgroundColor = "#FFB2B2";
        estado=0;
        }
        
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
        estadoElement.textContent = "--";
        estadocElement.style.backgroundColor = "#E0E0E0";
        temperatureElement.textContent = "--";
        humidityElement.textContent = "--";
        nivelAguaElement.textContent = "--";
        conexion= 0;
    }
};
function iniciar() {        
        if (conexion === 1) {
            if (estado === 0 ){
                const eweb = 1 ;

                // Publicar la configuración via MQTT
                const message = new Paho.Message(JSON.stringify(eweb));
                message.destinationName = topice;
                client.send(message);
        
                console.log('Estado enviado:', eweb);
                alert(`Estado enviado al ESP32:\nceweb: ${eweb}`);
            } else {
            alert(`La fermentadora esta OPERATIVA. \n Si desea cambiar los parametros de funcionamiento, \n vaya al menu Configuración, verifique \n los valores y presione CARGAR.`);
            }
        } else {
            alert(`La fermentadora no esta conectada.\n Verifique la conexión.`);
            }
}    

function parar() {        
        if (conexion === 1) {
            if (estado === 1 ){
                const eweb = 0 ;

                // Publicar la configuración via MQTT
                const message = new Paho.Message(JSON.stringify(eweb));
                message.destinationName = topice;
                client.send(message);
        
                console.log('Estado enviado:', eweb);
                alert(`Estado enviado al ESP32:\nceweb: ${eweb}`);
            } else {
            alert(`La fermentadora esta EN ESPERA.`);
            }
            } else {
            alert(`La fermentadora no esta conectada.\n Verifique la conexión.`);
            }
}  


// Iniciar conexión MQTT
client.connect(options);

document.getElementById('iniciar').addEventListener('click', iniciar);
document.getElementById('parar').addEventListener('click', parar);
