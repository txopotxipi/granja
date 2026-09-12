<?php
/**
 * enviar.php — Recepción del formulario de Granja Piloño.
 * Requiere un hosting con PHP 8+ (mail() o SMTP configurado).
 *
 * Dos formas de responder, según cómo llegue la petición:
 *   - Con JavaScript: el navegador envía por fetch() con el campo
 *     `form_ajax=1` y recibe JSON (el visitante no sale de la web).
 *   - Sin JavaScript: el formulario hace un POST normal. Aquí se
 *     devuelve una página HTML de cortesía, nunca un JSON crudo ni
 *     los datos en la barra de direcciones.
 */

// ------------------------------------------------------------------
//  AJUSTES
// ------------------------------------------------------------------
const DESTINATARIO = 'hola@granjapilono.es';   // <- email real de Ignacio
const REMITENTE   = 'no-reply@granjapilono.es'; // debe ser del mismo dominio
const MAX_ENVIOS  = 5;    // envíos permitidos por IP...
const VENTANA     = 600;  // ...en esta ventana, en segundos (10 minutos)
const MIN_SEGUNDOS = 2.5; // por debajo de esto, es un bot

$esAjax = !empty($_POST['form_ajax']);

/**
 * Responde en JSON (peticiones con JavaScript) o con una página HTML
 * de cortesía (peticiones sin JavaScript). Siempre termina el script.
 */
function responder(array $datos, int $codigo = 200): never
{
    global $esAjax;
    http_response_code($codigo);

    if ($esAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($datos);
        exit;
    }

    header('Content-Type: text/html; charset=utf-8');
    $ok = !empty($datos['ok']);
    $titulo  = $ok ? 'Mensaje enviado' : 'No se pudo enviar';
    $simbolo = $ok ? '&#10003;' : '&#33;';
    $mensaje = $ok
        ? 'Gracias por escribirnos. Te responderemos en 24–48 h laborables.'
        : htmlspecialchars($datos['error'] ?? 'Ha ocurrido un problema.', ENT_QUOTES, 'UTF-8');
    $color   = $ok ? '#6C6A3F' : '#B04628';
    echo <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>{$titulo} — Granja Piloño</title>
<style>
  :root{--crema:#F2ECDF;--tinta:#251F17;--teja:#B04628}
  *{margin:0;box-sizing:border-box}
  body{min-height:100svh;display:grid;place-items:center;background:var(--crema);color:var(--tinta);
       font-family:Georgia,'Times New Roman',serif;text-align:center;padding:24px}
  .icono{font-size:56px;line-height:1;color:{$color}}
  h1{font-size:clamp(22px,4vw,30px);margin:14px 0 12px;font-weight:normal}
  p{max-width:46ch;margin:0 auto 26px;line-height:1.6;opacity:.85}
  a.btn{display:inline-block;padding:14px 26px;border-radius:999px;background:var(--teja);color:var(--crema);
        text-decoration:none;font-family:Verdana,Geneva,sans-serif;font-size:14px}
  a.btn:hover{filter:brightness(1.08)}
</style>
</head>
<body>
<main>
  <p class="icono" aria-hidden="true">{$simbolo}</p>
  <h1>{$titulo}</h1>
  <p>{$mensaje}</p>
  <a class="btn" href="/">Volver a la granja</a>
</main>
</body>
</html>
HTML;
    exit;
}

// ------------------------------------------------------------------
//  Solo POST
// ------------------------------------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

// ------------------------------------------------------------------
//  Honeypot: si el campo "web" llega relleno, es un bot.
//  Respondemos OK para no darle pistas.
// ------------------------------------------------------------------
if (!empty($_POST['web'])) {
    responder(['ok' => true]);
}

// ------------------------------------------------------------------
//  IP real del visitante.
//  Detrás de Cloudflare, REMOTE_ADDR es la IP del edge: si se usara
//  para limitar, TODOS los visitantes compartirían el mismo cupo.
//  CF-Connecting-IP lo pone Cloudflare y no se puede falsificar desde
//  el cliente. Se acepta también X-Real-IP (NGINX) como respaldo.
// ------------------------------------------------------------------
function ip_cliente(): string
{
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'] as $clave) {
        $valor = $_SERVER[$clave] ?? '';
        if ($valor === '') {
            continue;
        }
        $ip = trim(explode(',', $valor)[0]);
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }
    return 'anonimo';
}

