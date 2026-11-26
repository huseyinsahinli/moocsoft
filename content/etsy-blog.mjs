import { apps, site, escape as e } from './apps.mjs';
import { footer, head } from './components.mjs';

export const etsyShop = 'https://www.etsy.com/shop/MoocsoftPaper';

const products = {
  "sunday-archive": {
    "name": "Sunday Archive",
    "image": "/assets/etsy/sunday-archive",
    "alt": "Family recipe book cover and eight cut-apart family interview cards",
    "summary": "A 10-page recipe journal with space for a cook’s handwriting, eight interview cards and a dedication about the first day you cooked together.",
    "url": "https://www.etsy.com/listing/4626108861/family-recipe-keepsake-book-printable"
  },
  "postcards-from-elsewhere": {
    "name": "Postcards from Elsewhere",
    "image": "/assets/etsy/postcards-from-elsewhere",
    "alt": "Travel journal cover beside two cut-apart travel memory postcards",
    "summary": "Six keepsake postcards, a walking map, ticket pages, a trip fund log and a homecoming letter in a 10-page travel journal.",
    "url": "https://www.etsy.com/listing/4626111487/printable-travel-journal-with-six"
  }
,
  'missing-tree-star': {
    name: 'The Missing Tree Star',
    image: '/assets/etsy/missing-tree-star',
    alt: 'Christmas Mystery Game cover showing the case briefing and deduction grid',
    summary: 'A Christmas detective game with six witness clues, two logic grids, a letter code and a full answer key.',
    url: 'https://www.etsy.com/listing/4624416089/christmas-mystery-game-printable-the',
  },
  'cookie-exchange': {
    name: 'Christmas Cookie Exchange Kit',
    image: '/assets/etsy/cookie-exchange',
    alt: 'Cookie Exchange Kit cover showing the printable recipe cards and tent labels',
    summary: 'A baker sign-up sheet, recipe cards, fold-over labels, voting slips, take-home tags and an award.',
    url: 'https://www.etsy.com/listing/4624420958/christmas-cookie-exchange-printable-kit',
  },
  'secret-santa': {
    name: 'Secret Santa Questionnaire',
    image: '/assets/etsy/secret-santa',
    alt: 'Secret Santa cover showing the workplace and family questionnaires',
    summary: 'Separate office and family wish lists, two half-page forms, a match organizer and six gift tags.',
    url: 'https://www.etsy.com/listing/4624416235/secret-santa-questionnaire-printable-for',
  },
  'christmas-eve-box': {
    name: 'Christmas Eve Box Kit',
    image: '/assets/etsy/christmas-eve-box',
    alt: 'Christmas Eve Box Kit cover showing write-in box labels and cozy night tickets',
    summary: 'Two box labels, six tags, eight activity tickets, a family note, a checklist and a memory page.',
    url: 'https://www.etsy.com/listing/4624421462/christmas-eve-box-printable-kit-with-box',
  },
  'christmas-dinner': {
    name: 'Christmas Dinner Planner',
    image: '/assets/etsy/christmas-dinner',
    alt: 'Christmas Dinner Planner cover showing the menu and oven schedule pages',
    summary: 'A menu planner, categorized shopping list, oven schedule, serving timeline, guest list and place cards.',
    url: 'https://www.etsy.com/listing/4624420956/christmas-dinner-planner-printable-with',
  },
  'perfect-february': {
    name: 'Perfect February 2027',
    image: '/assets/etsy/perfect-february',
    alt: 'Perfect February cover showing the monthly calendar, weekly planner and habit tracker',
    summary: 'A Monday-start calendar, four dated weekly pages, a 28-day habit tracker and a month-end review.',
    url: 'https://www.etsy.com/listing/4623183132/february-2027-calendar-and-4-week',
  },
  'new-year-kit': {
    name: '2027 New Year Printable Kit',
    image: '/assets/etsy/new-year-kit',
    alt: 'New Year kit cover showing two greeting cards, a 2027 calendar and a goals page',
    summary: 'Four greeting cards, a year-at-a-glance calendar, a goals page and four cut-out goal cards.',
    url: 'https://www.etsy.com/listing/4623143251/2027-new-year-printable-kit-with',
  },
};

