# Navidado — design board (referencia que hay que seguir)

Imagen original: `docs/design-board.png` (en el repo). Este texto describe el board para poder trabajar sin la imagen.

## Marca
- Nombre: **Navidado**. Lema: «El juego de regalos más divertido de la Navidad» (en una cinta roja bajo el logo).
- Logo: «Navidado» en letra redondeada muy gruesa, blanca/crema con contorno rojo y sombra; un dado blanco con puntos rojos y gorro de Papá Noel encima; regalos rojos con lazo dorado a los lados.
- Ambiente: fondo verde abeto con ramas, guirnalda de luces amarillas arriba, colinas nevadas con abetos y pueblo nevado de noche (TV, último minuto). Destellos dorados.

## Paleta
| Nombre | Hex | Uso |
|---|---|---|
| Verde | #0B5D3B | Fondo de pantallas, temporizador normal, selección |
| Rojo | #D62828 | Botón principal, cabeceras de sección, último minuto |
| Crema | #FFF4E6 | Tarjetas, paneles, fondos claros |
| Dorado | #F4B400 | Aviso (3 min), acentos, iconos |
| Nieve | #FFFFFF | Texto sobre verde/rojo, botón secundario |
| (negro) | — | Estado 0:00 «¡Se acabó!» |

## Tipografía
- **Nunito** para títulos y botones (muy gruesa en títulos).
- **Inter** para textos e interfaz.

## Iconos de acciones (color)
- Derecha: flecha naranja → · Izquierda: flecha azul/morada ←
- Robo: cara amarilla con antifaz negro · Robo a ciegas: dado rojo
- Todos a la derecha: flechas circulares verdes · Todos a la izquierda: flechas circulares naranjas
- Remolino: espiral azul · Me lo quedo: candado dorado · ¡Feliz Navidad!: abeto verde
- Iconografía base: regalo, dado, grupo de personas, engranaje, reloj, trofeo (rojos/dorados).

## Avatares
Papá Noel, reno, elfo, muñeco de nieve, estrella, galleta de jengibre (círculos de color).

## Componentes
- Botón principal: píldora roja, texto blanco, icono opcional (▶ Jugar). Botón secundario: píldora crema/blanca con borde.
- Interruptor verde, check verde, radio vacío.
- Chips de temporizador: verde «Quedan 12 min», dorado «Quedan 3 min», rojo «Último minuto 0:59», negro «0:00 ¡Se acabó!».

## Pantallas de móvil (390×844), flujo principal
- **M1 Inicio**: fondo verde con luces, logo grande con dado, botón rojo «▶ Jugar», botón crema «Cómo se juega», colinas nevadas con abetos abajo.
- **M2 Configuración (anfitrión)**: cabecera «← Crear partida»; tarjeta crema con: Modo de dado (Clásico predeterminado + las 6 caras en iconos, con ›), Duración de la partida (15 minutos), Tiempo para tirar (20 segundos), Tiempo para elegir (15 segundos), Límite de robos (Sin límite) como desplegables; botón rojo «Crear sala».
- **M3 Un solo móvil (configuración)**: título «Un solo móvil», «Añade a los jugadores en orden de asiento», filas numeradas (1 Ana, 2 Luis, 3 Marta, 4 Carlos) con asa de arrastre, «+ Añadir jugador», botón rojo «Empezar partida».
- **M4 Unirse a sala**: «Unirse a una sala», «Escanea el QR o escribe el código de 4 letras», QR, cuatro casillas de letra (N A V A), «Tu nombre» (Marta), «Elige un avatar» (fila de avatares), botón rojo «Unirme».
- **M5 Mi turno (jugador)**: logo pequeño arriba, chip «Quedan 12 min», título grande «¡Te toca!», dado 3D grande con icono de abeto, botón rojo «Tirar el dado», botón blanco «Paso», texto «También puedes agitar el móvil».
- **M6 Acción (ejemplo Robo)**: cabecera «← Robo», icono de antifaz, «Elige a un jugador para intercambiar vuestros regalos.», lista de jugadores con radio (seleccionado en verde con check), «Quedan 15 s» con reloj, botón rojo «Confirmar».
- **M7 Final (revelación)**: trofeo dorado, «¡Se acabó!», «Así se quedan los regalos:», lista nombre + icono de regalo, confeti.

## Vista de sala / TV (1920×1080)
- Normal: logo arriba, chip «Quedan 12 min», dado 3D enorme en el centro, tarjeta «Le toca a Marta» con avatar grande, fila de avatares de los jugadores abajo, regalos y luces decorando.
- Último minuto: píldora roja «Último minuto» y número gigante blanco «0:59» sobre pueblo nevado de noche.

## Paneles informativos del board (contenido de «Cómo se juega»)
1. Configuración — elige el modo de juego y los ajustes. 2. Reparto inicial — la app dice a cada uno a quién darle su regalo. 3. Turnos — por turnos, tirad el dado, haced la acción… o pulsad «Paso». 4. Temporizador — jugad hasta que se acabe el tiempo (por defecto 15 min). 5. Final — revelación de quién se queda qué regalo.
Flujo general: Inicio (elige modo) → Configurar (y crear sala) → Reparto inicial → Turnos (con temporizador) → Final (revelación).
