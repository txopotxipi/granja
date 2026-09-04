<?php
/**
 * enviar.php — Recepción del formulario de Granja Piloño.
 * Requiere un hosting con PHP (mail() o SMTP configurado).
 * Sin PHP, el formulario muestra un aviso con el email alternativo.
 */

header('Content-Type: application/json; charset=utf-8');

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
  exit;
}

// Honeypot: si el campo "web" llega relleno, es un bot. Respondemos OK para no dar pistas.
if (!empty($_POST['web'])) {
  echo json_encode(['ok' => true]);
  exit;
}

$nombre      = trim($_POST['nombre']      ?? '');
$email       = trim($_POST['email']       ?? '');
$asunto      = trim($_POST['asunto']      ?? 'Consulta web');
$mensaje     = trim($_POST['mensaje']     ?? '');
$privacidad  = !empty($_POST['privacidad']);

// Validación en servidor (la del navegador nunca es suficiente)
$errores = [];
if (mb_strlen($nombre) < 2)  $errores[] = 'nombre';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errores[] = 'email';
if (mb_strlen($mensaje) < 10) $errores[] = 'mensaje';
if (!$privacidad)             $errores[] = 'privacidad';

if ($errores) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Revisa los campos marcados.']);
  exit;
}

// anti-inyección de cabeceras
$email_limpio = str_replace(["\r", "\n", '%0a', '%0d'], '', $email);

$destinatario = 'hola@granjapilono.es';           // <- cámbialo por el email real de Ignacio
$asunto_mail  = '[Web Granja Piloño] ' . $asunto;
$cuerpo       = "Nombre: {$nombre}\n"
              . "Email: {$email}\n"
              . "Asunto: {$asunto}\n\n"
              . $mensaje . "\n";
$cabeceras    = "From: Web Granja Piloño <no-reply@granjapilono.es>\r\n"
              . "Reply-To: {$email_limpio}\r\n";

$enviado = @mail($destinatario, '=?UTF-8?B?' . base64_encode($asunto_mail) . '?=', $cuerpo, $cabeceras);

if ($enviado) {
  echo json_encode(['ok' => true]);
} else {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'No se pudo enviar el mensaje. Escríbenos a hola@granjapilono.es']);
}
