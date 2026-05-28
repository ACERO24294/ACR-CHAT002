document.addEventListener("DOMContentLoaded", () => {
    if (!window.PublicKeyCredential) {
        // Si el navegador no lo soporta, ocultamos las opciones biométricas
        document.getElementById('btnHuellaLogin').style.display = 'none';
        document.getElementById('btnHuellaVincular').style.display = 'none';
    }
});

// Configura la URL base de tu servidor privado
const API_URL = "https://tu-servidor-privado.com/api";

// =========================================================
// 1. REGISTRAR / VINCULAR HUELLA (Usuario ya logueado o ingresando su correo)
// =========================================================
async function procesarRegistroHuella() {
    const email = document.getElementById('loginEmail').value;
    if (!email) {
        alert("Por favor, ingresa tu Usuario o Correo primero para poder vincular tu huella.");
        return;
    }

    try {
        // A. Obtener parámetros desde tu servidor privado
        const res = await fetch(`${API_URL}/registro/opciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        const opcionesServer = await res.json();

        // B. Convertir los strings Base64 del servidor a binario para el navegador
        opcionesServer.challenge = base64ToBuffer(opcionesServer.challenge);
        opcionesServer.user.id = base64ToBuffer(opcionesServer.user.id);

        // C. Encender el lector de huellas nativo del dispositivo
        const credencialNativa = await navigator.credentials.create({
            publicKey: opcionesServer
        });

        // D. Preparar la estructura de datos para enviarla por JSON
        const credencialParaEnviar = {
            id: credencialNativa.id,
            rawId: bufferToBase64(credencialNativa.rawId),
            type: credencialNativa.type,
            response: {
                attestationObject: bufferToBase64(credencialNativa.response.attestationObject),
                clientDataJSON: bufferToBase64(credencialNativa.response.clientDataJSON)
            }
        };

        // E. Enviar la credencial al servidor para guardarla en la base de datos
        const resultadoFinal = await fetch(`${API_URL}/registro/verificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, credencial: credencialParaEnviar })
        });

        if (resultadoFinal.ok) {
            alert("¡Perfecto! Tu huella digital ha sido enlazada con éxito a este dispositivo.");
        } else {
            alert("El servidor no pudo validar el registro biométrico.");
        }

    } catch (error) {
        console.error("Error en registro:", error);
        alert("No se pudo registrar la huella o se canceló el proceso.");
    }
}

// =========================================================
// 2. INICIAR SESIÓN DIRECTO CON LA HUELLA DIGITAL
// =========================================================
async function procesarLoginHuella() {
    const email = document.getElementById('loginEmail').value;
    if (!email) {
        alert("Por favor, escribe tu Usuario o Correo para buscar tus datos biométricos.");
        return;
    }

    try {
        // A. Solicitar desafío de autenticación al servidor privado
        const res = await fetch(`${API_URL}/login/opciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        const opcionesServer = await res.json();

        // B. Traducir datos a binario
        opcionesServer.challenge = base64ToBuffer(opcionesServer.challenge);
        if (opcionesServer.allowCredentials) {
            opcionesServer.allowCredentials.forEach(cred => {
                cred.id = base64ToBuffer(cred.id);
            });
        }

        // C. Levantar el escáner de huella/rostro para firmar el desafío
        const assertionNativa = await navigator.credentials.get({
            publicKey: opcionesServer
        });

        // D. Convertir la firma a texto JSON
        const assertionParaEnviar = {
            id: assertionNativa.id,
            rawId: bufferToBase64(assertionNativa.rawId),
            type: assertionNativa.type,
            response: {
                authenticatorData: bufferToBase64(assertionNativa.response.authenticatorData),
                clientDataJSON: bufferToBase64(assertionNativa.response.clientDataJSON),
                signature: bufferToBase64(assertionNativa.response.signature),
                userHandle: assertionNativa.response.userHandle ? bufferToBase64(assertionNativa.response.userHandle) : null
            }
        };

        // E. Enviar la firma a validar en tu servidor privado
        const resultadoLogin = await fetch(`${API_URL}/login/verificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, assertion: assertionParaEnviar })
        });

        if (resultadoLogin.ok) {
            const datosSesion = await resultadoLogin.json();
            
            // Guardar token de sesión enviado por tu servidor privado
            localStorage.setItem('token_koco', datosSesion.token);
            
            // --- FLUJO DE ENTRADA A KOCO ACREIMEX ---
            // Ocultamos la pantalla de login y mostramos la interfaz del chat tal como lo hace tu app
            document.getElementById('pantalla-login').style.display = 'none';
            document.getElementById('contenido-pwa').style.display = 'block';
            
            // Si tienes una función inicializadora del chat, la ejecutas aquí:
            // inicializarChatKoco();
        } else {
            alert("Acceso denegado: Huella digital no reconocida.");
        }

    } catch (error) {
        console.error("Error en login:", error);
        alert("Error de autenticación biométrica.");
    }
}

// =========================================================
// 3. AUXILIARES DE CONVERSIÓN (Mantener intactos al final)
// =========================================================
function base64ToBuffer(str) {
    const decodificado = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    const buffer = new Uint8Array(decodificado.length);
    for (let i = 0; i < decodificado.length; i++) {
        buffer[i] = decodificado.charCodeAt(i);
    }
    return buffer.buffer;
}

function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let stringBinario = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        stringBinario += String.fromCharCode(bytes[i]);
    }
    return btoa(stringBinario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}