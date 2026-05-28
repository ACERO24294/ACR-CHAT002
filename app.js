// =========================================================
// SIMULACIÓN DE REGISTRO (Prueba local sin API)
// =========================================================
async function procesarRegistroHuella() {
    const email = document.getElementById('loginEmail').value;
    if (!email) return alert("Por favor, ingresa tu correo primero.");

    try {
        alert("Simulando petición al servidor... Ahora se abrirá el lector nativo.");

        // Creamos opciones falsas exactamente como las mandaría un servidor
        const opcionesPrueba = {
            challenge: Uint8Array.from("desafio_de_prueba_1234567890_koco", c => c.charCodeAt(0)),
            rp: { name: "Koco Acreimex", id: window.location.hostname },
            user: {
                id: Uint8Array.from("id_usuario_falso_99", c => c.charCodeAt(0)),
                name: email,
                displayName: email.split('@')[0]
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256
            authenticatorSelection: {
                authenticatorAttachment: "platform", // Fuerza huella/rostro del dispositivo
                userVerification: "required"
            },
            timeout: 60000
        };

        // ¡ESTO ACTIVA EL SENSOR DE TU TELÉFONO/PC!
        const credencialNativa = await navigator.credentials.create({
            publicKey: opcionesPrueba
        });

        console.log("¡Éxito! El sensor generó la credencial:", credencialNativa);
        alert("¡Excelente! Tu dispositivo respondió correctamente y leyó tu huella. En un entorno real, estos datos se enviarían a tu API.");

    } catch (error) {
        console.error("Error en la prueba:", error);
        alert("El lector se abrió, pero el proceso fue cancelado o falló: " + error.message);
    }
}

// =========================================================
// SIMULACIÓN DE LOGIN (Prueba local sin API)
// =========================================================
async function procesarLoginHuella() {
    const email = document.getElementById('loginEmail').value;
    if (!email) return alert("Por favor, ingresa tu correo primero.");

    try {
        alert("Simulando verificación... El teléfono te pedirá tu huella.");

        const opcionesAutenticacionPrueba = {
            challenge: Uint8Array.from("desafio_login_prueba_987654321", c => c.charCodeAt(0)),
            userVerification: "required",
            timeout: 60000
            // Nota: No incluimos 'allowCredentials' para que el dispositivo te deje 
            // usar cualquier huella/rostro registrado en el sistema operativo.
        };

        // ¡ESTO ACTIVA EL SENSOR PARA LOGUEARTE!
        const assertionNativa = await navigator.credentials.get({
            publicKey: opcionesAutenticacionPrueba
        });

        console.log("¡Éxito! Firma de huella generada:", assertionNativa);
        alert("¡Huella reconocida perfectamente en el dispositivo!");

        // --- SIMULAMOS LA ENTRADA A TU CHAT KOCO ---
        document.getElementById('pantalla-login').style.display = 'none';
        document.getElementById('contenido-pwa').style.display = 'block';

    } catch (error) {
        console.error("Error en la prueba de login:", error);
        alert("Error al leer la huella: " + error.message);
    }
}
