/* ============================================================
   INTERACCIONES — todo funciona sin librerías externas
   ============================================================ */

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

/* --- Productos: acordeón + imagen flotante que sigue al cursor --- */
const productos = document.querySelectorAll('.prod');
const flotante = document.getElementById('flotante');
const flotImgs = flotante.querySelectorAll('img');
let fx = 0, fy = 0, tx = 0, ty = 0, flotVisible = false;
const ratonFino = matchMedia('(hover:hover) and (pointer:fine)').matches;

productos.forEach((prod, i) => {
  const cab = prod.querySelector('.prod-cab');
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

/* --- Botón "Pedir información": preselecciona asunto y salta al formulario --- */
const asunto = document.getElementById('asunto');
const formulario = document.getElementById('form');
document.querySelectorAll('[data-producto]').forEach(btn => {
  btn.addEventListener('click', () => {
    asunto.value = btn.dataset.producto;
    document.getElementById('contacto').scrollIntoView({behavior:'smooth'});
    formulario.classList.add('destello');
    setTimeout(() => formulario.classList.remove('destello'), 1800);
    setTimeout(() => document.getElementById('nombre').focus({preventScroll:true}), 700);
  });
});

/* --- Proceso: foto sticky que cambia según el paso visible --- */
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

/* --- Formulario: validación inline + toast --- */
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
  // Envío real a enviar.php (necesita hosting con PHP). Si la web se abre
  // sin servidor, avisamos con un contacto alternativo.
  const boton = formulario.querySelector('button[type="submit"]');
  boton.disabled = true;
  fetch('enviar.php', { method: 'POST', body: new FormData(formulario) })
    .then(r => { if(!r.ok) throw 0; return r.json(); })
    .then(res => {
      formulario.reset();
      mostrarToast(res.ok
        ? '¡Mensaje enviado! Te respondemos en 24–48 h.'
        : (res.error || 'No se pudo enviar. Escríbenos a hola@granjapilono.es'));
    })
    .catch(() => {
      formulario.reset();
      mostrarToast('Sin servidor de correo. Escríbenos a hola@granjapilono.es');
    })
    .finally(() => { boton.disabled = false; });
});

/* --- Año dinámico --- */
document.getElementById('anio').textContent = new Date().getFullYear();
