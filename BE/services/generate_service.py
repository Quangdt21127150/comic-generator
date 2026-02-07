from schemas.generate import GenerateRequest
from deep_translator import GoogleTranslator

DESCRIPTION_MAPPING = {
    "tranh-dong-ho": "Dong Ho folk painting style, traditional Vietnamese woodblock print with bold flat colors, simple expressive lines, optimistic and symbolic rural scenes, bright earthy tones like red, pink, yellow, green, balanced symmetrical composition, no shading or gradients, folkloric naive charm, good luck motifs, hand-carved woodcut aesthetic, vibrant yet harmonious Vietnamese village life atmosphere.",
    "manga": "manga style, Japanese black-and-white comic art with dynamic panel-like composition, sharp clean linework, large expressive eyes, dramatic speed lines and motion effects, detailed hair and clothing folds, strong contrast shading with cross-hatching and screentones, emotional close-ups, cinematic angles, intense action or heartfelt character moments typical of shonen or shojo manga, high-energy and storytelling flow.",
    "pixel": "pixel art style, retro 16-bit video game graphics with visible blocky pixels, limited color palette, dithering for shading, low-resolution charming aesthetic like classic SNES or Game Boy Advance era, clean sprite-like characters, isometric or top-down view, nostalgic chiptune vibe, simple yet evocative details, no anti-aliasing, vibrant yet constrained colors evoking 1990s RPG or platformer games.",
}


def translate_text(text: str, dest: str = "en") -> str:
    if not text.strip():
        return text
    try:
        translator = GoogleTranslator(source="auto", target=dest)
        translated = translator.translate(text)
        if translated and translated.strip() != text.strip():
            return translated
        else:
            return text
    except Exception as e:
        print(f"Lỗi dịch với deep-translator: {e}")
        return text


def transform_prompts(request: GenerateRequest) -> list[str]:
    translated_text = translate_text(request.text)

    description = (
        f"Illustrate the entire story in {DESCRIPTION_MAPPING.get(request.style, '')}"
    )

    prompts = [f"{translated_text}\n{description}"]
    paragraphs = [p.strip() for p in translated_text.split("\n")]

    if not paragraphs:
        return prompts

    total_paragraphs = len(paragraphs)
    total_prompts = min(total_paragraphs, 10)

    base = total_paragraphs // total_prompts
    extra = total_paragraphs % total_prompts

    prompts = []
    start = 0

    for i in range(total_prompts):
        num_para_this_part = base + (1 if i < extra else 0)
        end = start + num_para_this_part
        part_paras = paragraphs[start:end]
        part_text = "\n".join(part_paras)
        prompts.append(f"{part_text}\n{description}")
        start = end

    return prompts


def generate_images(request: GenerateRequest) -> dict:
    prompts = transform_prompts(request)
    return {
        "prompts": prompts,
    }