// ------------------------------------------------------------------
//  Antispam por tasa: máximo MAX_ENVIOS por IP cada VENTANA segundos.
//  El formulario es público; esto frena a los bots que rellenan el
//  honeypot en bucle sin molestar a una persona que ensaya un par de
//  veces. El cupo se cuenta ANTES de validar, a propósito.
// ------------------------------------------------------------------
$dirLog = __DIR__ . '/tmp-log';
@mkdir($dirLog, 0755, true);

// Limpieza oportunista: de vez en cuando se borran los contadores
// caducados para que tmp-log/ no crezca sin límite.
if (random_int(1, 50) === 1) {
    foreach (glob($dirLog . '/limite-*.tmp') ?: [] as $viejo) {
        if (@filemtime($viejo) < time() - 86400) {
            @unlink($viejo);
        }
    }
}

$fichero = $dirLog . '/limite-' . md5(ip_cliente()) . '.tmp';
$ahora   = time();
$intentos = array_values(array_filter(
    array_map('intval', file_exists($fichero) ? (array) json_decode((string) @file_get_contents($fichero), true) : []),
    fn($t) => $t > $ahora - VENTANA
));

if (count($intentos) >= MAX_ENVIOS) {
    responder(['ok' => false, 'error' => 'Demasiados envíos seguidos. Espera unos minutos o escríbenos por email.'], 429);
}

$intentos[] = $ahora;
@file_put_contents($fichero, json_encode($intentos), LOCK_EX);

// ------------------------------------------------------------------
//  Guarda de velocidad: un humano tarda más de 2,5 s en leer y
//  escribir el formulario. `form_inicio` llega en milisegundos
//  (Date.now()) y time() está en segundos.
// ------------------------------------------------------------------
if (!empty($_POST['form_inicio']) && ($ahora - (int) ($_POST['form_inicio'] / 1000)) < MIN_SEGUNDOS) {
    responder(['ok' => false, 'error' => 'Envío demasiado rápido. Vuelve a intentarlo.'], 429);
}

// ------------------------------------------------------------------
//  Recogida y validación (la del navegador nunca es suficiente)
// ------------------------------------------------------------------
$nombre     = trim((string) ($_POST['nombre'] ?? ''));
$email      = trim((string) ($_POST['email'] ?? ''));
$asunto     = trim((string) ($_POST['asunto'] ?? 'Consulta web'));
$mensaje    = trim((string) ($_POST['mensaje'] ?? ''));
$privacidad = !empty($_POST['privacidad']);

$errores = [];
if (mb_strlen($nombre) < 2) {
    $errores[] = 'nombre';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errores[] = 'email';
}
if (mb_strlen($mensaje) < 10) {
    $errores[] = 'mensaje';
}
if (!$privacidad) {
    $errores[] = 'privacidad';
}
if ($errores) {
    responder(['ok' => false, 'error' => 'Revisa los campos marcados: ' . implode(', ', $errores) . '.'], 422);
}

// Anti-inyección de cabeceras: fuera saltos de línea del email.
$email_limpio = str_replace(["\r", "\n", '%0a', '%0d'], '', $email);

// El asunto también va al encabezado del correo: se limpia igual.
$asunto_limpio = mb_substr(str_replace(["\r", "\n"], ' ', $asunto), 0, 120);

$asunto_mail = '[Web Granja Piloño] ' . $asunto_limpio;
$cuerpo      = "Nombre: {$nombre}\n"
             . "Email: {$email}\n"
             . "Asunto: {$asunto_limpio}\n\n"
             . $mensaje . "\n";

// MIME-Version + Content-Type: el cuerpo viaja como UTF-8 explícito y
// los acentos y eñes no se corrompen en el correo.
$cabeceras = "MIME-Version: 1.0\r\n"
           . "Content-Type: text/plain; charset=UTF-8\r\n"
           . 'From: Web Granja Piloño <' . REMITENTE . ">\r\n"
           . "Reply-To: {$email_limpio}\r\n";

// TODO (spam): mail() envía sin autenticación y algunos proveedores
// marcan esos correos como spam de forma sistemática. Si pasa, migrar
// a SMTP autenticado con PHPMailer (host del correo, puerto 587,
// usuario y contraseña). Solo cambia esta llamada: toda la validación
// y el antispam de arriba siguen sirviendo exactamente igual.
$enviado = @mail(
    DESTINATARIO,
    '=?UTF-8?B?' . base64_encode($asunto_mail) . '?=',
    $cuerpo,
    $cabeceras
);

if ($enviado) {
    responder(['ok' => true]);
}

responder(['ok' => false, 'error' => 'No se pudo enviar el mensaje. Escríbenos a ' . DESTINATARIO], 500);
