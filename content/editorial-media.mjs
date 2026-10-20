// Shared editorial scenes, not screenshots, measurements or customer records.
// Article-specific diagrams/charts take priority over these topic photographs.
const scenes = {
  nutrition: {
    alt: 'A plate of rice, vegetables and beans beside separate dressing ingredients on a kitchen table.',
    caption: 'A meal and its separately served extras, shown as a general food-journaling scene.',
    de: ['Ein Teller mit Reis, Gemüse und Bohnen neben getrennten Zutaten für ein Dressing auf einem Küchentisch.', 'Eine Mahlzeit mit separat servierten Extras als allgemeine Szene zum Ernährungstagebuch.'],
  },
  savings: {
    alt: 'Three blank kraft-paper envelopes, generic coins and a blank notebook arranged on a table.',
    caption: 'Envelopes and a notebook as an illustration of planning separate savings goals; no balance or saving outcome is shown.',
    de: ['Drei unbeschriftete Kraftpapierumschläge, allgemeine Münzen und ein leeres Notizbuch auf einem Tisch.', 'Umschläge und Notizbuch veranschaulichen die Planung getrennter Sparziele; es werden weder ein Kontostand noch ein Sparergebnis dargestellt.'],
  },
  quitting: {
    alt: 'A glass of water, walking shoes and a blank pocket notebook beside a window.',
    caption: 'Everyday objects for a pause and a written check-in; the scene does not depict a health outcome.',
    de: ['Ein Glas Wasser, Spaziergangsschuhe und ein leeres Taschennotizbuch an einem Fenster.', 'Alltagsgegenstände für eine Pause und eine schriftliche Notiz; die Szene stellt kein gesundheitliches Ergebnis dar.'],
  },
  training: {
    alt: 'Dumbbells, an exercise mat, a towel and a blank training log arranged for a workout.',
    caption: 'Training equipment beside an unfilled log, without implying a particular workout or result.',
    de: ['Hanteln, eine Trainingsmatte, ein Handtuch und ein leeres Trainingsprotokoll für ein Training.', 'Trainingsgeräte neben einem noch nicht ausgefüllten Protokoll, ohne ein bestimmtes Training oder Ergebnis zu behaupten.'],
  },
  habits: {
    alt: 'A blank notebook, a pencil, a mug and a plant on a quiet desk.',
    caption: 'A simple setting for recording a routine; the notebook contains no completed streak or progress claim.',
    de: ['Ein leeres Notizbuch, ein Bleistift, eine Tasse und eine Pflanze auf einem ruhigen Schreibtisch.', 'Ein einfacher Platz zum Festhalten einer Routine; das Notizbuch zeigt weder eine abgeschlossene Serie noch einen Fortschrittsnachweis.'],
  },
  math: {
    alt: 'Wooden geometric pieces, graph paper and a pencil arranged on a tabletop.',
    caption: 'Objects for exploring shapes and patterns, not a particular app puzzle or solution.',
    de: ['Geometrische Holzteile, kariertes Papier und ein Bleistift auf einer Tischplatte.', 'Gegenstände zum Erkunden von Formen und Mustern, keine bestimmte App-Aufgabe oder Lösung.'],
  },
  development: {
    alt: 'A closed laptop, a phone with a dark screen and blank index cards on a workspace.',
    caption: 'A mobile-project planning scene with no product interface or client project displayed.',
    de: ['Ein geschlossener Laptop, ein Smartphone mit dunklem Bildschirm und leere Karteikarten an einem Arbeitsplatz.', 'Eine Szene zur Planung eines mobilen Projekts, ohne dargestellte Produktoberfläche oder Kundenprojekt.'],
  },
};

const disclosure = 'AI-generated editorial illustration; not an app screenshot or a customer record.';
const germanDisclosure = 'KI-generierte redaktionelle Illustration; kein App-Screenshot und keine Kundendokumentation.';
const photo = (topic, alt, caption) => ({
  kind: 'photo',
  src: `/assets/editorial/${topic}.jpg`,
  width: 1200,
  height: 675,
  alt,
  caption,
  webp: [480, 800, 1200].map(width => ({ src: `/assets/editorial/${topic}-${width}.webp`, width, height: width * 9 / 16 })),
});

export const editorialPhotos = Object.fromEntries(Object.entries(scenes).map(([topic, scene]) => [topic,
  photo(topic, scene.alt, `${scene.caption} ${disclosure}`),
]));
export const editorialPhotosDe = Object.fromEntries(Object.entries(scenes).map(([topic, scene]) => [topic,
  photo(topic, scene.de[0], `${scene.de[1]} ${germanDisclosure}`),
]));
