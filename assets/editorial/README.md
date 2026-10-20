# Editorial topic photographs

Created on 2026-10-20 with the built-in image generation tool (not the API/CLI fallback). These are AI-generated illustrative scenes, not documentary photographs, app screenshots, customer records or evidence of a health/financial outcome. Each corresponding article shows this disclosure in English or German. Topic photographs may be shared by related articles; they are not represented as unique product demonstrations.

Committed masters: `nutrition.jpg`, `savings.jpg`, `quitting.jpg`, `training.jpg`, `habits.jpg`, `math.jpg`, `development.jpg` (1200×675). Each has `-480.webp`, `-800.webp` and `-1200.webp` responsive variants. Selection, alt text and visible captions live in `content/editorial-media.mjs`; article-specific diagrams take priority. Real public app screenshots remain separate and unedited.

Rebuild WebP variants from the committed JPEG masters with development-only `sharp` available via NODE_PATH: `node scripts/build-editorial-photos.cjs`. No image library is shipped to readers. The optional first-import environment variable accepts a private directory containing one selected original PNG per topic; it refuses to overwrite an existing master. That input directory and original generation outputs are not embedded in the site.

## Final generation prompt set

### nutrition

```text
Use case: photorealistic-natural
Asset type: wide 16:9 editorial photograph for an existing educational blog article, part of a coherent seven-topic photo set.
Primary request: Overhead editorial food photograph on a real home kitchen worktop: a ceramic plate with rice, colorful roasted vegetables and beans, a small bowl of dressing, a kitchen spoon and a few loose ingredients. Natural portions and imperfect everyday texture; no person or phone.
Editorial purpose: making a meal record, with components visibly separate.
Style: photorealistic, tactile honest editorial photography, restrained detail, natural imperfections and warm neutral tones matching a dark charcoal educational website. Clear subject silhouette and balanced edge spacing; no copy overlay needed.
Constraints: landscape 16:9. No text, numbers, typography, logos, watermark, branded products, visible app UI, simulated app screen, chart, collage, customer testimonial or medical/financial claims. All paper is blank. No money growth arrows, no promises or before-and-after comparison. This will be visibly identified as an AI-generated editorial illustration.
```

### savings

```text
Use case: photorealistic-natural
Asset type: wide 16:9 editorial photograph for an existing educational blog article, part of a coherent seven-topic photo set.
Primary request: Close overhead editorial still life of a modest household planning desk: three empty kraft envelopes, a small loose group of generic unmarked metal coins, a pencil and a blank notebook. Warm daylight; quiet uncluttered real paper grain.
Editorial purpose: separate goals and deliberate household saving, not wealth or promised returns.
Style: photorealistic, tactile honest editorial photography, restrained detail, natural imperfections and warm neutral tones matching a dark charcoal educational website. Clear subject silhouette and balanced edge spacing; no copy overlay needed.
Constraints: landscape 16:9. No text, numbers, typography, logos, watermark, branded products, visible app UI, simulated app screen, chart, collage, customer testimonial or medical/financial claims. All paper is blank. No money growth arrows, no promises or before-and-after comparison. This will be visibly identified as an AI-generated editorial illustration.
```

### quitting

```text
Use case: photorealistic-natural
Asset type: wide 16:9 editorial photograph for an existing educational blog article, part of a coherent seven-topic photo set.
Primary request: Candid editorial still life by an open window: a clear glass of water, a pair of walking shoes and a folded blank pocket notebook, gentle morning light. Calm lived-in setting, no people, no smoke, no cigarette or tobacco packaging.
Editorial purpose: preparing an everyday break and a personal support plan, not a medical outcome.
Style: photorealistic, tactile honest editorial photography, restrained detail, natural imperfections and warm neutral tones matching a dark charcoal educational website. Clear subject silhouette and balanced edge spacing; no copy overlay needed.
Constraints: landscape 16:9. No text, numbers, typography, logos, watermark, branded products, visible app UI, simulated app screen, chart, collage, customer testimonial or medical/financial claims. All paper is blank. No money growth arrows, no promises or before-and-after comparison. This will be visibly identified as an AI-generated editorial illustration.
```

