    // Configuración MQTT (HiveMQ Cloud)
    const broker = "90883d7a8ff64950af6e002e4bd77ee3.s1.eu.hivemq.cloud";
    const port = 8884;
    const topic = "casa/sensores";
    const topicConfiguracion = "casa/config";    // Tópico para enviar configuración al ESP32
    const timeoutDuration = 10000; // 10 segundos sin mensajes = desconectado
    let conexion= 0 ; 
    // Valores por defecto
    const valoresPorDefecto = {
        temperatura: 30,
        humedad: 70,
        tiempo: 60 // 24 horas en minutos
    };

    // Variables de configuración
    let configTemperatura = valoresPorDefecto.temperatura;
    let configHumedad = valoresPorDefecto.humedad;
    let configTiempo = valoresPorDefecto.tiempo;
    
    //let tempFij= 2;
    //let humFij= 2;
    //let tiemFij= 2 ;

    const tempFij = document.getElementById("temp");
    const humFij = document.getElementById("hum");
    const tiemFij = document.getElementById("tiem");

    // Variables para control de conexión
    let lastMessageTime = 0;
    let timeoutTimer;
    //let ultimoValorCargado = JSON.parse(localStorage.getItem('ultimoValorFermentadora')) || null;

    // Elementos del DOM
    const wifiElement = document.getElementById("wifi");
    //const estadoElement = document.getElementById("estado");
    const tiempoElement = document.getElementById("tiempo");
    
    //const tempElement = document.getElementById("temp");
    //const humElement = document.getElementById("hum");
    //const tiemElement = document.getElementById("tiem");

    //const temperatureElement = document.getElementById("temperature");
    //const humidityElement = document.getElementById("humidity");
    //const nivelAguaElement = document.getElementById("nivelAgua");
    
    // Configuración cliente MQTT
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

    // ========== FUNCIONES MQTT ==========
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

    client.onMessageArrived = (message) => {
        try {
            const data = JSON.parse(message.payloadString);
            estadoElement.textContent = data.estado // || "CONECTADA"; // Si no viene wifi, mostrar "conectada"
            
            tempFij.textContent = data.temp;
            humFij.textContent = data.hum;
            tiemFij.textContent = data.tres;
            
            //tempFij = data.temp ;
            //humFij = data.hum ;
            //tiemFij = data.tres ;
            //tempElement.textContent = tempFij;
            //humElement.textContent = humFij;
            //tiemElement.textContent = tiemFij;
            // Actualizar el tiempo del último mensaje
            lastMessageTime = Date.now();
            console.log("Datos actualizados:", data);
        } catch (error) {
            console.error("Error al procesar mensaje:", error);
        }
    }

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
            conexion= 1 ; 
            //document.getElementById("temp").textContent=tempFij;
            //document.getElementById("hum").textContent=humFij;
            //document.getElementById("tiem").textContent=tiemFij;
        } else {
            wifiElement.textContent = "DESCONECTADA";  
            wifiElement.style.color = "#F44336";
            conexion= 0 ; 
            document.getElementById("temp").textContent="--";
            document.getElementById("hum").textContent="--";
            document.getElementById("tiem").textContent="--";
        }
    }

    function updateUI(data) {
        wifiElement.textContent = data.wifi || "CONECTADA";
        wifiElement.style.color = "#4CAF50";
        conexion= 1 ; 
       //document.getElementById("temp").textContent=tempFij;
       //document.getElementById("hum").textContent=humFij;
        //document.getElementById("tiem").textContent=tiemFij;
        //temperatureElement.textContent = data.temperatura;
        //humidityElement.textContent = data.humedad;
        //nivelAguaElement.textContent = data.nivelAgua;
    }

    // ========== FUNCIONES DE CONFIGURACIÓN ==========
    function formatMinutes(minutes) {
        const days = Math.floor(minutes / 1440);
        const hours = Math.floor((minutes % 1440) / 60);
        const mins = minutes % 60;
        
        let result = [];
        if (days > 0) result.push(`${days} día${days > 1 ? 's' : ''}`);
        if (hours > 0) result.push(`${hours} hora${hours > 1 ? 's' : ''}`);
        if (mins > 0 || result.length === 0) result.push(`${mins} minuto${mins !== 1 ? 's' : ''}`);
        
        return result.join(' ');
    }

    function formatFecha(fecha) {
        const opciones = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return fecha.toLocaleDateString('es-ES', opciones);
    }

    function updateTimeDisplay() {
        const minutes = parseInt(document.getElementById('tiempo').value) || 0;
        document.getElementById('time-display').textContent = `Equivalente: ${formatMinutes(minutes)}`;
    }

    //function mostrarUltimoValor() {
    //    const container = document.getElementById('ultimo-valor-content');
        
    //  if (!ultimoValorCargado) {
    //        container.innerHTML = '<div class="no-valor">No se han cargado valores aún</div>';
    //        return;
    //    }
        
    //    const fecha = new Date(ultimoValorCargado.timestamp || ultimoValorCargado.fecha);
        
    //    container.innerHTML = `
    //      <div class="ultimo-valor-item">
    //         <div class="ultimo-valor-label">Temperatura</div>
    //            <div class="ultimo-valor-dato" id="temp">°C</div>
    //        </div>
    //        <div class="ultimo-valor-item">
    //            <div class="ultimo-valor-label">Humedad</div>
    //            <div class="ultimo-valor-dato" id="hum">%</div>
    //        </div>
    //        <div class="ultimo-valor-item">
    //            <div class="ultimo-valor-label">Tiempo</div>
    //            <div class="ultimo-valor-dato" id="tiempo">min</div>
    //        </div>
    //                `;
    //}
