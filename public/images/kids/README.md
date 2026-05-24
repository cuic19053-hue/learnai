# Milo assets

Drop the cheerful tiger mascot images for the Little Learner surface
in this folder. The kids tree references them as:

| File                         | Used by                                       | Source                                                            |
| ---------------------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| `milo.png`                   | KidsHome greeting, reward overlay             | https://chatgpt.com/s/m_6a1336923dac8191a8a9d8f49fad1064 (export) |
| `milo-cheer.png` (optional)  | Reward screen on level-up / achievement       | same source, "with confetti" variant                              |
| `milo-wave.png`  (optional)  | Onboarding intro / Hi Lina greeting           | same source                                                       |

## How to add the image

1. Open the ChatGPT shared conversation in a browser
   (the page can't be scraped programmatically — it requires auth +
   client-side hydration).
2. Right-click the rendered tiger → **Save image as** →
   `public/images/kids/milo.png`.
3. (Optional) export the confetti and waving variants alongside as
   `milo-cheer.png` / `milo-wave.png`.

The build will pick them up automatically; the code already references
`/images/kids/milo.png` once we wire it in. Until the file is present
the kids screens fall back to the 🐯 emoji used today.