const posts = [
  {
    "slug": "how-to-make-a-family-recipe-keepsake-book",
    "title": "How to Make a Family Recipe Book in the Cook’s Own Words",
    "description": "Turn one family dish into a keepsake. Use interview questions, record the cues a recipe leaves out and dedicate a page to the first day you cooked together.",
    "published": "2026-11-26",
    "products": [
      "sunday-archive"
    ],
    "previewLink": "See the printable family recipe book on Etsy",
    "intro": "Start with one dish someone in the family would miss. Put a blank page on the counter the next time the cook makes it. The most valuable line might be the one they never thought to write down. When they reach for a familiar cup, ask to see it. When they turn down the heat, ask what they noticed.",
    "table": {
      "caption": "Four ways to turn a kitchen conversation into a usable recipe",
      "headers": [
        "What you hear",
        "What to ask or record"
      ],
      "rows": [
        [
          "“A cup of flour.”",
          "Which cup? Trace the rim or measure what the cook puts in it. Keep both descriptions."
        ],
        [
          "“Stir until it feels right.”",
          "Ask the cook to hand you the spoon at that moment. Write how it moves."
        ],
        [
          "“Your uncle always took the first piece.”",
          "Write the line as you heard it. Put the name and the occasion beside it."
        ],
        [
          "“I usually use something else in winter.”",
          "Give the seasonal version its own line so the next cook knows when to use it."
        ]
      ]
    },
    "sections": [
      [
        "What belongs on the first recipe spread?",
        "Give one page to ingredients and the next to the order of the work. Start with the name the family actually uses for the dish, even if a cookbook calls it something else. Add who usually made it and how many people it served that day. If a measure is uncertain, leave space to confirm it the next time you cook."
      ],
      [
        "Ask a question while your hands are busy",
        "Pick an interview card before you start. Ask how the cook knows what is missing after the first taste, then listen for the decision that follows. “I add lemon when the lentils taste flat” gives the next cook more to work with than “season to taste.” That example is fictional. Keep the actual cook’s words in your book."
      ],
      [
        "Make the gift page about a day you shared",
        "Picture the first time the two of you cooked together. Where were you standing? What did you try to make? Write down one small thing the other person might have forgotten. A tipped flour tin or the wait for someone to find the right lid can place both of you back in the room. Finish with your name and the date, then slip the dedication inside the cover."
      ],
      [
        "Print one set before making copies",
        "Choose A4 or US Letter to match your paper and print a single recipe spread at actual size. Check the writing space with the pen you plan to give. Repeat the ingredient and method pages for each dish, and keep a scan of a fragile handwritten recipe so the original stays with its owner."
      ]
    ],
    "related": [
      [
        "Plan a family dinner with one oven",
        "/blog/one-oven-christmas-dinner-timeline/"
      ],
      [
        "Share recipe cards at a cookie exchange",
        "/blog/host-a-christmas-cookie-exchange/"
      ]
    ],
    "closing": "Sunday Archive is a paid digital download. Both English PDFs contain the same ten pages, including eight interview cards and two recipe cards to cut apart."
  },
  {
    "slug": "travel-journal-prompts-for-six-postcards",
    "title": "Six Travel Journal Prompts for a Trip Told in Postcards",
    "description": "Remember a journey through six postcard prompts, from first light to the sound you would take home. Includes a walking-map example and a way to caption ticket stubs.",
    "published": "2026-11-26",
    "products": [
      "postcards-from-elsewhere"
    ],
    "previewLink": "See the six-postcard travel journal on Etsy",
    "intro": "If your camera roll already tells you where you went, use a journal for what the pictures miss. Six short postcards are enough to hold a trip together. You can write one on the train, two at a café and the last at home. Leave room for a moment that only makes sense once the journey is over.",
    "table": {
      "caption": "Choose one detail for each keepsake card",
      "headers": [
        "Card",
        "A way to start"
      ],
      "rows": [
        [
          "1 · Arrival",
          "Finish “I knew I had arrived when…” with one detail from the first five minutes."
        ],
        [
          "2 · First light",
          "Look out the window before checking your phone. What catches the light first?"
        ],
        [
          "3 · A table for one more",
          "Name one thing on the table and one thing someone said."
        ],
        [
          "4 · The long way",
          "Which turn changed your route? What made you take it?"
        ],
        [
          "5 · Small kindness",
          "Describe a gesture you might forget by next week."
        ],
        [
          "6 · A sound to take home",
          "Write the rhythm of one sound. Where did you hear it, and what did you hear after it stopped?"
        ]
      ]
    },
    "sections": [
      [
        "Use one scene per postcard",
        "Instead of squeezing a whole day into three lines, give the card one job. Imagine a morning at a ferry landing. “Nice harbour” tells you the setting. “Two knocks on the rail, then the engine went quiet” puts you there for a moment. Add the place and date under the scene."
      ],
      [
        "Draw the walk as you would explain it to a friend",
        "Mark where you started, the corner where you nearly went straight and the spot where you stopped. A bench, bakery window or blue door can be a more memorable landmark than a street name. Use the walking-map page for the sketch and the detour card for the reason you took that turn."
      ],
      [
        "Give a saved ticket a caption",
        "Mount a copy of a ticket or café slip and write why you kept it. A fare tells you what the ride cost. A line about the person who waved from the platform tells you why it belonged on this page. Cover names, booking codes and barcodes before giving a page away."
      ],
      [
        "Keep the last sound card until you get home",
        "Read the first five cards somewhere quiet. Which sound can you still hear without replaying a video? Try two lines in different rhythms and keep the one that reads like the place. Tuck that card into an envelope, give it to your travel companion or leave it on the sheet beside the homecoming letter."
      ]
    ],
    "related": [
      [
        "Turn trip photos into a February project",
        "/blog/plan-february-2027-in-four-weeks/"
      ],
      [
        "Browse all Moocsoft Paper guides",
        "/blog/"
      ]
    ],
    "closing": "Postcards from Elsewhere is a paid digital download. Each English PDF has ten pages. Choose A4 or US Letter, print at actual size and cut the six cards apart or leave the sheets together."
  }
, {
  slug: 'one-oven-christmas-dinner-timeline',
  title: 'Christmas Dinner Timeline for One Oven',
  description: 'Plan a one-oven Christmas dinner backward from serving time. Use a worked 6 p.m. schedule to spot tray clashes and decide what to move to the stovetop.',
  published: '2026-11-25',
  products: ['christmas-dinner'],
  previewLink: 'Preview our printable dinner planner on Etsy',
  intro: 'Start with the time the food should reach the table. For each dish, write down its oven temperature, how much rack space it needs, and what has to happen after it comes out. Two trays that need the same rack at different temperatures are a scheduling conflict, even if their cooking times look short.',
  table: {
    caption: 'Worked example for a 6 p.m. dinner',
    headers: ['Time', 'Oven', 'What happens elsewhere'],
    rows: [
      ['4:45 p.m.', 'Preheat for the gratin.', 'Set out the serving dishes and their spoons.'],
      ['5:00–5:45', 'Bake the gratin for the 45 minutes in your recipe.', 'Set the table and prepare the green beans for the stovetop.'],
      ['5:45–5:50', 'Take out the gratin and check the oven setting for the rolls.', 'Let the gratin rest as directed. A helper fills the water glasses.'],
      ['5:50–6:00', 'Warm the rolls if the oven is at the temperature your recipe calls for.', 'Finish the beans, dress the salad and carry the dishes to the table.'],
    ],
  },
  sections: [
    ['What fits in the oven at the same time?', 'Try the empty pans on the actual racks before the day. Include handles and lids. In this example the gratin occupies the main rack, the beans cook on the stove, and the salad needs no heat. The schedule assumes your gratin recipe allows a 15-minute rest and your rolls need 10 minutes. Replace both with the timings for your dishes.'],
    ['What if two dishes need the same slot?', 'Suppose a guest offers a second baked side that needs the oven from 5:30 until 6. The gratin is still in there. Ask whether the guest would like to bring a cold side instead, or serve the rolls at room temperature and give the last slot to a dish that fits it. Decide before shopping, while the menu is still easy to change.'],
    ['Give each helper a handoff they can see', '“When the gratin comes out, put the water glasses on the table” is easier to follow than “help around six.” Write one name beside each last-minute job. Our Christmas Dinner Planner has separate oven and serving pages, so the person setting the table can take their sheet out of the kitchen.'],
  ],
  related: [
    ['Choose Christmas printables for your gathering', '/blog/christmas-printables/'],
    ['Set up a mystery while dinner is cooking', '/blog/christmas-mystery-game-for-kids/'],
    ['Work out quantities for a cookie swap', '/blog/host-a-christmas-cookie-exchange/'],
  ],
  closing: 'The Christmas Dinner Planner is a paid PDF download. Preview the menu, oven schedule and serving timeline on Etsy before choosing the pages to print.',
}, {
  slug: 'christmas-mystery-game-for-kids',
  title: 'Christmas Mystery Game for Kids: A Host’s Guide',
  description: 'Set up a printable Christmas mystery game for kids and adults. Try a spoiler-free practice clue, share detective roles and know when to offer a hint.',
  published: '2026-11-25',
  products: ['missing-tree-star'],
  intro: 'Give each team a pencil, a place to spread out its clues and a grid everyone can see. Keep the answer key with the host. Before opening the case, try the little practice puzzle below so younger detectives get a turn at reasoning before the faster readers race ahead.',
  table: {
    caption: 'A two-clue warm-up, separate from the printable game',
    headers: ['Read aloud', 'Ask the team'],
    rows: [
      ['A bell is in one of three boxes: red, blue or green.', 'What are the three possibilities?'],
      ['Clue one: The green box is empty.', 'Which box can you cross out?'],
      ['Clue two: The red box holds only a ribbon.', 'Which box must hold the bell, and why?'],
    ],
  },
  sections: [
    ['Let a child explain the first deduction', 'The bell must be in the blue box. Ask someone to explain why both other boxes are ruled out. If they guessed blue straight away, invite another player to point to the clue that rules out red. This gives the group a shared rule for the main game: every mark on the grid needs a reason.'],
    ['Divide the jobs around the table', 'In our printable case, The Missing Tree Star, teams have six witness clues, two logic grids and a letter code to work through. One player reads a statement, another marks the grid, and a third asks which words support the mark. Swap jobs after each clue. A child who prefers listening can point to the square while a partner writes.'],
    ['Offer a hint without giving away the ending', 'If the group stalls, ask them to show you their last certain mark. Then ask which witness helped them make it. Often two players have understood a word differently. Let them reread the line together before offering a printed hint. Give the team the letter-code worksheet when they reach it. Keep your answer key face down until everyone has had a chance to explain a theory.'],
  ],
  related: [
    ['Compare five Christmas party printables', '/blog/christmas-printables/'],
    ['Time the game around Christmas dinner', '/blog/one-oven-christmas-dinner-timeline/'],
    ['Organize a family Secret Santa draw', '/blog/organize-secret-santa-with-wish-lists/'],
  ],
  closing: 'The Missing Tree Star is a paid digital download. The Etsy preview shows the case materials so you can decide whether the reading and puzzles suit your group.',
}, {
  slug: 'christmas-printables',
  title: "Christmas Printables for Parties and Gift Swaps",
  description: "Choose Christmas printables for a cookie swap, Secret Santa draw, family mystery or dinner. See what to print before guests arrive and what to set out.",
  published: '2026-11-24',
  products: ['cookie-exchange', 'christmas-eve-box', 'christmas-dinner', 'secret-santa', 'missing-tree-star'],
  intro: "If your guests arrive at four and dinner starts at six, what happens in between? A mystery gives early arrivals something to solve together. A cookie swap works better when everyone has agreed to bake ahead. Start with the part of the gathering you want help with, then choose a set below.",
  details: {
    'cookie-exchange': 'Send the sign-up sheet before the swap. At the party, put a recipe card and a fold-over label next to each plate before guests vote.',
    'christmas-eve-box': 'Wrap a box you already have, write a short note and tuck one of the tickets inside. The story ticket gives someone the job of picking the bedtime book.',
    'christmas-dinner': 'Write down your serving time, then work backward on the oven schedule. Use the timeline to give each helper a task before everyone sits down.',
    'secret-santa': 'Hand out the office questionnaire before drawing names. For a larger group, print the two-up quick form and keep the match sheet with the organizer.',
    'missing-tree-star': 'Hand each team the witness notes, worksheet and code. Keep the hints and answer key aside until the teams are ready to check their theories.',
  },
  modified: "2026-11-25",
  table: {
    caption: "Which Christmas printable fits your plans?",
    headers: ["If you’re planning…", "Choose this set", "Prepare it when…"],
    rows: [
      ["A cookie swap", "Cookie Exchange Kit", "Send the sign-up before guests bake."],
      ["A gift exchange", "Secret Santa Questionnaire", "Collect wish lists before drawing names."],
      ["A game before dinner", "The Missing Tree Star", "Set out clues before the first guests arrive."],
      ["A sit-down meal", "Christmas Dinner Planner", "Sketch the oven schedule before shopping."],
      ["A quiet family night", "Christmas Eve Box Kit", "Put a ticket and note in the box before opening."],
    ],
  },
  related: [
    ["Build a one-oven dinner timeline", "/blog/one-oven-christmas-dinner-timeline/"],
    ["Host a Christmas mystery game", "/blog/christmas-mystery-game-for-kids/"],
    ["Calculate cookie swap quantities", "/blog/host-a-christmas-cookie-exchange/"],
    ["Collect Secret Santa wish lists", "/blog/organize-secret-santa-with-wish-lists/"],
    ["Write a card for a holiday host", "/blog/print-and-send-new-year-cards/"],
  ],
  sections: [
    ["For guests who arrive at different times", "Set a small table for The Missing Tree Star. Put the briefing, clues and a pencil there, and keep the answer key with the host. If people arrive halfway through, one player can bring them up to speed using the deduction grid."],
    ["For a gathering built around food", "Choose the cookie exchange kit when guests are bringing the treats. Send the sign-up before anyone shops. For a sit-down dinner, start with the dinner planner instead. Write the serving time first, then work backward to the dishes that share the oven."],
    ["For the gift exchange or Christmas Eve", "Use the Secret Santa forms before you draw names so each giver gets a few useful clues. For a quieter evening at home, put one activity ticket in a Christmas Eve box with a handwritten note. Let the person opening it choose when the activity starts."],
  ],
  closing: 'All five sets are paid digital downloads in English. Each includes an A4 PDF and a US Letter PDF with the same pages. Etsy shows the current prices and previews.',
}, {
  slug: 'moocsoft-paper-on-etsy',
  title: "2027 Printable Planners and New Year Cards",
  description: "Compare 2027 printable planners and New Year cards in A4 and US Letter. Find the right pages for a greeting, a yearly goal or four weeks of February plans.",
  published: '2026-11-22',
  products: ['new-year-kit', 'perfect-february'],
  intro: "To send a January greeting, choose the New Year kit. To see all four weeks of February on dated planning pages, choose Perfect February. Both sets come in A4 and US Letter. The difference is what you want to have on your desk once the page comes out of the printer.",
  details: {
    'new-year-kit': 'Set aside a card for someone you want to thank or catch up with. Keep the year calendar nearby, then use the goals page to write down a few priorities and a first step for each.',
    'perfect-february': 'February 2027 starts on Monday the 1st and ends on Sunday the 28th. That gives the month four complete Monday-to-Sunday weeks. The weekly sheets follow those dates, and the tracker has room for three habits.',
  },
  modified: "2026-11-25",
  table: {
    caption: "Which pages will you actually use?",
    headers: ["What you want to do", "Set to choose", "Page to print first"],
    rows: [
      ["Send a personal greeting", "2027 New Year Printable Kit", "One of the four greeting cards"],
      ["Keep a goal in sight", "2027 New Year Printable Kit", "A cut-out goal card for your desk"],
      ["Map a project across February", "Perfect February 2027", "The dated monthly calendar"],
      ["Record a daily routine", "Perfect February 2027", "The 28-day habit tracker"],
    ],
  },
  related: [
    ["Find a message for your New Year card", "/blog/print-and-send-new-year-cards/"],
    ["See the February calendar", "/blog/plan-february-2027-in-four-weeks/"],
    ["Compare Christmas party printables", "/blog/christmas-printables/"],
  ],
  sections: [
    ["For a note that turns into a plan", "The New Year kit pairs four greeting cards with a year calendar, a goals page and four cut-out goal cards. You might send a card to the friend who taught you to knit, then use a goal card of your own to schedule an evening to finish the scarf."],
    ["For a month you can see week by week", "Perfect February works well for a project with several steps. Keep the monthly page on the fridge for shared dates and the current weekly page on your desk for tasks. The 28-day tracker gives you a separate place to record a recurring action."],
    ["What to check before you print", "Both are paid digital downloads. Check the Etsy preview for the layout you want, choose the PDF matching the paper already in your printer, and select one page for a test. If you only need a weekly sheet today, enter its page number in the print dialog."],
  ],
  closing: 'Both sets are paid digital downloads in English, with A4 and US Letter PDFs. You can preview the pages and see the current price on Etsy.',
}, {
  slug: 'host-a-christmas-cookie-exchange',
  title: "Cookie Exchange: How Many Cookies Per Person?",
  description: "Work out how many cookies per person to bring to a cookie exchange. Compare six- and eight-baker swaps, copy an invitation and plan your tasting plate.",
  published: '2026-11-25',
  products: ['cookie-exchange'],
  intro: "For a Christmas cookie exchange with eight bakers, ask each person to bring 21 cookies if everyone takes home three from each of the seven other bakers. Add eight more per baker if you want everyone to taste one of every kind at the party.",
  modified: "2026-11-25",
  table: {
    caption: "How many cookies should each baker bring?",
    headers: ["Bakers", "Cookies per other baker", "For the swap", "With one tasting cookie per guest"],
    rows: [
      ["6", "2", "10", "16"],
      ["8", "3", "21", "29"],
    ],
  },
  related: [
    ["Choose printable activities for your party", "/blog/christmas-printables/"],
    ["Add a Secret Santa draw", "/blog/organize-secret-santa-with-wish-lists/"],
    ["Write a thank-you card for your host", "/blog/print-and-send-new-year-cards/"],
  ],
  sections: [
    ["Calculate the batch before sending invitations", "Multiply the number of other bakers by the cookies you want from each batch. For six bakers taking two of each other’s cookies, each baker brings 5 × 2 = 10. Count a couple baking one recipe together as one baker. If someone cancels after baking day, divide the spare portions at the table."],
    ["An invitation you can copy", "“Cookie swap at my place on December 12 at 3 p.m.! We have eight bakers. Bring 21 cookies of one kind, packed in seven groups of three, and an empty container for the trip home. Tell me what you’re baking by December 5 so I can make the table labels.” Add tasting quantities if you plan to serve samples."],
    ["Set up a table guests can navigate", "Put the cookie name and the baker’s recipe card beside each batch. Place tasting samples on a separate plate so nobody eats a portion meant for the swap. Invite guests with ingredient questions to speak to the baker directly. When everyone is ready, walk around the table once, picking up one packet from each of the other bakers."],
  ],
  closing: 'The Christmas Cookie Exchange Kit is a paid digital download with A4 and US Letter PDFs. Preview the sign-up sheet, recipe cards and labels on Etsy.',
}, {
  slug: 'organize-secret-santa-with-wish-lists',
  title: "Secret Santa Questionnaire for Work or Family",
  description: "Use this Secret Santa questionnaire for work or family. See three answers, choose questions that fit your group and organize a private gift exchange.",
  published: '2026-11-25',
  products: ['secret-santa'],
  intro: "The most useful Secret Santa question is one a giver can shop from. “What do you reach for on a rainy afternoon?” might get you “crosswords and ginger tea.” That gives the giver two affordable ideas and leaves the surprise intact.",
  modified: "2026-11-25",
  table: {
    caption: "A filled-in Secret Santa wish list",
    headers: ["Question", "Example answer"],
    rows: [
      ["What small treat would you enjoy?", "Ginger tea or a bar of dark chocolate."],
      ["What hobby supplies do you use up?", "Fine black pens for my sketchbook."],
      ["What would you prefer to skip?", "Scented candles. I already have plenty."],
    ],
  },
  related: [
    ["Choose a printable for your gift exchange", "/blog/christmas-printables/"],
    ["Plan a cookie swap for the same gathering", "/blog/host-a-christmas-cookie-exchange/"],
    ["Write a personal note to go with a gift", "/blog/print-and-send-new-year-cards/"],
  ],
  sections: [
    ["How do you turn a wish list into a gift?", "Suppose the group agrees on a $15 limit. The list above gives the shopper two routes: a little tea assortment or replacement drawing pens. Ask participants to describe everyday favorites and share the budget before they fill out their forms."],
    ["Adjust the questions for an office or a family", "For an office draw, make it easy to opt in privately and keep the prompts about everyday tastes. For family, try one question about a shared memory. A cousin who remembers making popcorn on movie nights has a gift idea even if the recipient leaves the rest blank."],
    ["Keep the matches private through gift day", "Collect forms, draw names and check the organizer sheet for self-matches or anyone assigned twice. Send each giver their recipient’s form. Put the exchange date and drop-off location in the same message. On the day, label packages with the recipient’s name so the organizer can spot a missing gift before people leave."],
  ],
  closing: 'The Secret Santa Questionnaire is a paid digital download with office and family forms, a match organizer and gift tags in A4 and US Letter PDFs.',
}, {
  slug: 'print-and-send-new-year-cards',
  title: "New Year Card Messages: 3 Notes for 2027",
  description: "Find New Year card messages for a friend, colleague or loved one far away. Adapt three examples for 2027 and test your printable card against its envelope.",
  published: '2026-11-25',
  products: ['new-year-kit'],
  intro: "A good New Year note can be two sentences long. Name a moment from the year you shared, then offer one wish for the year ahead. If you can picture the recipient recognizing the memory, you already have enough to write.",
  modified: "2026-11-25",
  table: {
    caption: "Three New Year card messages to make your own",
    headers: ["Who it’s for", "A message to adapt"],
    rows: [
      ["A friend", "Those rainy Thursday walks got me through the autumn. Here’s to a few sunny ones in 2027."],
      ["A colleague", "Thanks for taking my first client call with me. I hope January brings you time for that trip you’ve been planning."],
      ["Someone far away", "I made your lemon cake last weekend and thought of you. I hope we can share a slice in 2027."],
    ],
  },
  related: [
    ["Compare the printable card and calendar sets", "/blog/moocsoft-paper-on-etsy/"],
    ["Use a wish list to personalize a gift note", "/blog/organize-secret-santa-with-wish-lists/"],
    ["Plan a February photo project with family", "/blog/plan-february-2027-in-four-weeks/"],
  ],
  sections: [
    ["Get the size right on a test sheet", "Open the A4 file for A4 paper or the US Letter file for Letter paper. Select just the greeting-card page. Start with Actual Size or 100%, check the print preview, and run one plain-paper copy. Fold or trim it as shown and slip it into an envelope before committing your card stock."],
    ["Leave space for handwriting", "Try your longest message on the plain-paper copy first. Leave room for your signature and a date. If several people are signing, have the first person write near the top. A child’s drawing or a last-minute line from a friend can then fit at the bottom."],
  ],
  closing: 'The 2027 New Year Printable Kit is a paid digital download. Preview the four card designs and check the current price on Etsy.',
}, {
  slug: 'plan-february-2027-in-four-weeks',
  title: "February 2027 Calendar: Monday Start",
  description: "View the February 2027 calendar with four Monday-start weeks. Use the dated grid and a family photo album example to plan a project from start to finish.",
  published: '2026-11-25',
  products: ['perfect-february'],
  intro: "February 1, 2027 falls on a Monday, and February 28 falls on a Sunday. The month fits on four complete weekly sheets. Here is how to use those weeks to finish a family photo album, with a spare week for late photos and corrections.",
  modified: "2026-11-25",
  table: {
    caption: "February 2027 at a glance",
    headers: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    rows: [
      ["1", "2", "3", "4", "5", "6", "7"],
      ["8", "9", "10", "11", "12", "13", "14"],
      ["15", "16", "17", "18", "19", "20", "21"],
      ["22", "23", "24", "25", "26", "27", "28"],
    ],
  },
  related: [
    ["Compare the dated planner and goal sheets", "/blog/moocsoft-paper-on-etsy/"],
    ["Turn a family memory into a card", "/blog/print-and-send-new-year-cards/"],
    ["Try the habit streak calendar", "/tools/habit-streak-calendar/"],
  ],
  habitApp: true,
  sections: [
    ["February 1–7 | Gather the photos", "Choose the album’s scope before you open your camera roll. One summer trip is easier to finish than an entire family history. Put your photos in one folder and ask relatives for their favorites by Sunday the 7th. On the monthly calendar, circle the date you want the album ready."],
    ["February 8–14 and 15–21 | Select and arrange", "During the second week, pick one strong photo for each place you visited and move duplicates aside. Use the third week to put the selections in order and add names or captions while you remember them. On each weekly sheet write one small job for your next free evening, such as checking the spelling of a place name."],
    ["February 22–28 | Review and finish", "Give someone who took the trip a chance to spot missing people or mixed-up dates. Reserve a second evening for corrections. On the month-end page, record how many evenings the album took. That estimate will help you decide how large your next photo project can be."],
  ],
  closing: 'Perfect February 2027 is a paid digital download with a Monday-start calendar, four dated weekly pages, a habit tracker and a month-end review.',
}];

