/* ============================================================
   INTERACCIONES — todo funciona sin librerías externas
   ============================================================ */

/* --- Ajustes de la casa (cámbialos aquí y cambian en toda la web) --- */
const WHATSAPP       = '34600000000';        // <- número real, sin + ni espacios
const DESTINO_EMAIL  = 'hola@granjapilono.es';
const ENDPOINT_FORMULARIO = '';              // <- URL del servicio que reciba el mensaje (ver README)

/* --- Cabecera: fondo al hacer scroll --- */
const header = document.getElementById('header');
const anadirScroll = () => header.classList.toggle('scrolled', scrollY > 30);
addEventListener('scroll', anadirScroll, {passive:true}); anadirScroll();

/* --- Menú móvil --- */
const menuBtn = document.getElementById('menuBtn');
const menuMovil = document.getElementById('menuMovil');
function alternarMenu(forzar){
  const abierto = forzar !== undefined ? forzar : !menuMovil.classList.contains('abierto');
  menuMovil.classList.toggle('abierto', abierto);
  menuBtn.classList.toggle('abierto', abierto);
  menuBtn.setAttribute('aria-expanded', abierto);
  menuBtn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  document.body.classList.toggle('sin-scroll', abierto);
}
menuBtn.addEventListener('click', () => alternarMenu());
menuMovil.querySelectorAll('a').forEach(a => a.addEventListener('click', () => alternarMenu(false)));

/* --- Marquee: duplicar contenido para bucle infinito --- */
const mqTrack = document.getElementById('marqueeTrack');
mqTrack.innerHTML += mqTrack.innerHTML;

/* --- Aparición de elementos al hacer scroll --- */
const io = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* --- Contadores animados --- */
const easeOut = t => 1 - Math.pow(1 - t, 3);
function animarContador(el){
  const objetivo = +el.dataset.objetivo, dur = 1600, t0 = performance.now();
  (function paso(t){
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(easeOut(p) * objetivo);
    if(p < 1) requestAnimationFrame(paso);
  })(t0);
}
const ioCont = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if(e.isIntersecting){ animarContador(e.target); ioCont.unobserve(e.target); }
  });
}, {threshold:.6});
document.querySelectorAll('.contador').forEach(el => { el.textContent = '0'; ioCont.observe(el); });

/* --- Parallax sutil en imágenes --- */
const parallaxs = document.querySelectorAll('.parallax img');
function parallax(){
  parallaxs.forEach(img => {
    const r = img.parentElement.getBoundingClientRect();
    if(r.bottom < 0 || r.top > innerHeight) return;
    const p = (r.top + r.height/2 - innerHeight/2) / innerHeight;
    img.style.transform = `translateY(${p * 9}%) scale(1.15)`;
  });
}
addEventListener('scroll', () => requestAnimationFrame(parallax), {passive:true}); parallax();

/* ============================================================
   BARRA DE PROGRESO, WHATSAPP FLOTANTE Y NAVEGACIÓN ACTIVA
   Un solo listener para los tres: menos trabajo por scroll.
   ============================================================ */
const progreso = document.getElementById('progreso');
const waFlotante = document.getElementById('waFlotante');
const navDesk = document.getElementById('navDesk');
const enlacesNav = navDesk ? [...navDesk.querySelectorAll('a')] : [];
const seccionesNav = enlacesNav
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

