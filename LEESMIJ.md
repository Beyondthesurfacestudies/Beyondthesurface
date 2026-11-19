# Beyond the Surface – handleiding

Een website voor Engelstalige Bijbelstudies. Elke studie is één tekstbestand (Markdown) in de map `src/studies/`. De site wordt automatisch opnieuw opgebouwd zodra je een bestand toevoegt.

## 1. De site online zetten (eenmalig, gratis)

**Optie A – Netlify (makkelijkst, adres: beyondthesurface.netlify.app)**
1. Maak een gratis account op github.com en maak een nieuwe repository `beyondthesurface`.
2. Klik *Add file → Upload files* en sleep de inhoud van deze map erin (niet de map `node_modules` of `_site`). Klik *Commit changes*.
3. Maak een gratis account op netlify.com → *Add new site → Import an existing project → GitHub* → kies je repository. De instellingen worden automatisch herkend; klik *Deploy*.
4. Ga naar *Site configuration → Change site name* en kies `beyondthesurface`. Je site staat dan op **https://beyondthesurface.netlify.app** (als die naam nog vrij is).

**Optie B – Cloudflare Pages** (adres: beyondthesurface.pages.dev): stap 1–2 als hierboven, daarna op dash.cloudflare.com → *Workers & Pages → Create → Pages → Connect to Git*. Build command: `npm run build`, output directory: `_site`.

**Optie C – GitHub Pages** (adres: jouwgebruikersnaam.github.io/beyondthesurface): stap 1–2 als hierboven, daarna in de repository *Settings → Pages → Source: GitHub Actions*. De meegeleverde workflow doet de rest.

## 2. Een nieuwe studie publiceren

1. Ga in GitHub naar de map `src/studies/`.
2. Klik *Add file → Create new file*.
3. Noem het bestand `JJJJ-MM-DD-korte-titel.md`, bijv. `2026-12-01-the-prodigal-son.md`. (Het deel na de datum wordt het webadres.)
4. Kopieer de inhoud van `NIEUWE-STUDIE-VOORBEELD.md`, vul je eigen tekst in en klik *Commit changes*.
5. Na ongeveer een minuut staat de studie online.

Bovenaan elk bestand staan de gegevens van de studie:

| Veld | Betekenis |
|---|---|
| `title` | Titel van de studie |
| `passage` | Bijbelgedeelte, bijv. `Romans 8:1–17` |
| `date` | Publicatiedatum (bepaalt de volgorde) |
| `summary` | 1–2 zinnen voor het overzicht |
| `topics` | Onderwerpen voor de filterknoppen, bijv. `[Gospels, Prayer]` |
| `pdf` | (optioneel) bestandsnaam van een PDF die je in `src/files/` hebt geüpload |

Opmaak in de tekst: `## Kopje`, `**vet**`, `*cursief*`, `> citaat`, `1.` voor genummerde vragen.

## 3. Aanpassen

- **Over-pagina:** `src/about.md` (vul hier je eigen verhaal in).
- **Ondertitel en omschrijving:** `src/_data/site.json`.
- **Voorbeeldstudies verwijderen:** verwijder de twee bestanden in `src/studies/` die je niet wilt houden.
- **Eigen domeinnaam** (bijv. beyondthesurface.org): koop die bij een registrar en koppel hem in Netlify/Cloudflare via *Domain management*.