const newestFirst = [...posts].sort((a, b) => b.published.localeCompare(a.published));
export const latestEtsyPostDate = newestFirst[0].published;
const blogPath = '/blog/';
const postPath = post => blogPath + post.slug + '/';
const dateLabel = value => new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z'));
const cover = product => ({ src: product.image + '-1200.jpg', alt: product.alt, width: 1200, height: 900 });

function comparisonTable({ caption, headers, rows }) {
  return `<div class="paper-table"><table>
    <caption>${e(caption)}</caption>
    <thead><tr>${headers.map(label => `<th scope="col">${e(label)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(row => `<tr>${row.map(value => `<td>${e(value)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

function picture(product) {
  const {src, alt, width, height} = cover(product);
  return `<picture>
    <source type="image/webp" srcset="${product.image}-640.webp 640w, ${product.image}-1200.webp 1200w" sizes="(max-width: 680px) calc(100vw - 32px), 540px">
    <img src="${src}" width="${width}" height="${height}" alt="${e(alt)}" decoding="async" loading="lazy">
  </picture>`;
}

function productCard(product, heading, detail = '') {
  return `<article class="paper-product">
    ${picture(product)}
    <div class="paper-product-copy">
      <${heading}>${e(product.name)}</${heading}>
      <p>${e(product.summary)}</p>
${detail ? `      <p>${e(detail)}</p>\n` : ''}      <a class="paper-link" href="${e(product.url)}" aria-label="View ${e(product.name)} on Etsy">View on Etsy <span aria-hidden="true">↗</span></a>
    </div>
  </article>`;
}

export function etsyHomeSection() {
  const featured = ['sunday-archive', 'postcards-from-elsewhere'];
  return `<section class="block" id="etsy" aria-labelledby="etsy-title">
    <div class="section-head">
      <h2 class="section-title" id="etsy-title">Moocsoft Paper on Etsy</h2>
      <a class="section-meta" href="${etsyShop}">Shop on Etsy <span aria-hidden="true">↗</span></a>
    </div>
    <p class="guide-topic-intro">Printable family recipe books, travel journals, party games and planners in A4 and US Letter.</p>
    <div class="paper-grid">${featured.map(key => productCard(products[key], 'h3')).join('')}</div>
    <p class="paper-more"><a href="${blogPath}">Read the Moocsoft Paper blog <span aria-hidden="true">→</span></a></p>
  </section>`;
}

const analyticsPreferences = `<details class="paper-analytics" data-paper-analytics hidden>
  <summary>Blog analytics settings</summary>
  <p>With your permission, Moocsoft uses Google Analytics cookies to count printable blog visits and clicks to Etsy. Google processes these measurements. Your choice is saved in this browser. You can change it here at any time. <a href="https://policies.google.com/technologies/partner-sites">How Google uses site data</a>.</p>
  <p role="status"></p><button type="button" data-choice="allow">Allow analytics</button> <button type="button" data-choice="decline">Decline analytics</button>
</details><script defer src="/assets/paper-analytics.js"></script>`;

export function writeEtsyBlog(write) {
  const blogTitle = 'Moocsoft Paper Blog';
  const blogDescription = 'Make a family recipe book, keep a travel journal or plan a holiday gathering with practical guides and printable examples from Moocsoft Paper.';
  const collection = {
    '@type': 'CollectionPage', name: blogTitle, description: blogDescription, url: site + blogPath,
    mainEntity: { '@type': 'ItemList', itemListElement: newestFirst.map((post, index) => ({
      '@type': 'ListItem', position: index + 1, name: post.title, url: site + postPath(post),
    })) },
  };
  const options = { stylesheets: ['etsy-blog'] };
  write(blogPath, `${head(blogTitle, blogDescription, blogPath, [collection], undefined, [], undefined, options)}
<main id="main-content" class="guide-shell paper-blog">
  <nav class="guide-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Blog</span></nav>
  <div class="guide-hero"><h1>${blogTitle}</h1><p>${blogDescription}</p><div class="guide-hero-actions"><a href="${etsyShop}">Visit the Etsy shop ↗</a></div></div>
  <div class="guide-card-grid">
    ${newestFirst.map(post => `<a class="guide-card paper-post-card" href="${postPath(post)}">
      ${picture(products[post.products[0]])}
      <time datetime="${post.published}">${dateLabel(post.published)}</time>
      <h2>${e(post.title)}</h2><p>${e(post.description)}</p><span>Read the post <span aria-hidden="true">→</span></span>
    </a>`).join('')}
  </div>
</main>
${analyticsPreferences}
${footer()}
</body>
</html>`, latestEtsyPostDate);

  for (const post of newestFirst) {
    const path = postPath(post);
    const selected = post.products.map(key => products[key]);
    const images = selected.map(product => site + cover(product).src);
    const article = {
      '@type': 'Article', headline: post.title, description: post.description, datePublished: post.published, dateModified: post.modified || post.published,
      url: site + path, mainEntityOfPage: site + path, inLanguage: 'en', image: images,
      author: { '@type': 'Organization', name: 'Moocsoft', url: site },
    };
    write(path, `${head(post.title, post.description, path, [article], undefined, [], cover(selected.at(-1)), options)}
<main id="main-content" class="guide-shell paper-blog">
  <nav class="guide-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="${blogPath}">Blog</a><span aria-hidden="true">/</span><span aria-current="page">${e(post.title)}</span></nav>
  <article>
    <header class="guide-hero">By Moocsoft Paper · Updated <time datetime="${post.modified || post.published}">${dateLabel(post.modified || post.published)}</time><h1>${e(post.title)}</h1><p>${e(post.intro)}</p><div class="guide-hero-actions">${selected.length === 1 ? `<a href="${e(selected[0].url)}">${e(post.previewLink || ('Preview ' + selected[0].name + ' on Etsy'))} ↗</a>` : '<a href="#printable-sets">Compare the printable sets ↓</a>'}</div></header>
    ${post.sections ? `<div class="guide-article paper-post-body">
      ${comparisonTable(post.table)}
      ${post.sections.map(([heading, paragraph]) => `<section><h2>${e(heading)}</h2><p>${e(paragraph)}</p></section>`).join('\n      ')}
      ${post.habitApp ? `<section><h2>How can I keep up a February routine?</h2><p>Pick one action for each project day, such as labeling five photos after dinner. Mark it on the printed tracker, or use our Habit Tracker Daily app to check it off on your phone and see your week on a calendar. Get it on the <a href="${e(apps.habits.apple)}">App Store</a> or <a href="${e(apps.habits.google)}">Google Play</a>.</p></section>` : ''}
    </div>\n    ` : ''}<div class="paper-grid" id="printable-sets">${post.products.map(key => productCard(products[key], 'h2', post.details?.[key])).join('')}</div>
    <div class="guide-related"><p>${e(post.closing)}</p><div class="guide-hero-actions"><a href="${etsyShop}">Browse Moocsoft Paper on Etsy ↗</a>${post.related.map(([label, href]) => `<a href="${e(href)}">${e(label)} →</a>`).join('')}</div></div>
  </article>
</main>
${analyticsPreferences}
${footer()}
</body>
</html>`, post.modified || post.published, images);
  }
}
