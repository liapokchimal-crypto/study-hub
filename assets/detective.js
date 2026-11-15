// El detective — a police-sketch game, one kit per Spanish lesson (see KITS): Lección 3 sketches a person
// (spanish/detective.html), Lección 4 a school desk (detective-leccion-4.html), Lección 5 a room (detective-leccion-5.html).
// The page picks its kit with <div id="detective" data-caso="leccion-N">.
//
// Each case: (1) witness interview — the witness speaks Slovak, the player completes the Spanish police report by
// typing; every answer draws that feature onto the sketch (a wrong answer leaves it smudged and the question
// returns); (2) line-up — six sketches, pick the one matching the report before the time runs out.
// Cases are the *_CASES lists below: the culprit's features, the questions, and how each of the five others differs.
// Every difference must be something the report states. Stars per case are kept in localStorage on the device.

(() => {
  "use strict";

  const root = document.getElementById("detective");
  if (!root) return;

  const LINEUP_SECONDS = 40;

  // Features: sex m|f, height alto|bajo, build delgado|gordo, hairLen largo|corto|calvo, hairType liso|rizado,
  // hairColor rubio|moreno|castaño|pelirrojo|gris, eyes azules|verdes|marrones, barba, bigote.
  // Question: f = features it reveals, sk = what the witness says, es = report sentence with ___, accept = answers.
  const PERSON_CASES = [
    {
      title: "Ukradnutá gitara",
      story: "Z baru na námestí zmizla gitara. Barman videl páchateľa utekať.",
      culprit: { sex: "m", height: "alto", build: "delgado", hairLen: "corto", hairType: "liso", hairColor: "moreno", eyes: "marrones", barba: true, bigote: false },
      others: [{ height: "bajo" }, { build: "gordo" }, { hairLen: "largo" }, { hairColor: "rubio" }, { barba: false }],
      questions: [
        { f: ["sex", "height"], sk: "Bol to vysoký muž.", es: "Es un hombre ___.", accept: ["alto"], explain: "Vysoký = alto. Hombre je mužského rodu, preto koncovka -o." },
        { f: ["build"], sk: "Bol chudý.", es: "Es ___.", accept: ["delgado"], explain: "Chudý = delgado." },
        { f: ["hairLen"], sk: "Mal krátke vlasy.", es: "Tiene el pelo ___.", accept: ["corto"], explain: "Krátke vlasy = el pelo corto." },
        { f: ["hairColor"], sk: "Bol tmavovlasý.", es: "Es ___.", accept: ["moreno"], explain: "Tmavovlasý = moreno." },
        { f: ["barba"], sk: "Mal bradu.", es: "Tiene ___.", accept: ["barba"], explain: "Brada = barba. Používa sa so slovesom tener a bez člena." },
        { f: ["eyes"], sk: "Oči mal hnedé.", es: "Tiene los ojos ___.", accept: ["marrones"], explain: "Ojos je v množnom čísle: marrón sa mení na marrones." },
      ],
    },
    {
      title: "Zmiznutý recept",
      story: "Z reštaurácie niekto ukradol tajný recept na paellu. Kuchár si zlodejku všimol.",
      culprit: { sex: "f", height: "bajo", build: "delgado", hairLen: "largo", hairType: "rizado", hairColor: "pelirrojo", eyes: "verdes", barba: false, bigote: false },
      others: [{ height: "alto" }, { hairLen: "corto" }, { hairType: "liso" }, { hairColor: "castaño" }, { eyes: "azules", build: "gordo" }],
      questions: [
        { f: ["sex", "height"], sk: "Bola to nízka žena.", es: "Es una mujer ___.", accept: ["baja"], explain: "Nízky = bajo. Mujer je ženského rodu, preto baja." },
        { f: ["hairLen"], sk: "Mala dlhé vlasy.", es: "Tiene el pelo ___.", accept: ["largo"], explain: "Pelo je mužského rodu, preto largo aj pri žene." },
        { f: ["hairType"], sk: "Vlasy mala kučeravé.", es: "Tiene el pelo largo y ___.", accept: ["rizado"], explain: "Kučeravé vlasy = el pelo rizado." },
        { f: ["hairColor"], sk: "Bola ryšavá.", es: "Es ___.", accept: ["pelirroja"], explain: "Ryšavý = pelirrojo, o žene pelirroja." },
        { f: ["eyes"], sk: "Mala zelené oči.", es: "Tiene los ojos ___.", accept: ["verdes"], explain: "Ojos je v množnom čísle: verde sa mení na verdes." },
        { f: ["build"], sk: "Bola chudá.", es: "Es ___.", accept: ["delgada"], explain: "Chudý = delgado, o žene delgada." },
      ],
    },
    {
      title: "Bicykel pred knižnicou",
      story: "Pred knižnicou zmizol bicykel. Knihovníčka videla všetko z okna.",
      culprit: { sex: "m", height: "bajo", build: "gordo", hairLen: "calvo", hairType: "liso", hairColor: "castaño", eyes: "azules", barba: false, bigote: true },
      others: [{ height: "alto" }, { build: "delgado" }, { hairLen: "corto", hairColor: "moreno" }, { bigote: false }, { barba: true }],
      questions: [
        { f: ["sex", "height"], sk: "Bol to nízky muž.", es: "Es un hombre ___.", accept: ["bajo"], explain: "Nízky = bajo." },
        { f: ["build"], sk: "Bol tučný.", es: "Es ___.", accept: ["gordo"], explain: "Tučný = gordo." },
        { f: ["hairLen"], sk: "Bol plešatý.", es: "___ calvo.", accept: ["es"], explain: "Calvo sa používa so slovesom ser: es calvo." },
        { f: ["bigote"], sk: "Mal fúzy.", es: "___ bigote.", accept: ["tiene"], explain: "Fúzy a brada sa používajú so slovesom tener: tiene bigote." },
        { f: ["eyes"], sk: "Mal modré oči.", es: "Tiene los ojos ___.", accept: ["azules"], explain: "Ojos je v množnom čísle: azul sa mení na azules." },
        { f: ["barba"], sk: "Bradu nemal.", es: "No tiene ___.", accept: ["barba"], explain: "Brada = barba. Zápor: no tiene barba." },
      ],
    },
    {
      title: "Obraz z múzea",
      story: "Z mestského múzea zmizol obraz. Strážnik si páchateľku dobre zapamätal.",
      culprit: { sex: "f", height: "alto", build: "gordo", hairLen: "corto", hairType: "liso", hairColor: "rubio", eyes: "azules", barba: false, bigote: false },
      others: [{ height: "bajo" }, { hairColor: "moreno" }, { hairLen: "largo" }, { hairType: "rizado" }, { build: "delgado" }],
      questions: [
        { f: ["sex", "height"], sk: "Bola to vysoká žena.", es: "Es una mujer ___.", accept: ["alta"], explain: "Vysoký = alto. Mujer je ženského rodu, preto alta." },
        { f: ["hairColor"], sk: "Bola blondína.", es: "Es ___.", accept: ["rubia"], explain: "Blond = rubio, o žene rubia." },
        { f: ["hairLen"], sk: "Mala krátke vlasy.", es: "Tiene el pelo ___.", accept: ["corto"], explain: "Pelo je mužského rodu, preto corto aj pri žene." },
        { f: ["hairType"], sk: "Vlasy mala rovné.", es: "Tiene el pelo corto y ___.", accept: ["liso"], explain: "Rovné vlasy = el pelo liso." },
        { f: ["eyes"], sk: "Oči mala modré.", es: "___ los ojos azules.", accept: ["tiene"], explain: "Oči a vlasy sa opisujú slovesom tener: tiene los ojos azules." },
        { f: ["build"], sk: "Bola trochu tučná.", es: "Es un poco ___.", accept: ["gorda"], explain: "Tučný = gordo, o žene gorda. Un poco = trochu." },
      ],
    },
    {
      title: "Šéf zlodejov",
      story: "Za všetkými krádežami stojí jeden šéf. Svedkovia ho konečne videli.",
      culprit: { sex: "m", height: "alto", build: "gordo", hairLen: "largo", hairType: "rizado", hairColor: "gris", eyes: "verdes", barba: true, bigote: true },
      others: [{ build: "delgado" }, { hairLen: "corto" }, { hairType: "liso" }, { hairColor: "castaño" }, { barba: false }],
      questions: [
        { f: ["sex", "height"], sk: "Bol to vysoký muž.", es: "Es un hombre ___.", accept: ["alto"], explain: "Vysoký = alto." },
        { f: ["build"], sk: "Bol tučný.", es: "Es ___.", accept: ["gordo"], explain: "Tučný = gordo." },
        { f: ["hairLen"], sk: "Mal dlhé vlasy.", es: "Tiene el pelo ___.", accept: ["largo"], explain: "Dlhé vlasy = el pelo largo." },
        { f: ["hairType"], sk: "Vlasy mal kučeravé.", es: "Tiene el pelo largo y ___.", accept: ["rizado"], explain: "Kučeravé vlasy = el pelo rizado." },
        { f: ["hairColor"], sk: "Vlasy mal sivé.", es: "Tiene el pelo ___.", accept: ["gris"], explain: "Sivý = gris." },
        { f: ["barba", "bigote"], sk: "Mal bradu aj fúzy.", es: "Tiene barba y ___.", accept: ["bigote"], explain: "Brada = barba, fúzy = bigote." },
        { f: ["eyes"], sk: "Oči mal zelené.", es: "Tiene los ojos ___.", accept: ["verdes"], explain: "Ojos je v množnom čísle: verde sa mení na verdes." },
      ],
    },
  ];

  // Lección 4 (school): the sketch is the desk where the thief sits. Features: lugar (sign on the wall), dia and asig
  // (written on the board), mochila (colour), libros (number), obj regla|lapiz|goma|tijeras|estuche, objColor, nota (0-10).
  // A feature left out of the culprit is simply not there. Colours are the keys of COLOR. hint = shown with the task.
  const SCHOOL_CASES = [
    {
      title: "Stratená lopta",
      story: "Z telocvične zmizla futbalová lopta. Školník videl lavicu, pri ktorej zlodej sedí.",
      culprit: { lugar: "biblioteca", mochila: "rojo", libros: 2, obj: "regla", objColor: "amarillo" },
      others: [{ lugar: "gimnasio" }, { mochila: "azul" }, { libros: 3 }, { obj: "tijeras" }, { objColor: "verde" }],
      questions: [
        { f: ["lugar"], sk: "Lavica je v knižnici.", es: "La mesa está en la ___.", accept: ["biblioteca"], explain: "Knižnica = la biblioteca." },
        { f: ["mochila"], sk: "Pri lavici je červený ruksak.", es: "Al lado de la mesa hay una mochila ___.", accept: ["roja"], explain: "Červený = rojo. Mochila je ženského rodu, preto roja." },
        { f: ["libros"], sk: "Na lavici sú dve knihy.", es: "Encima de la mesa ___ dos libros.", accept: ["hay"], explain: "Hay = je, sú, nachádza sa. Má rovnaký tvar pre jednotné aj množné číslo." },
        { f: ["obj"], sk: "Je tam aj pravítko.", es: "También hay una ___.", accept: ["regla"], explain: "Pravítko = la regla." },
        { f: ["objColor"], sk: "Pravítko je žlté.", es: "La regla es ___.", accept: ["amarilla"], explain: "Žltý = amarillo. Regla je ženského rodu, preto amarilla." },
        { f: [], hint: "sloveso leer", sk: "Zlodej tam každý deň číta.", es: "El ladrón ___ en la biblioteca.", accept: ["lee"], explain: "Leer, 3. osoba jednotného čísla: él lee." },
      ],
    },
    {
      title: "Zmiznutý mikroskop",
      story: "Z laboratória niekto odniesol mikroskop. Upratovačka si všimla jednu lavicu.",
      culprit: { lugar: "laboratorio", dia: "martes", mochila: "verde", libros: 4, obj: "tijeras", objColor: "azul" },
      others: [{ lugar: "musica" }, { dia: "jueves" }, { libros: 2 }, { objColor: "rojo" }, { mochila: "amarillo" }],
      questions: [
        { f: ["lugar"], sk: "Lavica je v laboratóriu.", es: "La mesa está en el ___.", accept: ["laboratorio"], explain: "Laboratórium = el laboratorio." },
        { f: ["dia"], sk: "Na tabuli je napísaný deň: utorok.", es: "Hoy es ___.", accept: ["martes"], explain: "Utorok = martes. Dni v týždni sa píšu malým písmenom." },
        { f: ["libros"], sk: "Koľko kníh je na lavici? Štyri.", es: "¿___ libros hay? Cuatro.", accept: ["Cuántos"], explain: "Koľko = cuántos (mužský rod, množné číslo, lebo libros). Opytovacie slovo má dĺžeň." },
        { f: ["obj", "objColor"], sk: "Sú tam modré nožnice.", es: "Hay unas tijeras ___.", accept: ["azules"], explain: "Tijeras sú v množnom čísle: azul sa mení na azules." },
        { f: ["mochila"], sk: "Ruksak pri lavici je zelený.", es: "La ___ es verde.", accept: ["mochila"], explain: "Ruksak = la mochila." },
        { f: [], hint: "sloveso hacer", sk: "Žiaci tu robia pokusy.", es: "Los alumnos ___ experimentos.", accept: ["hacen"], explain: "Hacer, 3. osoba množného čísla: ellos hacen. Nepravidelné je len yo hago." },
      ],
    },
    {
      title: "Stratený slovník",
      story: "Z knižnice zmizol veľký španielsky slovník. Knihovník videl lavicu, pri ktorej sa zlodej zastavil.",
      culprit: { lugar: "pasillo", mochila: "negro", libros: 1, obj: "estuche", objColor: "naranja", nota: 4 },
      others: [{ lugar: "biblioteca" }, { mochila: "gris" }, { obj: "goma" }, { nota: 9 }, { libros: 3 }],
      questions: [
        { f: ["lugar"], sk: "Lavica stojí na chodbe.", es: "La mesa está en el ___.", accept: ["pasillo"], explain: "Chodba = el pasillo." },
        { f: ["mochila"], sk: "Ruksak je čierny.", es: "La mochila es ___.", accept: ["negra"], explain: "Čierny = negro. Mochila je ženského rodu, preto negra." },
        { f: ["obj"], sk: "Na lavici je peračník.", es: "Encima de la mesa hay un ___.", accept: ["estuche"], explain: "Peračník = el estuche." },
        { f: ["objColor"], sk: "Peračník je oranžový.", es: "El estuche es ___.", accept: ["naranja"], explain: "Oranžový = naranja. Tento tvar sa v rode nemení." },
        { f: ["libros"], sk: "Na lavici je len jedna kniha.", es: "Solo hay ___ libro.", accept: ["un"], explain: "Libro je mužského rodu: un libro." },
        { f: ["nota"], sk: "Je tam písomka so štvorkou z desiatich. To je nedostatočná.", es: "En el examen tiene un 4: un ___.", accept: ["suspenso"], explain: "V Španielsku sa známkuje od 0 do 10. Menej ako 5 je suspenso." },
        { f: [], hint: "sloveso necesitar", sk: "Zlodej nemá pero a potrebuje ho.", es: "El ladrón no tiene bolígrafo y ___ uno.", accept: ["necesita"], explain: "Necesitar, 3. osoba jednotného čísla: él necesita." },
      ],
    },
    {
      title: "Flauta z hudobnej triedy",
      story: "Z hudobnej triedy zmizla flauta. Učiteľ hudby videl lavicu, pri ktorej zlodejka sedí.",
      culprit: { lugar: "musica", dia: "viernes", asig: "Matemáticas", mochila: "rosa", libros: 3, obj: "lapiz", objColor: "verde", nota: 8 },
      others: [{ dia: "lunes" }, { asig: "Historia" }, { mochila: "rojo" }, { objColor: "azul" }, { nota: 5 }],
      questions: [
        { f: ["lugar"], sk: "Lavica je v hudobnej triede.", es: "La mesa está en la sala de ___.", accept: ["música"], explain: "Hudobná trieda = la sala de música." },
        { f: ["dia"], sk: "Na tabuli je napísaný piatok.", es: "Hoy es ___.", accept: ["viernes"], explain: "Piatok = viernes." },
        { f: ["asig"], sk: "Pod tým je predmet: matematika.", es: "Hoy tenemos ___.", accept: ["Matemáticas"], explain: "Matematika = Matemáticas, v španielčine v množnom čísle." },
        { f: ["mochila"], sk: "Ruksak je ružový.", es: "La mochila es ___.", accept: ["rosa"], explain: "Ružový = rosa. Tento tvar sa v rode nemení." },
        { f: ["obj", "objColor"], sk: "Na lavici leží zelená ceruzka.", es: "Hay un ___ verde.", accept: ["lápiz"], explain: "Ceruzka = el lápiz, v množnom čísle lápices." },
        { f: ["libros"], sk: "Na lavici sú tri knihy.", es: "Hay ___ libros.", accept: ["tres"], explain: "Tri = tres." },
        { f: ["nota"], sk: "Písomka je na osmičku. To je chválitebná.", es: "Tiene un 8: un ___.", accept: ["notable"], explain: "Známky 7 a 8 sú notable, 9 a 10 sobresaliente." },
        { f: [], hint: "sloveso estudiar", sk: "Zlodejka tu študuje hudbu.", es: "La ladrona ___ música aquí.", accept: ["estudia"], explain: "Estudiar, 3. osoba jednotného čísla: ella estudia." },
      ],
    },
    {
      title: "Ukradnuté písomky",
      story: "Zo zborovne zmizli písomky. Za všetkým stojí šéf školských zlodejov a niekto konečne videl jeho lavicu.",
      culprit: { lugar: "informatica", dia: "miercoles", asig: "Inglés", mochila: "marron", libros: 4, obj: "goma", objColor: "blanco", nota: 10 },
      others: [{ lugar: "laboratorio" }, { dia: "martes" }, { mochila: "negro" }, { libros: 2 }, { nota: 6 }],
      questions: [
        { f: ["lugar"], sk: "Lavica je v počítačovej učebni.", es: "La mesa está en la sala de ___.", accept: ["informática"], explain: "Počítačová učebňa = la sala de informática." },
        { f: ["dia"], sk: "Na tabuli je napísaná streda.", es: "Hoy es ___.", accept: ["miércoles"], explain: "Streda = miércoles." },
        { f: ["asig"], sk: "Dnes majú angličtinu.", es: "Hoy tienen ___.", accept: ["Inglés"], explain: "Angličtina = Inglés." },
        { f: ["mochila"], sk: "Ruksak je hnedý.", es: "La mochila es ___.", accept: ["marrón"], explain: "Hnedý = marrón. V rode sa nemení, v množnom čísle marrones." },
        { f: ["libros"], sk: "Na lavici je veľa kníh, až štyri.", es: "Hay ___ libros: cuatro.", accept: ["muchos"], explain: "Veľa = mucho. Zhoduje sa s podstatným menom: muchos libros, muchas mesas." },
        { f: ["obj"], sk: "Je tam guma.", es: "Hay una ___.", accept: ["goma"], explain: "Guma = la goma." },
        { f: ["objColor"], sk: "Guma je biela.", es: "La goma es ___.", accept: ["blanca"], explain: "Biely = blanco. Goma je ženského rodu, preto blanca." },
        { f: ["nota"], sk: "Jeho písomka je na desiatku. To je výborná.", es: "Tiene un 10: un ___.", accept: ["sobresaliente"], explain: "Známky 9 a 10 sú sobresaliente, teda výborný." },
        { f: [], hint: "sloveso escribir", sk: "Šéf si všetko píše do zošita.", es: "El jefe ___ en un cuaderno.", accept: ["escribe"], explain: "Escribir, 3. osoba jednotného čísla: él escribe." },
      ],
    },
  ];

  // Lección 5 (home): the sketch is the room where the thief hides. Features: mueble sofa|cama, color (of the mueble),
  // ventana grande|pequena, vista centro|afueras (seen through the window), lampara izquierda|derecha (of the mueble),
  // gato mesa_encima|mesa_debajo|mueble_encima, pared espejo|cuadro|reloj, libros (number on the shelf), alfombra true|false.
  const HOME_CASES = [
    {
      title: "Skrýša s gitarou",
      story: "Zlodej gitary sa skrýva v jednom byte. Sused nazrel cez dvere do obývačky.",
      culprit: { mueble: "sofa", color: "azul", ventana: "grande", lampara: "derecha", gato: "mesa_debajo" },
      others: [{ mueble: "cama" }, { color: "rojo" }, { ventana: "pequena" }, { lampara: "izquierda" }, { gato: "mesa_encima" }],
      questions: [
        { f: ["mueble"], sk: "V obývačke je pohovka.", es: "En el salón hay un ___.", accept: ["sofá"], explain: "Pohovka = el sofá, s dĺžňom na konci." },
        { f: ["color"], hint: "ser alebo estar", sk: "Pohovka je modrá.", es: "El sofá ___ azul.", accept: ["es"], explain: "Vlastnosť veci (farba, veľkosť) opisujeme slovesom ser: es azul." },
        { f: ["ventana"], sk: "Okno je veľké.", es: "La ventana es ___.", accept: ["grande"], explain: "Veľký = grande. Tvar je rovnaký pre mužský aj ženský rod." },
        { f: ["lampara"], sk: "Napravo od pohovky stojí lampa.", es: "La lámpara está a la ___ del sofá.", accept: ["derecha"], explain: "Napravo od = a la derecha de. Naľavo od = a la izquierda de." },
        { f: ["gato"], sk: "Pod stolom je mačka.", es: "Hay un gato ___ de la mesa.", accept: ["debajo"], explain: "Pod = debajo de. Na = encima de." },
        { f: [], hint: "sloveso vivir", sk: "Zlodej býva v byte.", es: "El ladrón ___ en un piso.", accept: ["vive"], explain: "Vivir, 3. osoba jednotného čísla: él vive." },
        { f: [], sk: "Gitara je v kuchyni za chladničkou.", es: "La guitarra está en la cocina, ___ del frigorífico.", accept: ["detrás"], explain: "Za = detrás de. Pred = delante de." },
      ],
    },
    {
      title: "Skrýša s receptom",
      story: "Zlodejka receptu sa skrýva v dome. Poštár videl cez okno do spálne.",
      culprit: { mueble: "cama", color: "verde", ventana: "pequena", vista: "afueras", lampara: "izquierda", pared: "espejo", alfombra: true },
      others: [{ vista: "centro" }, { ventana: "grande" }, { pared: "reloj" }, { alfombra: false }, { lampara: "derecha" }],
      questions: [
        { f: ["mueble"], sk: "V spálni je posteľ.", es: "En el dormitorio hay una ___.", accept: ["cama"], explain: "Posteľ = la cama." },
        { f: ["vista"], sk: "Dom je na okraji mesta, z okna vidno stromy.", es: "La casa está en las ___.", accept: ["afueras"], explain: "Okraj mesta, predmestie = las afueras." },
        { f: ["ventana"], sk: "Okno je malé.", es: "La ventana es ___.", accept: ["pequeña"], explain: "Malý = pequeño. Ventana je ženského rodu, preto pequeña." },
        { f: ["pared"], sk: "Na stene je zrkadlo.", es: "En la pared hay un ___.", accept: ["espejo"], explain: "Zrkadlo = el espejo." },
        { f: ["alfombra"], sk: "Na zemi je koberec.", es: "En el suelo hay una ___.", accept: ["alfombra"], explain: "Koberec = la alfombra. El suelo = podlaha, zem." },
        { f: ["lampara"], hint: "de alebo del", sk: "Lampa stojí naľavo od postele.", es: "La lámpara está a la izquierda ___ la cama.", accept: ["de"], explain: "Cama je ženského rodu: de la cama. Del (de + el) je len pred mužským rodom: del sofá." },
        { f: ["color"], sk: "Posteľ je zelená.", es: "La cama es ___.", accept: ["verde"], explain: "Zelený = verde. Tvar je rovnaký pre mužský aj ženský rod." },
        { f: [], sk: "Recept je v kúpeľni, vnútri práčky.", es: "La receta está en el baño, dentro de la ___.", accept: ["lavadora"], explain: "Práčka = la lavadora. Dentro de = vnútri." },
      ],
    },
    {
      title: "Skrýša s bicyklom",
      story: "Zlodej bicykla býva niekde v meste. Kuriér mu bol doručiť balík a pamätá si obývačku.",
      culprit: { mueble: "sofa", color: "amarillo", ventana: "grande", vista: "centro", gato: "mueble_encima", pared: "cuadro", libros: 5 },
      others: [{ vista: "afueras" }, { color: "rojo" }, { gato: "mesa_debajo" }, { libros: 1 }, { pared: "espejo" }],
      questions: [
        { f: ["vista"], sk: "Byt je v centre, z okna vidno domy.", es: "El piso está en el ___.", accept: ["centro"], explain: "Centrum = el centro." },
        { f: ["mueble", "color"], sk: "V obývačke je žltá pohovka.", es: "En el salón hay un sofá ___.", accept: ["amarillo"], explain: "Žltý = amarillo. Sofá je mužského rodu, hoci sa končí na -á." },
        { f: ["gato"], sk: "Mačka leží na pohovke.", es: "El gato está ___ del sofá.", accept: ["encima"], explain: "Na = encima de. Pod = debajo de." },
        { f: ["libros"], hint: "hay alebo están", sk: "Na polici je veľa kníh.", es: "En la estantería ___ muchos libros.", accept: ["hay"], explain: "Keď hovoríme, že niečo niekde je (s číslovkou, muchos alebo un/una), použijeme hay." },
        { f: ["pared"], sk: "Na stene visí obraz.", es: "En la pared hay un ___.", accept: ["cuadro"], explain: "Obraz = el cuadro." },
        { f: ["ventana"], sk: "Okno je veľké, izba je svetlá.", es: "La ventana es grande y la habitación es ___.", accept: ["luminosa"], explain: "Svetlý = luminoso. Habitación je ženského rodu, preto luminosa." },
        { f: [], sk: "Bicykel je v garáži.", es: "La bicicleta está en el ___.", accept: ["garaje"], explain: "Garáž = el garaje." },
      ],
    },
    {
      title: "Skrýša s obrazom",
      story: "Zlodejka obrazu sa skrýva v starom byte. Domovník si pamätá jej spálňu.",
      culprit: { mueble: "cama", color: "rosa", ventana: "pequena", lampara: "derecha", gato: "mesa_encima", libros: 2, alfombra: false },
      others: [{ color: "azul" }, { ventana: "grande" }, { lampara: "izquierda" }, { gato: "mesa_debajo" }, { alfombra: true }],
      questions: [
        { f: ["mueble"], sk: "Je to spálňa s posteľou.", es: "En el ___ hay una cama.", accept: ["dormitorio"], explain: "Spálňa = el dormitorio." },
        { f: ["color"], sk: "Posteľ je ružová.", es: "La cama es ___.", accept: ["rosa"], explain: "Ružový = rosa." },
        { f: ["ventana"], sk: "Okno je malé, izba je tmavá.", es: "La ventana es pequeña y la habitación es ___.", accept: ["oscura"], explain: "Tmavý = oscuro. Habitación je ženského rodu, preto oscura." },
        { f: ["lampara"], sk: "Lampa stojí vedľa postele, napravo.", es: "La lámpara está al ___ de la cama, a la derecha.", accept: ["lado"], explain: "Vedľa = al lado de." },
        { f: ["gato"], hint: "hay alebo está", sk: "Mačka je na stole.", es: "El gato ___ encima de la mesa.", accept: ["está"], explain: "Kde je konkrétna vec alebo zviera (el gato), hovoríme slovesom estar: está." },
        { f: ["alfombra"], hint: "hay alebo está", sk: "Koberec tam nie je.", es: "En el dormitorio no ___ alfombra.", accept: ["hay"], explain: "Či niečo niekde je alebo nie je, hovoríme slovesom hay: no hay alfombra." },
        { f: ["libros"], hint: "hay alebo están", sk: "Tie dve knihy sú na polici.", es: "Los dos libros ___ en la estantería.", accept: ["están"], explain: "Pri určitom člene (los libros) hovoríme, kde veci sú, slovesom estar: están." },
        { f: [], sk: "Obraz je medzi skriňou a stenou.", es: "El cuadro está ___ el armario y la pared.", accept: ["entre"], explain: "Medzi = entre. Používa sa bez de." },
      ],
    },
    {
      title: "Šéfova skrýša",
      story: "Šéf zlodejov má dom za mestom. Záhradník konečne prezradil, ako vyzerá jeho obývačka.",
      culprit: { mueble: "sofa", color: "gris", ventana: "grande", vista: "afueras", lampara: "izquierda", gato: "mesa_debajo", pared: "reloj", libros: 3, alfombra: true },
      others: [{ vista: "centro" }, { color: "verde" }, { lampara: "derecha" }, { pared: "cuadro" }, { libros: 1 }],
      questions: [
        { f: ["vista"], hint: "sloveso vivir", sk: "Šéf býva v dome za mestom.", es: "El jefe ___ en un chalet en las afueras.", accept: ["vive"], explain: "Vivir, 3. osoba jednotného čísla: él vive. Un chalet = samostatný dom." },
        { f: ["mueble", "color"], sk: "V obývačke je sivá pohovka.", es: "En el salón hay un ___ gris.", accept: ["sofá"], explain: "Pohovka = el sofá." },
        { f: ["lampara"], hint: "de alebo del", sk: "Naľavo od pohovky je lampa.", es: "A la izquierda ___ sofá hay una lámpara.", accept: ["del"], explain: "De + el = del: a la izquierda del sofá." },
        { f: ["pared"], sk: "Na stene sú hodiny.", es: "En la pared hay un ___.", accept: ["reloj"], explain: "Hodiny = el reloj, v španielčine v jednotnom čísle." },
        { f: ["gato"], hint: "hay alebo está", sk: "Mačka je pod stolom.", es: "El gato ___ debajo de la mesa.", accept: ["está"], explain: "Kde je konkrétne zviera (el gato), hovoríme slovesom estar." },
        { f: ["alfombra"], sk: "Stôl stojí na koberci.", es: "La mesa está encima de la ___.", accept: ["alfombra"], explain: "Koberec = la alfombra." },
        { f: ["libros"], sk: "Na polici sú tri knihy.", es: "En la estantería hay ___ libros.", accept: ["tres"], explain: "Tri = tres." },
        { f: ["ventana"], hint: "ser alebo estar", sk: "Okno je veľké.", es: "La ventana ___ grande.", accept: ["es"], explain: "Vlastnosť veci opisujeme slovesom ser: es grande. Estar hovorí, kde vec je." },
      ],
    },
  ];

  // ---------- helpers ----------

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clean = (s) => s.trim().toLowerCase().replace(/[.,;:!?¡¿]/g, "").replace(/\s+/g, " ");
  const plain = (s) => clean(s).normalize("NFD").replace(/[̀-ͯ]/g, "");
  const shuffle = (list) => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const starsHTML = (n) => "★".repeat(n) + `<span class="off">${"★".repeat(3 - n)}</span>`;
  const gap = (es) => esc(es).replace("___", "<strong>___</strong>");

  let timers = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  // ---------- drawing a person ----------

  const HAIR = { rubio: "#e3bf4d", moreno: "#2b2420", "castaño": "#7a4a2a", pelirrojo: "#c8501e", gris: "#a3a3a3" };
  const EYES = { azules: "#2f7fd6", verdes: "#2f9e4f", marrones: "#6b3f1d" };
  const SKIN = "#f2c9a0";

  // p = person; o.known = Set of features already known (omit: all), o.fresh = features to animate, o.smudged = Set drawn blurred.
  function figure(p, o = {}) {
    const k = (f) => !o.known || o.known.has(f);
    const cls = (...fs) => {
      const c = [];
      if (o.fresh && fs.some((f) => o.fresh.includes(f))) c.push("vd-new");
      if (o.smudged && fs.some((f) => o.smudged.has(f))) c.push("vd-smudge");
      return c.length ? ` class="${c.join(" ")}"` : "";
    };
    const H = !k("height") ? 139 : p.height === "alto" ? 150 : 128;
    const w = !k("build") ? 38 : p.build === "gordo" ? 54 : 30;
    const lw = !k("build") ? 10 : p.build === "gordo" ? 13 : 9;
    const hy = 172 - H + 20;
    const ty = hy + 23, th = (H - 43) * 0.5, ly = ty + th;
    const woman = k("sex") && p.sex === "f";
    const cloth = !k("sex") ? "#b9bec6" : woman ? "#8e5bb5" : "#3f6fb0";
    const legFill = !k("sex") ? "#8f959e" : woman ? SKIN : "#3a3f4a";
    const hairKnown = k("hairLen");
    const hairFill = k("hairColor") ? HAIR[p.hairColor] : "#cfc8b8";
    const faceHair = k("hairColor") ? HAIR[p.hairColor] : "#8a8478";
    const curly = k("hairType") && p.hairType === "rizado";

    let wall = "";
    for (const cm of [140, 160, 180]) {
      const y = (172 - cm * 0.81).toFixed(1);
      wall += `<line class="wall" x1="0" y1="${y}" x2="100" y2="${y}"/><text class="wall-label" x="2" y="${y - 1.5}">${cm}</text>`;
    }

    const leg = (cx) => `<rect x="${cx - lw / 2}" y="${ly - 4}" width="${lw}" height="${174 - ly}" fill="${legFill}"/><ellipse cx="${cx}" cy="172.5" rx="${lw / 2 + 2}" ry="3" fill="#2b2b2b"/>`;
    const arm = (x) => `<rect x="${x}" y="${ty + 2}" width="7" height="${th * 0.82}" rx="3.5" fill="${cloth}"/><circle cx="${x + 3.5}" cy="${ty + th * 0.82 + 4}" r="3.6" fill="${SKIN}"/>`;
    const body = `<g${cls("sex", "height", "build")}>
      ${leg(50 - w / 4)}${leg(50 + w / 4)}
      ${woman ? `<path d="M${50 - w / 2},${ly - 12} L${50 + w / 2},${ly - 12} L${50 + w / 2 + 7},${ly + 22} L${50 - w / 2 - 7},${ly + 22}Z" fill="${cloth}"/>` : ""}
      ${arm(50 - w / 2 - 6)}${arm(50 + w / 2 - 1)}
      <rect x="${50 - w / 2}" y="${ty}" width="${w}" height="${th}" rx="8" fill="${cloth}"/>
      ${k("build") && p.build === "gordo" ? `<ellipse cx="50" cy="${ty + th * 0.62}" rx="${w / 2 + 3}" ry="${th * 0.4}" fill="${cloth}"/>` : ""}
      <rect x="45.5" y="${hy + 15}" width="9" height="11" fill="${SKIN}"/>
    </g>`;

    let hairBack = "", hairTop = "";
    if (hairKnown && p.hairLen !== "calvo") {
      const long = p.hairLen === "largo";
      if (long) {
        hairBack = `<path d="M29,${hy - 2} L27,${hy + 34} Q27,${hy + 39} 33,${hy + 39} L67,${hy + 39} Q73,${hy + 39} 73,${hy + 34} L71,${hy - 2}Z" fill="${hairFill}"/>`;
      }
      hairTop = `<path d="M29.9,${hy - 4} A20.5,20.5 0 0 1 70.1,${hy - 4} Q62,${hy - 11} 50,${hy - 10} Q38,${hy - 11} 29.9,${hy - 4}Z" fill="${hairFill}"/>`;
      if (curly) {
        for (let a = 15; a <= 165; a += 25) {
          const r = (a * Math.PI) / 180;
          hairTop += `<circle cx="${(50 + 21 * Math.cos(r)).toFixed(1)}" cy="${(hy - 21 * Math.sin(r)).toFixed(1)}" r="5.2" fill="${hairFill}"/>`;
        }
        if (long) {
          for (let y = hy + 4; y <= hy + 36; y += 8) hairBack += `<circle cx="27" cy="${y}" r="5.5" fill="${hairFill}"/><circle cx="73" cy="${y}" r="5.5" fill="${hairFill}"/>`;
        }
      }
    }
    const hairCls = cls("hairLen", "hairType", "hairColor");
    const eye = (cx) => `<ellipse cx="${cx}" cy="${hy + 1}" rx="4.6" ry="3.6" fill="#fff"/><circle cx="${cx}" cy="${hy + 1}" r="2.9" fill="${k("eyes") ? EYES[p.eyes] : "#9a9a9a"}"/><circle cx="${cx}" cy="${hy + 1}" r="1.1" fill="#111"/>`;

    return `<svg class="vd-fig" viewBox="0 0 100 180" aria-hidden="true">
      ${wall}
      <g${hairCls}>${hairBack}</g>
      ${body}
      <circle cx="50" cy="${hy}" r="20" fill="${SKIN}"/>
      <g${hairCls}>${hairTop}</g>
      <g${cls("eyes")}>${eye(42)}${eye(58)}</g>
      ${k("barba") && p.barba ? `<path${cls("barba", "hairColor")} d="M30.6,${hy + 5} Q33,${hy + 26} 50,${hy + 26} Q67,${hy + 26} 69.4,${hy + 5} Q64,${hy + 16} 50,${hy + 16.5} Q36,${hy + 16} 30.6,${hy + 5}Z" fill="${faceHair}"/>` : ""}
      <path d="M44.5,${hy + 12.5} Q50,${hy + 15} 55.5,${hy + 12.5}" stroke="#8a4a3a" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      ${k("bigote") && p.bigote ? `<path${cls("bigote", "hairColor")} d="M41,${hy + 9} Q46,${hy + 5.5} 50,${hy + 8} Q54,${hy + 5.5} 59,${hy + 9} Q54,${hy + 11.5} 50,${hy + 10} Q46,${hy + 11.5} 41,${hy + 9}Z" fill="${faceHair}"/>` : ""}
      ${hairKnown ? "" : `<text x="50" y="${hy - 24}" text-anchor="middle" font-size="12" font-weight="700" fill="#a59c85">?</text>`}
    </svg>`;
  }

  // ---------- drawing a school desk (Lección 4) and a room (Lección 5) ----------

  const COLOR = {
    rojo: "#d64545", azul: "#2f6fd0", verde: "#2f9e4f", amarillo: "#f2c530", negro: "#2b2b2b", blanco: "#ffffff",
    naranja: "#f08a24", rosa: "#f29ac0", gris: "#9aa0a6", marron: "#8a5a2b",
  };
  const UNKNOWN = "#cfc8b8";
  const FONT = `font-family="system-ui, sans-serif" text-anchor="middle"`;

  // k(f): the feature exists and is already known; cls(...fs): animation and smudge classes for a group of features.
  const sketchTools = (p, o) => ({
    k: (f) => p[f] != null && p[f] !== false && (!o.known || o.known.has(f)),
    cls: (...fs) => {
      const c = [];
      if (o.fresh && fs.some((f) => o.fresh.includes(f))) c.push("vd-new");
      if (o.smudged && fs.some((f) => o.smudged.has(f))) c.push("vd-smudge");
      return c.length ? ` class="${c.join(" ")}"` : "";
    },
  });

  const LUGAR = { biblioteca: "BIBLIOTECA", gimnasio: "GIMNASIO", laboratorio: "LABORATORIO", pasillo: "PASILLO", musica: "MÚSICA", informatica: "INFORMÁTICA" };
  const DIA = { lunes: "LUNES", martes: "MARTES", miercoles: "MIÉRCOLES", jueves: "JUEVES", viernes: "VIERNES" };
  const BOOK = ["#c0504d", "#4f81bd", "#9bbb59", "#8064a2", "#e0a030"];

  function desk(p, o = {}) {
    const { k, cls } = sketchTools(p, o);
    let s = `<rect width="120" height="100" fill="#f1ead8"/><rect y="82" width="120" height="18" fill="#cdb892"/>`;
    s += `<g${cls("lugar")}><rect x="6" y="6" width="50" height="13" rx="2" fill="#2f6f4f"/>
      <text x="31" y="15.3" ${FONT} font-size="6.2" font-weight="700" fill="#fff">${k("lugar") ? LUGAR[p.lugar] : "?"}</text></g>`;
    s += `<rect x="62" y="6" width="52" height="28" rx="1.5" fill="#2e4a3e" stroke="#9a7b4f" stroke-width="2"/>`;
    if (k("dia")) s += `<text${cls("dia")} x="88" y="17.5" ${FONT} font-size="6.5" font-weight="700" fill="#fff">${DIA[p.dia]}</text>`;
    if (k("asig")) s += `<text${cls("asig")} x="88" y="28" ${FONT} font-size="5.8" fill="#ffe9a8">${esc(p.asig.toUpperCase())}</text>`;
    if (k("mochila")) {
      s += `<g${cls("mochila")}><path d="M10,67 Q14.5,58 19,67" fill="none" stroke="#555" stroke-width="1.6"/>
        <rect x="5" y="66" width="19" height="25" rx="6" fill="${COLOR[p.mochila]}" stroke="#000" stroke-opacity=".3" stroke-width=".6"/>
        <rect x="8" y="78" width="13" height="9" rx="3" fill="#000" opacity=".18"/></g>`;
    }
    s += `<rect x="32" y="63" width="4" height="29" fill="#8f6a3f"/><rect x="106" y="63" width="4" height="29" fill="#8f6a3f"/>
      <rect x="28" y="58" width="86" height="5" rx="1" fill="#b98a55"/>`;
    if (k("libros")) {
      let b = "";
      for (let i = 0; i < p.libros; i++) {
        b += `<rect x="${34 + (i % 2) * 2}" y="${53.5 - i * 4.5}" width="22" height="4.5" rx=".8" fill="${BOOK[i % BOOK.length]}" stroke="#fff" stroke-width=".5"/>`;
      }
      s += `<g${cls("libros")}>${b}</g>`;
    }
    if (k("obj")) {
      const c = k("objColor") ? COLOR[p.objColor] : UNKNOWN;
      const edge = `stroke="#000" stroke-opacity=".35" stroke-width=".6"`;
      const shapes = {
        regla: `<rect x="62" y="53.5" width="24" height="4.5" fill="${c}" ${edge}/><path d="M66,53.5v2M70,53.5v2M74,53.5v2M78,53.5v2M82,53.5v2" stroke="#333" stroke-width=".5"/>`,
        lapiz: `<rect x="62" y="54.2" width="18" height="3.6" fill="${c}" ${edge}/><path d="M80,54.2 L86.5,56 L80,57.8Z" fill="#e8c9a0" ${edge}/><path d="M84.6,55.5 L86.5,56 L84.6,56.5Z" fill="#333"/>`,
        goma: `<rect x="66" y="50" width="15" height="8" rx="2" fill="${c}" ${edge}/>`,
        tijeras: `<path d="M69,50.5 L87,56.5 M69,54.5 L87,49.5" stroke="#8a8f98" stroke-width="1.7" stroke-linecap="round"/>
          <circle cx="66" cy="49.2" r="3" fill="none" stroke="${c}" stroke-width="2"/><circle cx="66" cy="54.8" r="3" fill="none" stroke="${c}" stroke-width="2"/>`,
        estuche: `<rect x="62" y="49" width="24" height="9" rx="4.5" fill="${c}" ${edge}/><path d="M66,53.5 H82" stroke="#fff" stroke-width=".9" stroke-dasharray="1.6 1"/>`,
      };
      s += `<g${cls("obj", "objColor")}>${shapes[p.obj]}</g>`;
    }
    if (k("nota")) {
      s += `<g${cls("nota")}><rect x="92" y="38" width="17" height="20" fill="#fff" stroke="#b9b9b9" stroke-width=".6"/>
        <path d="M95,42H106M95,45H103" stroke="#c9c9c9" stroke-width=".7"/>
        <text x="100.5" y="55" ${FONT} font-size="${p.nota > 9 ? 8.5 : 10}" font-weight="800" fill="#c62828">${p.nota}</text></g>`;
    }
    return `<svg class="vd-fig" viewBox="0 0 120 100" aria-hidden="true">${s}</svg>`;
  }

  const CAT = "#2b2b2b";
  const cat = (x, y) => `<path d="M${x + 6},${y - 2} q6,-1 5,-7" fill="none" stroke="${CAT}" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="${x}" cy="${y - 4}" rx="7" ry="4" fill="${CAT}"/><circle cx="${x - 6}" cy="${y - 7.5}" r="3.4" fill="${CAT}"/>
    <path d="M${x - 9},${y - 9} l.6,-4 l2.6,2.4Z M${x - 3},${y - 9} l-.6,-4 l-2.6,2.4Z" fill="${CAT}"/>
    <circle cx="${x - 7.2}" cy="${y - 7.8}" r=".7" fill="#f2c530"/><circle cx="${x - 4.8}" cy="${y - 7.8}" r=".7" fill="#f2c530"/>`;

  function room(p, o = {}) {
    const { k, cls } = sketchTools(p, o);
    let s = `<rect width="120" height="100" fill="#f3ead2"/><rect y="70" width="120" height="30" fill="#c9a777"/><rect y="69" width="120" height="1.5" fill="#a98656"/>`;

    if (k("ventana") || k("vista")) {
      const [x, y, w, h] = !k("ventana") ? [47, 10, 26, 22] : p.ventana === "grande" ? [41, 7, 38, 29] : [51, 12, 18, 17];
      let view = "";
      if (k("vista") && p.vista === "centro") {
        view = [[0.06, 0.22, 0.62], [0.33, 0.28, 0.82], [0.66, 0.26, 0.5]].map(([dx, dw, dh]) =>
          `<rect x="${(x + w * dx).toFixed(1)}" y="${(y + h * (1 - dh)).toFixed(1)}" width="${(w * dw).toFixed(1)}" height="${(h * dh).toFixed(1)}" fill="#8b93a1"/>`).join("");
      } else if (k("vista")) {
        view = `<path d="M${x},${y + h} V${y + h * 0.72} Q${x + w / 2},${y + h * 0.42} ${x + w},${y + h * 0.72} V${y + h}Z" fill="#6bb36b"/>
          <rect x="${x + w * 0.68}" y="${y + h * 0.42}" width="${w * 0.05}" height="${h * 0.3}" fill="#7a4a2a"/>
          <circle cx="${x + w * 0.705}" cy="${y + h * 0.36}" r="${h * 0.16}" fill="#2f8f4f"/>
          <circle cx="${x + w * 0.25}" cy="${y + h * 0.5}" r="${h * 0.12}" fill="#2f8f4f"/>`;
      }
      s += `<g${cls("ventana", "vista")}><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#bfe3f7"/>${view}
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#fff" stroke-width="2.2"/>
        <path d="M${x + w / 2},${y}V${y + h}M${x},${y + h / 2}H${x + w}" stroke="#fff" stroke-width="1.2"/>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#9a8f78" stroke-width=".5"/></g>`;
    }

    if (k("pared")) {
      const items = {
        espejo: `<ellipse cx="20" cy="19" rx="7" ry="9.5" fill="#cfe8ef" stroke="#b08d57" stroke-width="2"/><path d="M16,15 l4,-4" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>`,
        cuadro: `<rect x="11" y="10" width="18" height="15" fill="#bfe3f7" stroke="#7a4a2a" stroke-width="2"/><path d="M12,24 L18,16 L22,20 L25,17 L28,24Z" fill="#6bb36b"/><circle cx="25" cy="13.5" r="1.6" fill="#f2c530"/>`,
        reloj: `<circle cx="20" cy="18" r="8.5" fill="#fff" stroke="#3a3f4a" stroke-width="1.8"/><path d="M20,18 V12.5 M20,18 H24" stroke="#3a3f4a" stroke-width="1.3" stroke-linecap="round"/>`,
      };
      s += `<g${cls("pared")}>${items[p.pared]}</g>`;
    }

    if (k("libros")) {
      let b = `<rect x="88" y="24" width="27" height="2" fill="#8a6a3a"/>`;
      for (let i = 0; i < p.libros; i++) {
        const h = 9 + (i % 3);
        b += `<rect x="${90 + i * 4.6}" y="${24 - h}" width="3.8" height="${h}" fill="${BOOK[i % BOOK.length]}"/>`;
      }
      s += `<g${cls("libros")}>${b}</g>`;
    }

    if (k("alfombra")) s += `<ellipse${cls("alfombra")} cx="60" cy="92.5" rx="42" ry="6.5" fill="#b5524e" stroke="#e8d9a8" stroke-width="1.2"/>`;

    if (k("lampara")) {
      const x = p.lampara === "izquierda" ? 20 : 100;
      s += `<g${cls("lampara")}><rect x="${x - 0.8}" y="44" width="1.6" height="28" fill="#555"/><ellipse cx="${x}" cy="72.5" rx="5" ry="1.6" fill="#555"/>
        <path d="M${x - 6.5},45 L${x + 6.5},45 L${x + 4},35 L${x - 4},35Z" fill="#f6d365" stroke="#c9a227" stroke-width=".6"/></g>`;
    }

    const c = k("color") ? COLOR[p.color] : UNKNOWN;
    if (!k("mueble")) {
      s += `<rect x="33" y="46" width="54" height="26" rx="4" fill="none" stroke="#a59c85" stroke-width="1" stroke-dasharray="3 2"/>
        <text x="60" y="63" ${FONT} font-size="11" font-weight="700" fill="#a59c85">?</text>`;
    } else if (p.mueble === "cama") {
      s += `<g${cls("mueble", "color")}><rect x="32" y="40" width="6" height="33" rx="2" fill="#8a5a2b"/><rect x="84" y="57" width="4" height="16" rx="1.5" fill="#8a5a2b"/>
        <rect x="37" y="57" width="48" height="12" rx="2" fill="#fff" stroke="#bbb" stroke-width=".5"/>
        <rect x="52" y="56" width="33" height="14" rx="2" fill="${c}" stroke="#000" stroke-opacity=".25" stroke-width=".5"/>
        <rect x="39" y="52.5" width="11" height="5.5" rx="2.5" fill="#fff" stroke="#bbb" stroke-width=".5"/></g>`;
    } else {
      s += `<g${cls("mueble", "color")}><rect x="33" y="44" width="54" height="18" rx="5" fill="${c}"/>
        <rect x="29" y="52" width="9" height="20" rx="4" fill="${c}"/><rect x="82" y="52" width="9" height="20" rx="4" fill="${c}"/>
        <rect x="36" y="58" width="48" height="13" rx="3" fill="${c}"/><rect x="36" y="58" width="48" height="13" rx="3" fill="#000" opacity=".13"/>
        <path d="M60,58V71" stroke="#000" stroke-opacity=".2" stroke-width=".7"/></g>`;
    }

    s += `<rect x="47" y="78" width="2.5" height="15" fill="#7d5a30"/><rect x="70.5" y="78" width="2.5" height="15" fill="#7d5a30"/>
      <rect x="44" y="75" width="32" height="3" rx="1" fill="#a9773f"/>`;

    if (k("gato")) {
      const at = { mesa_encima: [61, 75], mesa_debajo: [61, 93], mueble_encima: [67, p.mueble === "cama" ? 56 : 59] }[p.gato];
      s += `<g${cls("gato")}>${cat(at[0], at[1])}</g>`;
    }
    return `<svg class="vd-fig" viewBox="0 0 120 100" aria-hidden="true">${s}</svg>`;
  }

  // ---------- one kit per Spanish lesson, chosen by <div id="detective" data-caso="leccion-N"> ----------

  const RULES = (thing, pick) => `Svedok hovorí po slovensky, ty dopĺňaš policajné hlásenie po španielsky. Každá správna odpoveď dokreslí ${thing}.
    Chybná odpoveď nákres rozmaže a otázka sa vráti. Nakoniec nájdi ${pick}, kým vyprší čas. Za prípad môžeš získať až tri hviezdičky.`;

  const KITS = {
    "leccion-3": {
      store: "detective-leccion-3", cases: PERSON_CASES, draw: figure,
      text: {
        done: "Všetky prípady sú vyriešené. V meste je opäť pokoj!",
        rules: RULES("portrét páchateľa", "páchateľa medzi šiestimi podozrivými"),
        brief: "Vypočuj svedka a zostav portrét.",
        empty: "Zatiaľ nič. Portrét sa dokreslí podľa tvojich odpovedí.",
        retry: "↩ Táto otázka sa vrátila. Skús ju znova a portrét sa vyčistí.",
        readyTitle: "Portrét je hotový!",
        ready: "Polícia priviedla šesť podozrivých. Podľa hlásenia nájdi páchateľa.",
        toLineup: "K podozrivým",
        pick: "<strong>Kto je páchateľ?</strong> Ťukni na osobu, ktorá zodpovedá hláseniu.",
        label: "Podozrivá osoba číslo",
        right: "Správne! To je páchateľ.",
        wrong: "Táto osoba je nevinná. Prečítaj si hlásenie ešte raz.",
        timeout: "Čas vypršal. Podozriví ešte čakajú, vyber si pokojne.",
        last: " Šéf zlodejov je za mrežami a v meste je opäť pokoj!",
      },
    },
    "leccion-4": {
      store: "detective-leccion-4", cases: SCHOOL_CASES, draw: desk, wide: true,
      text: {
        done: "Všetky prípady sú vyriešené. V škole je opäť poriadok!",
        rules: RULES("lavicu, pri ktorej zlodej sedí", "zlodejovu lavicu medzi šiestimi podobnými"),
        brief: "Vypočuj svedka a zostav nákres lavice.",
        empty: "Zatiaľ nič. Nákres sa dokreslí podľa tvojich odpovedí.",
        retry: "↩ Táto otázka sa vrátila. Skús ju znova a nákres sa vyčistí.",
        readyTitle: "Nákres je hotový!",
        ready: "V škole je šesť podobných lavíc. Podľa hlásenia nájdi tú zlodejovu.",
        toLineup: "K laviciam",
        pick: "<strong>Ktorá lavica patrí zlodejovi?</strong> Ťukni na obrázok, ktorý zodpovedá hláseniu.",
        label: "Lavica číslo",
        right: "Správne! Toto je zlodejova lavica.",
        wrong: "Táto lavica to nie je. Prečítaj si hlásenie ešte raz.",
        timeout: "Čas vypršal. Lavice nikam neutečú, vyber si pokojne.",
        last: " Písomky sú späť v zborovni a v škole je opäť poriadok!",
      },
    },
    "leccion-5": {
      store: "detective-leccion-5", cases: HOME_CASES, draw: room, wide: true,
      text: {
        done: "Všetky skrýše sú odhalené. Ukradnuté veci sa vracajú majiteľom!",
        rules: RULES("izbu, v ktorej sa zlodej skrýva", "správnu izbu medzi šiestimi podobnými"),
        brief: "Vypočuj svedka a zostav nákres izby.",
        empty: "Zatiaľ nič. Nákres sa dokreslí podľa tvojich odpovedí.",
        retry: "↩ Táto otázka sa vrátila. Skús ju znova a nákres sa vyčistí.",
        readyTitle: "Nákres je hotový!",
        ready: "Polícia našla šesť podobných izieb. Podľa hlásenia nájdi tú správnu.",
        toLineup: "K izbám",
        pick: "<strong>Ktorá izba je skrýša?</strong> Ťukni na obrázok, ktorý zodpovedá hláseniu.",
        label: "Izba číslo",
        right: "Správne! Toto je skrýša.",
        wrong: "Táto izba to nie je. Prečítaj si hlásenie ešte raz.",
        timeout: "Čas vypršal. Izby nikam neutečú, vyber si pokojne.",
        last: " Šéfova skrýša je odhalená a všetky ukradnuté veci sa vracajú majiteľom!",
      },
    },
  };

  const KIT = KITS[root.dataset.caso] || KITS["leccion-3"];
  const STORE = KIT.store, CASES = KIT.cases, T = KIT.text, draw = KIT.draw;
  if (KIT.wide) root.classList.add("vd-wide");

  let progress = { stars: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    if (saved && Array.isArray(saved.stars)) progress.stars = saved.stars.map((n) => Math.max(0, Math.min(3, Number(n) || 0)));
  } catch (e) { /* no saved progress */ }
  const saveProgress = () => {
    try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch (e) { /* private mode: play without saving */ }
  };

  // ---------- case list ----------

  function showCases() {
    clearTimers();
    const done = CASES.findIndex((_, i) => !(progress.stars[i] > 0));
    const open = done === -1 ? CASES.length : done;
    const items = CASES.map((c, i) => {
      const stars = progress.stars[i] || 0;
      const locked = i > open;
      return `<li><button class="vj-leg" data-case="${i}"${locked ? " disabled" : ""}>
        <span><strong>Prípad ${i + 1}: ${esc(c.title)}</strong>
        <span class="meta">${locked ? "Najprv vyrieš predchádzajúci prípad" : esc(c.story)}</span></span>
        <span class="vj-stars"${stars ? ` aria-label="Hviezdičky: ${stars} z 3"` : ""}>${locked ? "🔒" : stars ? starsHTML(stars) : ""}</span>
      </button></li>`;
    }).join("");
    root.innerHTML = `
      ${open === CASES.length ? `<p><strong>${T.done}</strong> Každý prípad si môžeš zopakovať a zlepšiť si hviezdičky.</p>` : ""}
      <ul class="vj-legs">${items}</ul>
      <p class="vj-rules">${T.rules}</p>
      ${progress.stars.some((n) => n > 0) ? `<div class="vj-actions"><button class="vj-btn" data-act="reset">Začať odznova</button></div>` : ""}`;
  }

  // ---------- interview ----------

  let game = null;

  function startCase(i) {
    clearTimers();
    const c = CASES[i];
    game = {
      i, c, mistakes: 0, known: new Set(), smudged: new Set(), notes: [], missed: [],
      queue: c.questions.map((q) => ({ q })),
    };
    root.innerHTML = `
      <div class="vd-board">
        <div class="vd-sketch"></div>
        <div class="vd-notes"><h3>Hlásenie</h3><ul></ul></div>
      </div>
      <div class="vj-card">
        <p class="vj-prompt"><strong>Prípad ${i + 1}: ${esc(c.title)}</strong></p>
        <p class="vd-story">${esc(c.story)} ${T.brief}</p>
        <div class="vj-actions"><button class="vj-btn primary" data-act="begin">Začať výsluch</button></div>
      </div>
      <div class="vj-actions vd-leave"><button class="vj-btn" data-act="cases">← Späť na prípady</button></div>`;
    drawBoard();
    root.querySelector("[data-act=begin]").focus({ preventScroll: true });
    root.scrollIntoView({ block: "start" });
  }

  function drawBoard(fresh) {
    root.querySelector(".vd-sketch").innerHTML = draw(game.c.culprit, { known: game.known, fresh, smudged: game.smudged });
    root.querySelector(".vd-notes ul").innerHTML = game.notes.length
      ? game.notes.map((n) => `<li lang="es">${esc(n)}</li>`).join("")
      : `<li class="empty">${T.empty}</li>`;
  }

  function nextQuestion() {
    const card = root.querySelector(".vj-card");
    if (!game.queue.length) {
      if (!game.missed.length) {
        card.innerHTML = `<p class="vj-prompt"><strong>${T.readyTitle}</strong></p>
          <p>${T.ready} Máš na to ${LINEUP_SECONDS} sekúnd.</p>
          <div class="vj-actions"><button class="vj-btn primary" data-act="lineup">${T.toLineup}</button></div>`;
        card.querySelector("button").focus({ preventScroll: true });
        return;
      }
      game.queue = game.missed.map((q) => ({ q, retry: true }));
      game.missed = [];
    }
    const item = game.queue.shift();
    const q = item.q;
    card.innerHTML = `${item.retry ? `<p class="vj-retry">${T.retry}</p>` : ""}
      <div class="vd-witness"><strong>🗣️ Svedok hovorí:</strong>„${esc(q.sk)}“</div>
      <p class="vd-task">Doplň hlásenie po španielsky${q.hint ? ` (${esc(q.hint)})` : ""}:</p>
      <p class="vj-prompt" lang="es">${gap(q.es)}</p>
      <form class="vj-form"><input class="vj-input" type="text" lang="es" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Tvoja odpoveď">
        <button class="vj-btn primary" type="submit">Skontrolovať</button></form>
      <div class="vj-keys" aria-label="Španielske znaky">${["á", "é", "í", "ó", "ú", "ñ"].map((ch) => `<button type="button">${ch}</button>`).join("")}</div>
      <p class="vj-feedback" aria-live="polite"></p>`;
    const input = card.querySelector(".vj-input");
    let settled = false;
    card.querySelector(".vj-form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (settled || !clean(input.value)) return;
      settled = true;
      const exact = q.accept.find((a) => clean(a) === clean(input.value));
      const close = q.accept.find((a) => plain(a) === plain(input.value));
      const right = Boolean(close);
      card.querySelectorAll(".vj-input, .vj-form button, .vj-keys button").forEach((el) => { el.disabled = true; });
      input.classList.add(right ? "correct" : "wrong");
      const feedback = card.querySelector(".vj-feedback");
      feedback.className = "vj-feedback " + (right ? "good" : "bad");
      feedback.textContent = (right
        ? "Správne! " + (exact ? "" : `Pozor na diakritiku: ${close}. `)
        : `Nesprávne. Správna odpoveď: ${q.accept[0]}. `) + q.explain;
      q.f.forEach((f) => game.known.add(f));
      if (right) {
        q.f.forEach((f) => game.smudged.delete(f));
        const note = q.es.replace("___", q.accept[0]);
        game.notes.push(note.charAt(0).toUpperCase() + note.slice(1));
        drawBoard(q.f);
        later(nextQuestion, 1900);
      } else {
        if (!item.retry) game.mistakes++;
        q.f.forEach((f) => game.smudged.add(f));
        game.missed.push(q);
        drawBoard(q.f);
        const actions = document.createElement("div");
        actions.className = "vj-actions";
        actions.innerHTML = `<button class="vj-btn primary">Ďalej</button>`;
        actions.firstChild.onclick = nextQuestion;
        card.append(actions);
        actions.firstChild.focus({ preventScroll: true });
      }
    });
    card.querySelectorAll(".vj-keys button").forEach((key) => {
      key.addEventListener("click", () => {
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        input.value = input.value.slice(0, start) + key.textContent + input.value.slice(end);
        input.focus();
        input.setSelectionRange(start + 1, start + 1);
      });
    });
    input.focus({ preventScroll: true });
  }

  // ---------- line-up ----------

  function showLineup() {
    clearTimers();
    const c = game.c;
    const suspects = shuffle([{ p: c.culprit, guilty: true }, ...c.others.map((diff) => ({ p: { ...c.culprit, ...diff } }))]);
    root.innerHTML = `
      <div class="vj-card">
        <p class="vj-prompt">${T.pick}</p>
        <p class="vd-report" lang="es">${esc(game.notes.join(" "))}</p>
        <div class="vd-timer" style="--vd-time:${LINEUP_SECONDS}s"><div></div></div>
        <div class="vd-lineup">${suspects.map((s, n) => `<button class="vd-suspect" data-n="${n}" style="animation-delay:${n * 0.12}s" aria-label="${T.label} ${n + 1}">
          <span class="num">${n + 1}</span>${draw(s.p)}</button>`).join("")}</div>
        <p class="vj-feedback" aria-live="polite"></p>
      </div>
      <div class="vj-actions vd-leave"><button class="vj-btn" data-act="cases">← Späť na prípady</button></div>`;
    root.scrollIntoView({ block: "start" });
    const feedback = root.querySelector(".vj-feedback");
    const timerBar = root.querySelector(".vd-timer");
    const timeout = later(() => {
      game.mistakes++;
      timerBar.remove();
      feedback.className = "vj-feedback bad";
      feedback.textContent = T.timeout;
    }, LINEUP_SECONDS * 1000);
    root.querySelectorAll(".vd-suspect").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = suspects[Number(btn.dataset.n)];
        if (s.guilty) {
          clearTimeout(timeout);
          timerBar.classList.add("stopped");
          btn.classList.add("correct");
          root.querySelectorAll(".vd-suspect").forEach((b) => { b.disabled = true; });
          feedback.className = "vj-feedback good";
          feedback.textContent = T.right;
          later(showSolved, 1500);
        } else {
          game.mistakes++;
          btn.classList.add("wrong");
          btn.disabled = true;
          feedback.className = "vj-feedback bad";
          feedback.textContent = T.wrong;
        }
      });
    });
  }

  function showSolved() {
    const { i, c, mistakes } = game;
    const stars = mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1;
    for (let k = 0; k <= i; k++) progress.stars[k] = progress.stars[k] || 0;
    progress.stars[i] = Math.max(stars, progress.stars[i]);
    saveProgress();
    const last = i === CASES.length - 1;
    root.innerHTML = `<div class="vj-card vj-arrival">
      <div class="vd-solved">
        <div class="vd-sketch">${draw(c.culprit)}<span class="vd-stamp">VYRIEŠENÉ</span></div>
        <div>
          <h2>Prípad ${i + 1}: ${esc(c.title)}</h2>
          <p class="vj-stars" aria-label="Hviezdičky: ${stars} z 3">${starsHTML(stars)}</p>
        </div>
      </div>
      <p>${mistakes === 0 ? "Bez jedinej chyby, výborne!" : `Počet chýb: ${mistakes}.`}${stars < 3 ? " Tri hviezdičky získaš najviac s jednou chybou." : ""}
      ${last ? T.last : ""}</p>
      <p class="vd-report" lang="es">${esc(game.notes.join(" "))}</p>
      <div class="vj-actions">
        ${last ? "" : `<button class="vj-btn primary" data-case="${i + 1}">Ďalší prípad: ${esc(CASES[i + 1].title)}</button>`}
        <button class="vj-btn" data-case="${i}">Zopakovať prípad</button>
        <button class="vj-btn${last ? " primary" : ""}" data-act="cases">Zoznam prípadov</button>
      </div></div>`;
    game = null;
    root.scrollIntoView({ block: "start" });
  }

  // ---------- events ----------

  root.addEventListener("click", (e) => {
    const caseBtn = e.target.closest("[data-case]");
    if (caseBtn && !caseBtn.disabled) return void startCase(Number(caseBtn.dataset.case));
    const act = e.target.closest("[data-act]");
    if (!act) return;
    const name = act.dataset.act;
    if (name === "cases") showCases();
    if (name === "begin") nextQuestion();
    if (name === "lineup") showLineup();
    if (name === "reset" && confirm("Naozaj chceš vymazať hviezdičky a začať odznova?")) {
      progress = { stars: [] };
      saveProgress();
      showCases();
    }
  });

  showCases();
})();
