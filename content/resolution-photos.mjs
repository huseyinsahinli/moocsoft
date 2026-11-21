// First photograph in each list is also the article's representative image.
function photo(afterSection, file, alt, caption) {
  const path = '/assets/editorial/resolutions-2027/' + file;
  return { kind: 'photo', afterSection, alt, caption: caption + ' AI-generated editorial illustration.',
    src: path + '.jpg', width: 1200, height: 675,
    webp: [480, 800, 1200].map(width => ({ src: path + '-' + width + '.webp', width, height: width * 9 / 16 })) };
}

export const resolutionPhotos = {
  'new-years-resolutions-2027': [
    photo(1, "packed-lunch-and-keys", "Packed lunch tin, keys and a closed notebook on a kitchen counter", "Pack tomorrow’s lunch while dinner is still on the counter."),
    photo(4, "sketchbook-first-minute", "Open sketchbook with a pencil and a reference photograph of a pear", "Leave the first minute of practice ready to go."),
    photo(6, "library-book-evening-routine", "A child packing an illustrated library book into a school bag", "Give tomorrow’s library book a place in the evening routine."),
  ],
  'smart-goals-for-the-new-year': [
    photo(1, "smart-study-session", "University student working through practice questions in a bright library", "Keep the questions you tried so you can inspect your progress."),
    photo(4, "piano-practice-goal", "Hands at an upright piano beside a wooden metronome", "A single difficult passage gives a practice session a clear purpose."),
    photo(5, "weekly-study-checkpoint", "Notebook with colored page flags and a stack of flashcards", "Bring your marked questions to the next review."),
  ],
  'realistic-health-fitness-resolutions': [
    photo(1, "winter-lunch-walk", "Two coworkers in coats walking through a city park", "Choose a route that leaves enough time for lunch."),
    photo(2, "shoes-ready-by-door", "Walking shoes and outdoor layers set beside an apartment door", "Put the clothes you already own where you will use them."),
    photo(3, "vegetables-for-tomorrow", "Vegetables being prepared beside open lunch containers", "Prepare an ingredient for a meal you have actually planned."),
  ],
  'new-year-financial-goals-2027': [
    photo(1, "payday-kitchen-budget", "Household envelopes and a calculator on a kitchen table", "Match each amount you set aside to a named expense."),
    photo(2, "annual-bill-envelope", "Coins, a plain envelope and a closed diary near a window", "Give annual expenses their own dates and entries."),
    photo(3, "weekly-grocery-inventory", "A shopper checking pantry supplies before a grocery trip", "Check what is in the cupboard before writing the shopping list."),
  ],
  'restart-new-years-resolutions-february': [
    photo(1, "february-habit-reset", "Woman reviewing a notebook at a desk in winter light", "Reconstruct the last missed appointment before choosing a repair."),
    photo(2, "library-bag-restart", "Canvas tote with library books and a scarf by the door", "Keep the reminder on the route you actually use."),
    photo(4, "short-guitar-practice", "A seated player practising acoustic guitar by a window", "Practise the passage that made you pause last time."),
  ],
};