function alScroll(){
  // Barra de progreso de lectura
  const recorrido = document.documentElement.scrollHeight - innerHeight;
  progreso.style.width = (recorrido > 0 ? Math.min(scrollY / recorrido, 1) * 100 : 0) + '%';

  // Acceso directo a WhatsApp: aparece al dejar atrás el hero
  waFlotante.classList.toggle('ver', scrollY > innerHeight * .7);

  // Navegación activa (scrollspy)
  let activo = '';
  seccionesNav.forEach(sec => {
    if(sec.getBoundingClientRect().top <= innerHeight * .35) activo = sec.id;
  });
  enlacesNav.forEach(a => {
    if(a.getAttribute('href') === '#' + activo) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}
addEventListener('scroll', () => requestAnimationFrame(alScroll), {passive:true});
addEventListener('resize', () => requestAnimationFrame(alScroll), {passive:true});
alScroll();

/* ============================================================
   PRODUCTOS: acordeón + imagen flotante que sigue al cursor
   ============================================================ */
const productos = document.querySelectorAll('.prod');
const flotante = document.getElementById('flotante');
const flotImgs = flotante.querySelectorAll('img');
let fx = 0, fy = 0, tx = 0, ty = 0, flotVisible = false;
const ratonFino = matchMedia('(hover:hover) and (pointer:fine)').matches;

productos.forEach((prod, i) => {
  const cab = prod.querySelector('.prod-cab');
  const cuerpo = prod.querySelector('.prod-body');

  // Accesibilidad ARIA del acordeón: cada botón controla su panel y cada
  // panel apunta a su botón. Los ids se generan aquí para que el HTML y el
  // JS nunca se desincronicen si se añade o reordena un producto.
  const idCab = `prod-cab-${i + 1}`;
  const idCuerpo = `prod-body-${i + 1}`;
  cab.id = idCab;
  cuerpo.id = idCuerpo;
  cab.setAttribute('aria-controls', idCuerpo);
  cuerpo.setAttribute('role', 'region');
  cuerpo.setAttribute('aria-labelledby', idCab);

  cab.addEventListener('click', () => {
    const yaAbierto = prod.classList.contains('abierto');
    productos.forEach(p => { p.classList.remove('abierto'); p.querySelector('.prod-cab').setAttribute('aria-expanded','false'); });
    if(!yaAbierto){ prod.classList.add('abierto'); cab.setAttribute('aria-expanded','true'); }
  });
  if(ratonFino){
    prod.addEventListener('mouseenter', () => {
      flotImgs.forEach((im, j) => im.classList.toggle('activa', j === i));
      flotante.classList.add('ver'); flotVisible = true;
    });
    prod.addEventListener('mouseleave', () => { flotante.classList.remove('ver'); flotVisible = false; });
    prod.addEventListener('mousemove', e => { tx = e.clientX + 30; ty = e.clientY - 110; });
  }
});
if(ratonFino){
  fx = tx = innerWidth/2; fy = ty = innerHeight/2;
  (function seguir(){
    fx += (tx - fx) * .12; fy += (ty - fy) * .12;
    if(flotVisible || flotante.classList.contains('ver')){
      flotante.style.left = Math.min(fx, innerWidth - 340) + 'px';
      flotante.style.top  = Math.max(10, Math.min(fy, innerHeight - 250)) + 'px';
    }
    requestAnimationFrame(seguir);
  })();
}

/* --- Llevar el visitante al formulario con el contexto ya puesto --- */
const asunto = document.getElementById('asunto');
const formulario = document.getElementById('form');

/**
 * Señala el formulario, se desplaza hasta él y deja el cursor en el nombre.
 * El foco se aplica al terminar el desplazamiento y SOLO si el visitante no
 * se ha ido a otra parte entretanto: si no, le robaríamos el foco de lo que
 * acaba de abrir (por ejemplo, el visor de fotos).
 */
function llevarAlFormulario(origen){
  document.getElementById('contacto').scrollIntoView({behavior:'smooth'});
  formulario.classList.add('destello');
  setTimeout(() => formulario.classList.remove('destello'), 1800);
  setTimeout(() => {
    const foco = document.activeElement;
    if(foco === origen || foco === document.body){
      document.getElementById('nombre').focus({preventScroll:true});
    }
  }, 700);
}

document.querySelectorAll('[data-producto]').forEach(btn => {
  btn.addEventListener('click', () => {
    asunto.value = btn.dataset.producto;
    llevarAlFormulario(btn);
  });
});

/* ============================================================
   CALCULADORA DE PEDIDO
   Ración media: 150 g de carne por persona y comida.
   ============================================================ */
const PRECIO  = { piezas: 9.00, media: 6.80, entera: 5.90 };
const PESO    = { piezas: 0,    media: 45,   entera: 90   };   // kg por pieza (0 = al peso)
const NOMBRE  = { piezas: 'Piezas sueltas', media: 'Media canal', entera: 'Canal entera' };
const RACION  = 0.15;   // kg de carne por persona y comida

const calcPersonas  = document.getElementById('calcPersonas');
const calcRaciones  = document.getElementById('calcRaciones');
const calcKg        = document.getElementById('calcKg');
const calcNota      = document.getElementById('calcNota');

const eur = n => n.toLocaleString('es-ES', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' €';
const kg  = n => n.toLocaleString('es-ES', {maximumFractionDigits:1}) + ' kg';

/* Los precios del selector de formato ("9,00 €/kg") salen de PRECIO, no del
   HTML: cambiar la constante cambia la web entera. En el HTML quedan como
   texto de partida, para que la página siga siendo legible sin JavaScript. */
document.querySelectorAll('input[name="calcFormato"]').forEach(radio => {
  const etiqueta = radio.closest('.seg-item').querySelector('small');
  if(etiqueta) etiqueta.textContent = eur(PRECIO[radio.value]) + '/kg';
});

function formatoElegido(){
  return document.querySelector('input[name="calcFormato"]:checked').value;
}

/**
 * Coste real de un formato para un consumo dado. La media canal y la canal
 * entera se venden por piezas completas, así que hay que contar CUÁNTAS
 * hacen falta: con 150 kg al año, una canal entera de 90 kg no llega y el
 * coste es el de dos piezas, no el de una. Las piezas sueltas van al peso
 * exacto, sin sobrantes.
 */
function costeDe(formato, consumo){
  const peso = PESO[formato];
  if(!peso) return consumo * PRECIO.piezas;
  return Math.max(1, Math.ceil(consumo / peso)) * peso * PRECIO[formato];
}

/* Cómo se pide el formato elegido en los mensajes que salen de la web
   (WhatsApp y formulario): "2 piezas de 90 kg (180 kg en total)" o "al peso". */
function pedidoEnTexto({ formato, piezas, kgFormato }){
  if(!PESO[formato]) return 'al peso';
  return piezas > 1
    ? `${piezas} piezas de ${kg(PESO[formato])} (${kg(kgFormato)} en total)`
    : kg(PESO[formato]);
}

function calcular(){
  const personas = +calcPersonas.value;
  const raciones = +calcRaciones.value;
  const formato  = formatoElegido();

  document.getElementById('calcPersonasOut').textContent = personas;
  document.getElementById('calcRacionesOut').textContent = raciones;

  // Consumo anual estimado
  const consumo = Math.round(personas * raciones * RACION * 52);

  // Formato que mejor encaja: el que sale más barato DE VERDAD a ese
  // consumo. No sirve mirar el precio por kilo de la etiqueta, porque las
  // piezas enteras se compran completas: con poco consumo, 9 €/kg al peso
  // sale mejor que una canal entera a 5,90 €/kg que no se aprovecha.
  // En caso de empate gana el primero de la lista, que es el que menos kg
  // deja de sobra.
  const recomendado = ['piezas', 'media', 'entera']
    .reduce((mejor, f) => costeDe(f, consumo) < costeDe(mejor, consumo) ? f : mejor);

  const costePiezas  = consumo * PRECIO.piezas;
  const pesoFormato  = PESO[formato];
  const piezas       = pesoFormato ? Math.max(1, Math.ceil(consumo / pesoFormato)) : 0;
  const kgFormato    = pesoFormato ? piezas * pesoFormato : consumo;
  const costeFormato = costeDe(formato, consumo);
  const ahorro       = costePiezas - costeFormato;

  calcKg.textContent = consumo;
  document.getElementById('calcFormatoRec').textContent = NOMBRE[recomendado];
  document.getElementById('calcPesoEtiqueta').textContent = piezas > 1 ? 'Piezas necesarias' : 'Peso de la pieza';
  document.getElementById('calcPeso').textContent = !pesoFormato
    ? 'Al peso'
    : (piezas > 1 ? `${piezas} × ${kg(pesoFormato)}` : kg(pesoFormato));
  document.getElementById('calcCoste').textContent = eur(costeFormato);
  // Precio por kilo de lo que se compra: en piezas sueltas es el precio al
  // peso y en piezas enteras, el del formato (todo lo comprado se paga).
  document.getElementById('calcEfectivo').textContent = eur(costeFormato / kgFormato) + '/kg';

  // El ahorro siempre se mide contra comprar la misma cantidad al peso. Si el
  // visitante ya está en piezas sueltas, no hay nada que restar: lo útil es
  // decirle cuánto se ahorraría si cambiara al formato recomendado.
  const ddAhorro = document.getElementById('calcAhorro');
  const dtAhorro = document.getElementById('calcAhorroEtiqueta');
  if(formato === 'piezas' && recomendado !== 'piezas'){
    dtAhorro.textContent = `Ahorrarías con ${NOMBRE[recomendado].toLowerCase()}`;
    ddAhorro.textContent = eur(costePiezas - costeDe(recomendado, consumo));
  } else if(formato === 'piezas'){
    dtAhorro.textContent = 'Ahorro frente a piezas sueltas';
    ddAhorro.textContent = '—';
  } else if(ahorro >= 0){
    dtAhorro.textContent = 'Ahorro frente a piezas sueltas';
    ddAhorro.textContent = eur(ahorro);
  } else {
    // Una pieza entera que no se aprovecha sale más caro que comprar al
    // peso. Se dice en positivo, que se entiende mejor que un número
    // negativo.
    dtAhorro.textContent = 'Comprar al peso te ahorraría';
    ddAhorro.textContent = eur(-ahorro);
  }

  // Nota contextual: se construye con los mismos números que se ven arriba,
  // así que no puede contradecirlos. Primero, lo que de verdad hay que
  // comprar (y lo que sobra, si sobra); después, la alternativa más barata,
  // si existe. En piezas sueltas esa alternativa ya está en la línea de
  // arriba («Ahorrarías con…»), así que aquí no se repite.
  const alternativa = formato !== 'piezas' && recomendado !== formato
    ? ` Para tu consumo sale mejor ${NOMBRE[recomendado].toLowerCase()}: ${eur(costeDe(recomendado, consumo))}.`
    : '';
  let nota;
  if(!pesoFormato){
    nota = `Compras al peso, sin sobrantes: unos ${kg(consumo)} al año.` + alternativa;
  } else if(piezas === 1){
    nota = `Una ${NOMBRE[formato].toLowerCase()} son unos ${kg(pesoFormato)}: `
         + (consumo < pesoFormato
             ? `te sobrarían unos ${kg(pesoFormato - consumo)}, que se conservan congelados y en embutidos.`
             : 'te cubre el año entero.')
         + alternativa;
  } else {
    nota = `Con ${kg(consumo)} al año una pieza no te llega: necesitas ${piezas} piezas de ${kg(pesoFormato)} `
         + `(${kg(kgFormato)} en total), unos ${eur(costeFormato)}.` + alternativa;
  }
  calcNota.textContent = nota;

  return { consumo, formato, personas, piezas, kgFormato, costeFormato };
}

if(calcPersonas){
  calcPersonas.addEventListener('input', calcular);
  calcRaciones.addEventListener('input', calcular);
  document.querySelectorAll('input[name="calcFormato"]').forEach(r => r.addEventListener('change', calcular));
  calcular();
}

/* Abre WhatsApp con un mensaje ya escrito (el visitante solo pulsa enviar) */
function abrirWhatsApp(texto){
  const url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
  const ventana = window.open(url, '_blank', 'noopener');
  if(!ventana) window.location.href = url;
}

/* "Pedir este formato": lleva el resultado al canal que elija el visitante */
const calcPedir = document.getElementById('calcPedir');
if(calcPedir){
  calcPedir.addEventListener('click', () => {
    const { consumo, formato, personas, piezas, kgFormato, costeFormato } = calcular();
    abrirWhatsApp(
      `Hola, he usado la calculadora de la web de Granja Piloño.\n\n` +
      `Somos ${personas} en casa y calculo unos ${consumo} kg de cerdo al año.\n` +
      `Me interesa: ${NOMBRE[formato]} (${pedidoEnTexto({ formato, piezas, kgFormato })}).\n` +
      `Con la calculadora me sale por unos ${eur(costeFormato)}.\n\n` +
      `¿Me confirmáis precio y disponibilidad?`
    );
  });

  document.getElementById('calcFormulario').addEventListener('click', e => {
    const { consumo, formato, personas, piezas, kgFormato, costeFormato } = calcular();
    asunto.value = 'Cerdo entero por encargo';
    document.getElementById('mensaje').value =
      `Hola, he usado la calculadora: somos ${personas} en casa y calculo unos ${consumo} kg de cerdo al año. ` +
      `Me interesa ${NOMBRE[formato].toLowerCase()} (${pedidoEnTexto({ formato, piezas, kgFormato })}), unos ${eur(costeFormato)}. ` +
      `¿Me confirmáis precio y disponibilidad?`;
    llevarAlFormulario(e.currentTarget);
  });
}

/* ============================================================
   RESERVA DE VISITA: los próximos sábados, calculados en vivo
   ============================================================ */
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const reservaDia = document.getElementById('reservaDia');
const reservaForm = document.getElementById('reservaForm');

if(reservaDia){
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  // Próximo sábado (si hoy es sábado, salta al siguiente: no se reserva el mismo día)
  const primerSabado = new Date(hoy);
  primerSabado.setDate(hoy.getDate() + ((6 - hoy.getDay() + 7) % 7 || 7));

  for(let i = 0; i < 6; i++){
    const fecha = new Date(primerSabado);
    fecha.setDate(primerSabado.getDate() + i * 7);
    const opcion = document.createElement('option');
    opcion.value = fecha.toISOString().slice(0, 10);
    opcion.textContent = `sábado ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
    reservaDia.appendChild(opcion);
  }
}

if(reservaForm){
  reservaForm.addEventListener('submit', e => {
    e.preventDefault();
    const personas = Math.min(12, Math.max(1, parseInt(document.getElementById('reservaPersonas').value, 10) || 1));
    document.getElementById('reservaPersonas').value = personas;
    abrirWhatsApp(
      `Hola, quiero reservar una visita a la Granja Piloño.\n\n` +
      `Día: ${reservaDia.options[reservaDia.selectedIndex].textContent}\n` +
      `Turno: ${document.getElementById('reservaTurno').value}\n` +
      `Personas: ${personas}\n\n` +
      `¿Me confirmáis disponibilidad?`
    );
  });
}

/* ============================================================
   PREGUNTAS FRECUENTES: solo una abierta a la vez
   ============================================================ */
const faqs = document.querySelectorAll('.faq-item');
faqs.forEach(faq => {
  faq.addEventListener('toggle', () => {
    if(faq.open) faqs.forEach(otro => { if(otro !== faq) otro.open = false; });
  });
});

/* ============================================================
   VISOR DE FOTOS (galería)
   ============================================================ */
const galeria = document.getElementById('galeria');
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');
const lbContador = document.getElementById('lbContador');
const lbCerrar = document.getElementById('lbCerrar');
const botonesFoto = galeria ? [...galeria.querySelectorAll('.g-abrir')] : [];
let lbIndice = 0;
let lbFocoPrevio = null;

function lbPintar(indice){
  lbIndice = (indice + botonesFoto.length) % botonesFoto.length;
  const img = botonesFoto[lbIndice].querySelector('img');
  const caption = botonesFoto[lbIndice].closest('figure').querySelector('figcaption');
  lbImg.src = img.currentSrc || img.src;
  lbImg.alt = img.alt;
  lbCaption.textContent = caption ? caption.textContent : '';
  lbContador.textContent = `${lbIndice + 1} / ${botonesFoto.length}`;
}

function lbAbrir(indice){
  lbFocoPrevio = document.activeElement;
  lbPintar(indice);
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add('ver'));
  document.body.classList.add('sin-scroll');
  lbCerrar.focus();
}

function lbOcultar(){
  lightbox.classList.remove('ver');
  document.body.classList.remove('sin-scroll');
  setTimeout(() => { lightbox.hidden = true; }, 300);
  if(lbFocoPrevio) lbFocoPrevio.focus();
}

if(lightbox && botonesFoto.length){
  botonesFoto.forEach((btn, i) => btn.addEventListener('click', () => lbAbrir(i)));
  lbCerrar.addEventListener('click', lbOcultar);
  document.getElementById('lbPrev').addEventListener('click', () => lbPintar(lbIndice - 1));
  document.getElementById('lbNext').addEventListener('click', () => lbPintar(lbIndice + 1));

  // Cerrar al pulsar fuera de la foto
  lightbox.addEventListener('click', e => { if(e.target === lightbox) lbOcultar(); });

  // Teclado: Escape cierra, flechas navegan, Tab se queda dentro
  document.addEventListener('keydown', e => {
    if(lightbox.hidden) return;
    if(e.key === 'Escape') lbOcultar();
    else if(e.key === 'ArrowLeft') lbPintar(lbIndice - 1);
    else if(e.key === 'ArrowRight') lbPintar(lbIndice + 1);
    else if(e.key === 'Tab'){
      const foco = [...lightbox.querySelectorAll('button')];
      const i = foco.indexOf(document.activeElement);
      if(e.shiftKey && i <= 0){ e.preventDefault(); foco[foco.length - 1].focus(); }
      else if(!e.shiftKey && i === foco.length - 1){ e.preventDefault(); foco[0].focus(); }
    }
  });

  // Deslizar con el dedo
  let toqueX = null;
  lightbox.addEventListener('touchstart', e => { toqueX = e.changedTouches[0].clientX; }, {passive:true});
  lightbox.addEventListener('touchend', e => {
    if(toqueX === null) return;
    const recorrido = e.changedTouches[0].clientX - toqueX;
    if(Math.abs(recorrido) > 50) lbPintar(lbIndice + (recorrido < 0 ? 1 : -1));
    toqueX = null;
  }, {passive:true});
}

/* ============================================================
   PROCESO: foto sticky que cambia según el paso visible
   ============================================================ */
const pasos = document.querySelectorAll('.paso');
const fotosProceso = document.querySelectorAll('#procesoFoto img');
const fotoNum = document.getElementById('fotoNum');
const ioPasos = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if(!e.isIntersecting) return;
    const i = +e.target.dataset.i;
    pasos.forEach(p => p.classList.toggle('activo', +p.dataset.i === i));
    fotosProceso.forEach((f, j) => f.classList.toggle('activa', j === i));
    fotoNum.textContent = String(i + 1).padStart(2, '0');
  });
}, {rootMargin:'-42% 0px -42% 0px'});
pasos.forEach(p => ioPasos.observe(p));

/* ============================================================
   FORMULARIO: validación inline + envío + toast
   ============================================================ */

/* --- Marca de tiempo para el antispam de enviar.php ---
   enviar.php descarta los envíos hechos en menos de 2,5 s desde esta marca:
   eso es un bot, no una persona. Por eso la marca se pone al CARGAR la
   página, no al enviar — si se pusiera al enviar, la diferencia sería
   siempre de 0 s y el servidor rechazaría hasta los mensajes de una persona.
   `pageshow` la refresca cuando el navegador restaura la página desde su
   caché (bfcache): ahí el HTML vuelve tal cual estaba, con la marca de una
   visita anterior. */
const formInicio = document.getElementById('form_inicio');
function marcarInicio(){ if(formInicio) formInicio.value = Date.now(); }
marcarInicio();
addEventListener('pageshow', marcarInicio);

const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
let toastTimer;
function mostrarToast(msg){
  toastMsg.textContent = msg;
  toast.classList.add('ver');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('ver'), 4200);
}
function marcarCampo(input, msg){
  const campo = input.closest('.campo');
  campo.classList.toggle('falla', !!msg);
  campo.querySelector('.error-msg').textContent = msg || '';
}
['nombre','email','mensaje'].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('input', () => marcarCampo(input, ''));
});
const privacidad = document.getElementById('privacidad');
if(privacidad){
  privacidad.addEventListener('change', () => marcarCampo(privacidad, ''));
}

formulario.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = document.getElementById('nombre');
  const email = document.getElementById('email');
  const mensaje = document.getElementById('mensaje');
  let ok = true;
  if(nombre.value.trim().length < 2){ marcarCampo(nombre, 'Dinos al menos tu nombre.'); ok = false; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())){ marcarCampo(email, 'Ese email no parece válido.'); ok = false; }
  if(mensaje.value.trim().length < 10){ marcarCampo(mensaje, 'Cuéntanos un poco más (mín. 10 caracteres).'); ok = false; }
  if(privacidad && !privacidad.checked){ marcarCampo(privacidad, 'Debes aceptar la política de privacidad.'); ok = false; }
  if(!ok) return;

  // Honeypot (ahora en el navegador): si el campo trampa llega relleno es
  // un bot; fingimos éxito y no hacemos nada. Nadie nota la diferencia.
  if(document.getElementById('web').value.trim() !== ''){
    formulario.reset();
    marcarInicio();
    mostrarToast('¡Mensaje enviado! Te respondemos en 24–48 h.');
    return;
  }

  // ------------------------------------------------------------------
  //  ENVÍO DEL FORMULARIO
  //  ENDPOINT_FORMULARIO (arriba del archivo): cuando exista un servicio
  //  que reciba el mensaje (una Pages Function con Email Routing,
  //  Formspree, Brevo…), basta con pegar ahí su URL. El formulario
  //  enviará por POST y el visitante no saldrá de la web.
  //  Mientras esté vacío se usa mailto: — abre el correo del visitante
  //  con el mensaje ya escrito: cero dependencias, pero en un móvil sin
  //  app de correo configurada el mensaje no sale (limitación conocida).
  // ------------------------------------------------------------------
  if (ENDPOINT_FORMULARIO) {
    const boton = formulario.querySelector('button[type="submit"]');
    const datos = new FormData(formulario);
    datos.append('form_ajax', '1');   // así enviar.php responde JSON en vez de HTML
    boton.disabled = true;
    fetch(ENDPOINT_FORMULARIO, { method: 'POST', body: datos })
      .then(r => { if(!r.ok) throw 0; return r.json().catch(() => ({ok:true})); })
      .then(res => {
        if(res && res.ok === false) throw 0;
        formulario.reset();
        marcarInicio();
        mostrarToast('¡Mensaje enviado! Te respondemos en 24–48 h.');
      })
      .catch(() => mostrarToast('No se pudo enviar. Escríbenos a ' + DESTINO_EMAIL))
      .finally(() => { boton.disabled = false; });
    return;
  }
  const titulo = encodeURIComponent('[Web Granja Piloño] ' + asunto.value + ' — ' + nombre.value.trim());
  const cuerpoMail = encodeURIComponent(
    mensaje.value.trim() + '\n\n— ' + nombre.value.trim() + ' · ' + email.value.trim()
  );
  mostrarToast('Abriendo tu correo… si no se abre, escríbenos a ' + DESTINO_EMAIL);
  marcarInicio();
  window.location.href = 'mailto:' + DESTINO_EMAIL + '?subject=' + titulo + '&body=' + cuerpoMail;
});

/* --- Año dinámico --- */
document.getElementById('anio').textContent = new Date().getFullYear();

/* --- Móvil: miniatura del producto dentro del acordeón abierto.
   En escritorio la imagen flotante sigue al cursor; en pantallas táctiles
   no hay hover, así que mostramos una foto fija para que el producto se vea. --- */
const movil = matchMedia('(hover:none), (pointer:coarse)').matches;
if(movil){
  productos.forEach((prod, i) => {
    const src = prod.dataset.img;
    const mini = document.createElement('img');
    mini.className = 'prod-mini';
    mini.src = src;
    mini.srcset = `${src.replace('.webp', '-600.webp')} 600w, ${src.replace('.webp', '-900.webp')} 900w, ${src} ${flotImgs[i] ? flotImgs[i].width : 1200}w`;
    mini.sizes = '88vw';
    mini.alt = '';
    mini.loading = 'lazy';
    mini.decoding = 'async';
    const cuerpo = prod.querySelector('.prod-inner');
    cuerpo.insertBefore(mini, cuerpo.firstChild);
  });
}

/* --- Aplicación instalable: guarda una copia para arrancar sin conexión --- */
if('serviceWorker' in navigator){
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
