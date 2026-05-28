// =========================================================
// SIMULACIÓN DE REGISTRO CORREGIDA PARA GITHUB PAGES
// =========================================================
async function procesarRegistroHuella() {
    const email = document.getElementById('loginEmail').value;
    if (!email) return alert("Por favor, ingresa tu correo primero.");

    try {
        // Creamos un ID de usuario puramente numérico y aleatorio (en binario)
        // A veces los strings planos en user.id causan conflicto en producción
        const userIdBuffer = new Uint8Array(16);
        crypto.getRandomValues(userIdBuffer);

        // Creamos un challenge criptográfico real de 32 bytes aleatorios
        const challengeBuffer = new Uint8Array(32);
        crypto.getRandomValues(challengeBuffer);

        const opcionesPrueba = {
            challenge: challengeBuffer,
            rp: { 
                name: "Koco Acreimex", 
                id: window.location.hostname // Requisito estricto del navegador
            },
            user: {
                id: userIdBuffer,
                name: email,
                displayName: email.split('@')[0]
            },
            pubKeyCredParams: [
                { type: "public-key", alg: -7 },  // ES256
                { type: "public-key", alg: -257 } // RS256 (Por si pruebas en Windows Hello)
            ], 
            authenticatorSelection: {
                authenticatorAttachment: "platform", // Fuerza el lector del dispositivo
                userVerification: "required"
            },
            timeout: 60000
        };

        // Levantar el sensor nativo
        const credencialNativa = await navigator.credentials.create({
            publicKey: opcionesPrueba
        });

        console.log("¡Éxito! Credencial generada:", credencialNativa);
        alert("¡Excelente! Tu dispositivo respondió correctamente y leyó tu huella en GitHub Pages.");

    } catch (error) {
        console.error("Error detallado en registro:", error);
        alert("Error en el lector: " + error.name + " - " + error.message);
    }
}

// =========================================================
// SIMULACIÓN DE LOGIN CORREGIDA PARA GITHUB PAGES
// =========================================================
async function procesarLoginHuella() {
    const email = document.getElementById('loginEmail').value;
    if (!email) return alert("Por favor, ingresa tu correo primero.");

    try {
        // Generamos un challenge aleatorio real para pasar los filtros del navegador
        const challengeBuffer = new Uint8Array(32);
        crypto.getRandomValues(challengeBuffer);

        const opcionesAutenticacionPrueba = {
            challenge: challengeBuffer,
            rpId: window.location.hostname, // Agregamos el rpId explícito para el login
            userVerification: "required",
            timeout: 60000
            // Dejamos allowCredentials vacío para que permita usar cualquier huella del dispositivo
        };

        // Activar el sensor para loguearse
        const assertionNativa = await navigator.credentials.get({
            publicKey: opcionesAutenticacionPrueba
        });

        console.log("¡Éxito! Firma generada:", assertionNativa);
        alert("¡Huella reconocida perfectamente!");

        // Redirección simulada al contenido de Koco
        document.getElementById('pantalla-login').style.display = 'none';
        document.getElementById('contenido-pwa').style.display = 'block';

    } catch (error) {
        console.error("Error detallado en login:", error);
        alert("Error al leer la huella: " + error.name + " - " + error.message);
    }
}