### training

```text
Use case: photorealistic-natural
Asset type: wide 16:9 editorial photograph for an existing educational blog article, part of a coherent seven-topic photo set.
Primary request: Low close editorial photograph of two plain matte dumbbells resting on a dark gym mat, a folded towel and a blank small paper training notebook nearby. Real scuffs and rubber texture, soft gym side lighting, empty gym corner, no people.
Editorial purpose: recording a gym session, not a body transformation.
Style: photorealistic, tactile honest editorial photography, restrained detail, natural imperfections and warm neutral tones matching a dark charcoal educational website. Clear subject silhouette and balanced edge spacing; no copy overlay needed.
Constraints: landscape 16:9. No text, numbers, typography, logos, watermark, branded products, visible app UI, simulated app screen, chart, collage, customer testimonial or medical/financial claims. All paper is blank. No money growth arrows, no promises or before-and-after comparison. This will be visibly identified as an AI-generated editorial illustration.
```

### habits

```text
Use case: photorealistic-natural
Asset type: wide 16:9 editorial photograph for an existing educational blog article, part of a coherent seven-topic photo set.
Primary request: Angled editorial photograph of a quiet home workspace in morning sunlight: an open blank notebook, simple pencil, ceramic mug and a small green plant, with gentle shadows across a textured wooden table. Inviting believable everyday scene, no people.
Editorial purpose: a small repeatable daily routine, not an app screenshot.
Style: photorealistic, tactile honest editorial photography, restrained detail, natural imperfections and warm neutral tones matching a dark charcoal educational website. Clear subject silhouette and balanced edge spacing; no copy overlay needed.
Constraints: landscape 16:9. No text, numbers, typography, logos, watermark, branded products, visible app UI, simulated app screen, chart, collage, customer testimonial or medical/financial claims. All paper is blank. No money growth arrows, no promises or before-and-after comparison. This will be visibly identified as an AI-generated editorial illustration.
```

### math

```text
Use case: photorealistic-natural
Asset type: wide 16:9 editorial photograph for an existing educational blog article, part of a coherent seven-topic photo set.
Primary request: Top-down editorial photograph of a tactile puzzle workspace: a few simple wooden geometric squares and triangles arranged loosely on graph paper, a pencil and an eraser. Muted warm paper and natural wood, directional daylight, no letters or numbers.
Editorial purpose: thinking through a number or shape puzzle, not a depicted app level.
Style: photorealistic, tactile honest editorial photography, restrained detail, natural imperfections and warm neutral tones matching a dark charcoal educational website. Clear subject silhouette and balanced edge spacing; no copy overlay needed.
Constraints: landscape 16:9. No text, numbers, typography, logos, watermark, branded products, visible app UI, simulated app screen, chart, collage, customer testimonial or medical/financial claims. All paper is blank. No money growth arrows, no promises or before-and-after comparison. This will be visibly identified as an AI-generated editorial illustration.
```

### development

```text
Use case: photorealistic-natural
Asset type: wide 16:9 editorial photograph for an existing educational blog article, part of a coherent seven-topic photo set.
Primary request: Oblique editorial photograph of a clean independent software developer workbench: closed unbranded silver laptop, a phone with fully dark unlit screen, pencil and a few blank index cards. Natural desk material and soft window light, no people.
Editorial purpose: planning and checking a mobile project, not a fabricated software interface.
Style: photorealistic, tactile honest editorial photography, restrained detail, natural imperfections and warm neutral tones matching a dark charcoal educational website. Clear subject silhouette and balanced edge spacing; no copy overlay needed.
Constraints: landscape 16:9. No text, numbers, typography, logos, watermark, branded products, visible app UI, simulated app screen, chart, collage, customer testimonial or medical/financial claims. All paper is blank. No money growth arrows, no promises or before-and-after comparison. This will be visibly identified as an AI-generated editorial illustration.
```
