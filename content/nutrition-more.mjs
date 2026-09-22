import { table } from './apps.mjs';

export default [
  {
    topic: 'nutrition', slug: 'how-to-take-food-photos-for-calorie-tracking', published: '2026-09-22',
    title: 'How to Take Food Photos for Better Calorie Estimates',
    description: 'Use a simple food-photo checklist to show portions, ingredients and scale more clearly before reviewing an AI calorie and macro estimate.',
    intro: 'A calorie scanner can only work with what the camera shows. Better lighting and a clear view will not make a photo exact, but they can reduce avoidable ambiguity before you review the result.',
    takeaway: 'Photograph the full plate in even light, include a useful size reference, separate hidden toppings when possible and add the ingredients the camera cannot see.',
    sections: [
      ['Show the whole meal from a useful angle', `<p>Place the plate on a steady surface and keep every food item inside the frame. A view from roughly 45 degrees often shows both the surface of the food and its height. A top-down photo can be useful for a flat plate, while a side view may better reveal a deep bowl or stacked ingredients.</p><p>Avoid cropping the rim of the plate. The relationship between the food and its container provides context, even though plate size still varies.</p>`],
      ['Use even light and avoid strong filters', `<p>Natural window light or a bright room usually makes ingredients easier to distinguish. Strong shadows can merge foods together, while a warm color filter can change how sauces and cooked ingredients appear.</p><p>Wipe the camera lens, hold the phone still and check that the image is in focus. You do not need studio lighting; the goal is a readable record of the meal.</p>`],
      ['Give the photo some scale', table('Helpful and less-helpful scale clues', ['Scale clue', 'How it helps', 'Limitation'], [
        ['Visible plate or bowl', 'Shows how much of the container is filled', 'Container sizes differ'],
        ['Known package or label', 'Can show a declared serving size', 'The served amount may differ'],
        ['Second angle', 'Shows depth or stacked food', 'Still not a measurement'],
        ['Measured ingredient note', 'Adds information the photo cannot infer', 'Requires manual input'],
      ]) + `<p>If accuracy matters for a particular meal, a measured ingredient or package label is stronger evidence than a visual comparison. Use the photo for convenience and the known quantity to correct the record.</p>`],
      ['Record what the camera cannot see', `<p>Cooking oil, dressing, butter, sugar and ingredients inside a mixed dish may be partly or completely hidden. Write them down while the meal is fresh in your memory. For a homemade recipe, keep the batch ingredients and number of portions together.</p><p>Do not use a food photo to determine whether a meal is safe for an allergy. An image cannot reliably reveal cross-contact or every ingredient.</p>`],
      ['Review the NutriLens result before saving it', `<p>After scanning, check the food names, portion assumptions and any ingredients you know are missing. Treat calories and macros as estimates, not laboratory measurements. Save the scan only after the description makes sense for the meal you photographed.</p><p>Repeating the same photo setup for familiar meals makes your history easier to compare. NutriLens can keep those scans together so you can revisit the image and its estimate later.</p>`],
    ],
    sources: ['portions'],
    faq: [['What angle is best for a food photo?', 'Use the angle that shows both the full meal and its depth. A 45-degree view works for many plates; top-down can work for flat meals, and a second side view can clarify a bowl.'], ['Can a clearer photo make a calorie estimate exact?', 'No. Lighting and framing reduce visual ambiguity, but hidden ingredients, recipes and portion assumptions can still change the result.']],
  },
  {
    topic: 'nutrition', slug: 'ai-calorie-scanner-vs-food-diary', published: '2026-09-22',
    title: 'AI Calorie Scanner vs Food Diary: Which Should You Use?',
    description: 'Compare a photo-based AI calorie scanner with manual food logging by speed, portion detail, recipe accuracy and the kind of record each method creates.',
    intro: 'Photo scanning and manual food logging solve different parts of the same problem. One starts quickly from an image; the other can capture known quantities and recipe details that a camera cannot see.',
    takeaway: 'Use photo scanning for a quick visual record, manual entries for known quantities, and a combined approach when hidden ingredients or portions matter.',
    sections: [
      ['Compare what each method starts with', table('Photo scan and manual diary comparison', ['Question', 'AI photo scan', 'Manual food diary'], [
        ['What do you provide?', 'A meal image and corrections', 'Food names, quantities and labels'],
        ['Fastest use case', 'A visible everyday meal', 'A packaged or measured item'],
        ['Main uncertainty', 'Identification and portion size', 'Entry choice and quantity entered'],
        ['Useful record', 'The original meal photo', 'Structured ingredient details'],
      ]) + `<p>Neither method guarantees an exact result. A database entry may not match your recipe, while an image may miss oil, filling or serving depth.</p>`],
      ['Use a photo scan when speed matters', `<p>A photo can be the lowest-friction way to record a meal before eating. It preserves what the plate looked like and gives you a starting estimate without searching for every visible item.</p><p>This is especially useful when the purpose is consistency: capturing lunches, reviewing meal patterns or remembering what you ate. Review the identified foods rather than accepting the first result automatically.</p>`],
      ['Use manual details when you know more than the camera', `<p>For a packaged snack, the nutrition label and amount eaten can be more useful than its appearance. For a homemade meal, ingredient weights, cooking oil and the number of portions provide information a photo cannot recover.</p><p>Manual logging still depends on correct entries. Check whether a database value describes cooked or uncooked food and whether the stated serving matches the amount used.</p>`],
      ['Combine the two methods for mixed meals', `<p>Start with a photo to capture the plate, then correct the estimate using what you know. Add the dressing, note the recipe portion or replace a misidentified item. The photograph remains useful context while the manual details reduce obvious gaps.</p><p>Restaurant meals may require a wider uncertainty range because recipes and added fats are unknown. If the restaurant publishes nutrition information for the exact item, keep that source with the photo instead of rebuilding the meal from appearance alone.</p><p>You do not need the same method for every meal. Use the amount of detail that supports your purpose without making the routine impossible to maintain.</p>`],
      ['Choose a repeatable NutriLens workflow', `<ol><li>Photograph the complete meal.</li><li>Review the detected foods and estimated portions.</li><li>Add or correct hidden ingredients you know about.</li><li>Save the scan with enough context to understand it later.</li></ol><p>NutriLens is designed around that photo-first workflow and can compare saved meals. Estimates are informational and should not be used for allergy safety or as individualized medical nutrition advice.</p>`],
    ],
    sources: ['portions','energy'],
    faq: [['Is an AI calorie scanner more accurate than manual logging?', 'It depends on the information available. A photo can be convenient, while measured ingredients and labels can provide stronger quantity details. Both methods require review.'], ['Can I use both methods?', 'Yes. A photo can preserve the meal visually, and manual corrections can add quantities or hidden ingredients the camera cannot see.']],
  },
  {
    topic: 'nutrition', slug: 'estimate-portion-size-from-food-photo', published: '2026-09-22',
    title: 'How to Estimate Portion Size From a Food Photo',
    description: 'Learn what a meal photo can reveal about portion size, what remains uncertain, and how to add plate, label and recipe context before using an estimate.',
    intro: 'A food photo shows shape and relative space, but it does not automatically provide weight or volume. A useful estimate combines the image with a few facts you already know.',
    takeaway: 'Use the container, visible count and known package or recipe amount as context. Record uncertainty instead of treating visual volume as a measured weight.',
    sections: [
      ['Separate countable items from mixed foods', `<p>Countable items such as slices, eggs or pieces can be described directly when each item is visible. Rice, pasta, soup and mixed dishes are harder because depth and density are not obvious from one angle.</p><p>Start by naming what can be observed without guessing. Then identify which part needs a quantity assumption.</p>`],
      ['Use the plate as context, not a ruler', `<p>A visible plate or bowl helps show how the meal is arranged, but dinnerware is not a standard unit. “Half a bowl” means little unless you know the bowl’s capacity. Perspective can also make the nearest food look larger.</p><p>If you eat from the same container often, measure its capacity once and save that note. You can then describe a future serving as an approximate fraction of a known container.</p>`],
      ['Add a second angle for depth', `<p>A top-down photo shows area well but can hide height. A 45-degree or side photo can reveal whether a portion is a thin layer or a deep mound. Keep the full container visible in both images.</p><p>Take both photos before moving or eating the food so they describe the same serving. If you add a sauce or second portion later, record that change separately.</p><p>The second angle reduces one source of ambiguity; it still does not identify exact grams. Use a scale or measured utensil when a measured amount is important.</p>`],
      ['Prefer known quantities when available', table('Evidence to use before visual guessing', ['Available information', 'Better entry'], [
        ['Package says 200 g and half remains', 'Approximately 100 g used'],
        ['Recipe makes four equal portions', 'One quarter of total recipe'],
        ['Two visible slices with label per slice', 'Two labeled servings'],
        ['Unknown restaurant mixed dish', 'Photo estimate with uncertainty note'],
      ]) + `<p>Labels and recipes can still contain rounding or serving assumptions, but they provide a clearer basis than appearance alone.</p>`],
      ['Correct the estimate in NutriLens', `<p>Scan the meal, then compare the proposed portion with your known context. If you served one quarter of a recipe or used two labeled items, use that information during review. Keep hidden sauces and oils in mind.</p><p>Over time, saved photos of familiar meals can help you use a consistent convention. They do not turn the earlier estimate into an exact measurement, so keep the language honest when comparing results.</p>`],
    ],
    sources: ['portions'],
    faq: [['Can a photo tell me the exact grams of food?', 'No. A photo can support a visual estimate, but exact weight requires a measurement or reliable quantity information.'], ['What should I include for scale?', 'Keep the full plate or bowl visible and add known information such as package size, recipe yield or measured utensil volume when available.']],
  },
];
