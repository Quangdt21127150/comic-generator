import os
from dotenv import load_dotenv
from schemas.generate import GenerateRequest
from deep_translator import GoogleTranslator
import requests
import traceback
from openai import OpenAI

DESCRIPTION_MAPPING = {
    "dong-ho": "Dong Ho folk painting style, traditional Vietnamese woodblock print with bold flat colors, simple expressive lines, optimistic and symbolic rural scenes, bright earthy tones like red, pink, yellow, green, balanced symmetrical composition, no shading or gradients, folkloric naive charm, good luck motifs, hand-carved woodcut aesthetic, vibrant yet harmonious Vietnamese village life atmosphere.",
    "manga": "manga style, Japanese color comic art with dynamic panel-like composition, sharp clean linework, large expressive eyes, dramatic speed lines and motion effects, detailed hair and clothing folds, strong contrast shading with cross-hatching and screentones, emotional close-ups, cinematic angles, intense action or heartfelt character moments typical of shonen or shojo manga, high-energy and storytelling flow.",
    "pixel": "pixel art style, retro 16-bit video game graphics with visible blocky pixels, limited color palette, dithering for shading, low-resolution charming aesthetic like classic SNES or Game Boy Advance era, clean sprite-like characters, isometric or top-down view, nostalgic chiptune vibe, simple yet evocative details, no anti-aliasing, vibrant yet constrained colors evoking 1990s RPG or platformer games.",
}

KAGGLE_API_URL = "https://vaned-shena-regimentally.ngrok-free.dev/images"

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not set")

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)


def translate_text(text: str, dest: str = "en") -> str:
    if not text.strip():
        return text
    try:
        translator = GoogleTranslator(source="auto", target=dest)
        translated = translator.translate(text)
        if translated and translated.strip() != text.strip():
            return translated
        return text
    except Exception:
        return text


def transform_prompts(request: GenerateRequest) -> list[str]:
    translated_text = translate_text(request.text)
    description = (
        f"Illustrate the entire story in {DESCRIPTION_MAPPING.get(request.style, '')}"
    )

    user_prompt = f"""
The storyline is: {translated_text}

Generate exactly 3 paragraphs which are high-quality prompts for Omnigen 2.

In each prompt:
- Describe the full layout as a 2 rows and 3 columns grid with clear panel divisions (thin borders or natural spacing).
- Detail the content of all exactly 6 panels sequentially: left-to-right, top-to-bottom (top-left, top-middle, top-right, bottom-left, bottom-middle, bottom-right).
- Make the storytelling flow logically from the storyline, with clear actions, emotions, backgrounds in each panel.
- Ensure consistent art across the grid.

Do NOT add anything outside the 3 prompts themselves.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that generates exactly 3 image prompts, separated by new lines.",
                },
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=1000,
        )

        content = response.choices[0].message.content.strip()
        prompts = [
            p.strip() + "\n" + description
            for p in content.split("**Prompt ")
            if p.strip()
        ]

        return prompts

    except Exception as e:
        raise RuntimeError(f"Groq API error: {str(e)}") from e


def generate_images(request: GenerateRequest) -> dict:
    try:
        prompts = transform_prompts(request)

        response = requests.post(
            KAGGLE_API_URL, json={"prompts": prompts}, timeout=1800
        )
        response.raise_for_status()
        return response.json()
        # return {"status": "success", "prompts": prompts}

    except requests.exceptions.HTTPError as e:
        return {
            "status": "error",
            "message": f"Groq or Kaggle API HTTP error: {e.response.status_code} - {e.response.text}",
        }
    except ValueError as e:
        return {"status": "error", "message": str(e)}
    except Exception as e:
        return {"status": "error", "message": str(e), "detail": traceback.format_exc()}