// <div class="ultimo-valor-fecha">Cargado: ${formatFecha(fecha)}</div>
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
        if (conexion= 1) {
            // Actualizar las variables primero
            actualizarVariablesConfiguracion();
        
            // Crear objeto con la configuración
            const configuracion = {
            temperatura: configTemperatura,
            humedad: configHumedad,
            tiempo: configTiempo,          
            };

            // Publicar la configuración via MQTT
            const message = new Paho.Message(JSON.stringify(configuracion));
            message.destinationName = topicConfiguracion;
            client.send(message);
        
            console.log('Configuración enviada:', configuracion);
            alert(`Configuración enviada al ESP32:\nTemperatura: ${configTemperatura}°C\nHumedad: ${configHumedad}%\nTiempo: ${formatMinutes(configTiempo)}`);
        
            // Guardar localmente y mostrar
            ultimoValorCargado = configuracion;
            //localStorage.setItem('ultimoValorFermentadora', JSON.stringify(ultimoValorCargado));
            //mostrarUltimoValor();
        }
        else {
            alert(`La fermentadora no esta conectada.\n Verifique la conexión.`);
        }
    }

    // ========== INICIALIZACIÓN ==========
    // Asignar handlers MQTT
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // Inicializar displays
    updateTimeDisplay();
    //mostrarUltimoValor();

    // Event listeners
    document.getElementById('tiempo').addEventListener('input', updateTimeDisplay);
    document.getElementById('temperatura').addEventListener('change', actualizarVariablesConfiguracion);
    document.getElementById('humedad').addEventListener('change', actualizarVariablesConfiguracion);
    document.getElementById('tiempo').addEventListener('change', actualizarVariablesConfiguracion);
    document.getElementById('cargar').addEventListener('click', cargarConfiguracion);

    document.getElementById('borrar').addEventListener('click', function() {
        document.getElementById('temperatura').value = valoresPorDefecto.temperatura;
        document.getElementById('humedad').value = valoresPorDefecto.humedad;
        document.getElementById('tiempo').value = valoresPorDefecto.tiempo;
        updateTimeDisplay();
        actualizarVariablesConfiguracion();
        alert('Valores restablecidos a los predeterminados');
    });

    // Iniciar conexión MQTT
    client.connect(options);
