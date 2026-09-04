# Granja de Cerdos — Diseño Web Supermoderna y Sostenible

## Objetivo
Crear una landing page dinámica, atractiva y responsive para una granja de cerdos sostenible. Debe atraer al público con efectos modernos, transmitir sostenibilidad, bienestar animal y calidad premium.

## Audiencia
Consumidores conscientes, chefs, distribuidores sostenibles, público general interesado en productos de origen responsable.

## Dirección Estética
- **Estilo**: Supermoderno, premium-rural, sostenible, limpio. Mezcla de naturaleza orgánica + tecnología/energía sostenible.
- **Personalidad**: Fresca, confiable, cálida pero sofisticada. No rústica tosco — es "premium sostenible".
- **Memorable**: Animaciones fluidas (parallax scroll, partículas orgánicas, transiciones suaves), paleta verde musgo + ámbar cálido + negro profundo.

## Paleta de Colores
- Verde musgo profundo (#1B2E1B, #2D4A2D) — naturaleza/sostenibilidad
- Verde lima orgánico (#6B9E4A) — frescura
- Ámbar cálido (#D99A3E) — calidez/premium
- Crema (#F7F4E9) — fondo limpio
- Carbón (#1A1A1A) — contraste/texto
- Blanco roto (#F0EFE6)

## Tipografía
- Títulos: Serif elegante (Playfair Display o similar) — sofisticación rural premium
- Cuerpo: Sans-serif limpia, moderna (Inter / DM Sans) — legibilidad
- Acentos: Mono espaciada para datos/estadísticas

## Secciones (Single Page con scroll)
1. **Hero**: Video/gradiente animado de fondo, título grande con animación, subtítulo, CTA. Partículas orgánicas animadas (canvas).
2. **Sobre Nosotros**: Tarjetas interactivas con datos de sostenibilidad (animación de números), imagen de cerdos saludables.
3. **Proceso Sostenible**: Timeline vertical animada (bienestar animal, alimentación orgánica, energía renovable, bienestar).
4. **Productos**: Grid interactivo con hover effects, fotos premium de productos.
5. **Estadísticas / Impacto**: Números animados con contadores, iconos orgánicos.
6. **Testimonios / Reviews**: Carrusel suave con transiciones.
7. **Contacto / Newsletter**: Formulario minimalista con animación, mapa abstracto decorativo.
8. **Footer**: Minimal, elegante, con redes sociales y sello sostenible.

## Interactividad y Dinamismo
- Canvas con partículas orgánicas flotantes (verde musgo) en hero
- Scroll-triggered animations (elementos aparecen suavemente)
- Hover cards con elevación y sombra dinámica
- Parallax en secciones con capas
- Contadores animados al entrar en viewport
- Menú responsive hamburguesa con animación de apertura
- Transiciones suaves entre secciones

## Responsive
- Mobile-first. En móvil: stack vertical, menú hamburguesa, imágenes full-width, texto grande y legible. En desktop: layouts de 2-3 columnas con espacio generoso.

## Imágenes
- Hero: imagen de granja sostenible / campo verde con cerdos (usar gradiente + ilustración abstracta si no hay foto real)
- Productos: fotos premium de productos cárnicos / granja
- Sostenibilidad: iconos ilustrativos de energía solar, bienestar animal, alimentación orgánica
- Decorativos: patrones orgánicos suaves

## Notas Técnicas
- Una sola página `index.html` + `assets/` (CSS, JS, imágenes generadas)
- No dependencias externas pesadas; usar vanilla JS para máximo rendimiento y efectos custom.
- CSS con variables para paleta dinámica.
