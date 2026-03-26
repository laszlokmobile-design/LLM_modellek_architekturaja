# Nagy Nyelvi Modell Csevegő Alkalmazás - Projektmunka
**Készítette:** Kovács László
**Kurzus:** LLM és GPT modellek architektúrája, működése és alkalmazása a szoftverfejlesztésben

## 1. Projekt célkitűzése
A projekt célja egy olyan webes chatalkalmazás létrehozása, amely közvetlen API kapcsolatot létesít nagy nyelvi modellekkel (a feladatban Google Gemini). Az alkalmazás támogatja a modern AI-interakciók alapkövetelményeit, mint a streaming válaszadás és a kontextusfüggő beszélgetés. 

## 2. Alkalmazott technológiák
* **Frontend:** React.js (dinamikus paraméterállítás és streaming megjelenítés).
* **Backend:** Python FastAPI / Node.js (aszinkron API hívások kezelése).
* **Adatbázis:** SQLite (beszélgetések és tokenhasználat perzisztens tárolása).
* **LLM API:** Google Gemini API.

## 3. Rendszerarchitektúra és Működés
Az alkalmazás moduláris felépítésű, az alábbi rétegekre tagolva:
1.  **Kliens oldali réteg:** Kezeli a felhasználói beviteleket, a fájlcsatolást (PDF/Kép) és a hiperparaméterek (Temperature, Top-P) beállítását.
2.  **Szerver oldali réteg:** Aszinkron módon továbbítja a kéréseket az LLM felé, kezeli a korábbi üzenetek előzményeit (kontextus), és méri a tokenfelhasználást.
3.  **LLM réteg:** A modellek feldolgozzák a promptokat, figyelembe véve a részletes System Promptokat és a moderációs szabályokat.
4.  **Adatbázis réteg réteg:** SQLite alapú tárolás a beszélgetésekhez, üzenetekhez és statisztikákhoz.
   - > Beszélgetések: Tárolja a beszélgetések egyedi azonosítóját, címét és a létrehozás dátumát.
   - > Üzenetek: Itt kerülnek mentésre a felhasználói promptok és az LLM válaszok, biztosítva a kontextuskezelést (a korábbi üzenetek visszatöltését az LLM számára).
   - > Tokenhasználat: Minden API hívás után elmentjük a prompt_tokens, completion_tokens és total_tokens értékeket az adott beszélgetéshez rendelve.
5.  **Komponensek elkülönítése:** A különböző modulok külön fájlokba, osztályokba, könyvtárakba vannak szervezve.

## 4. Adatmodell és Tervezés
* **Beszélgetések:** Tárolja a beszélgetések egyedi azonosítóját, címét és dátumát.
* **Üzenetek:** Mentésre kerülnek a felhasználói promptok és az LLM válaszok a kontextuskezeléshez.
* **Token mérés:** Minden hívás után mentjük a `prompt_tokens` és `completion_tokens` értékeket.

## 5. Megvalósított funkciók (Pontozási lista)
* [ ] Üzenetküldés és fogadás: Alapfeltétel a kommunikációhoz.
* [ ] Aszinkron hívások: A háttérfolyamatok nem blokkolják az alkalmazást.
* [ ] Streaming válaszgenerálás: A szöveg folyamatosan, gépelés-szerűen jelenik meg.
* [ ] Kontextuskezelés: A modell rálát az előző üzenetekre és válaszokra.
* [ ] Dinamikus hiperparaméterek: Temperature, Top-P és egyéb értékek állíthatósága a UI-on.
* [ ] Tokenhasználat naplózása: Minden hívás után mentésre kerül az elhasznált mennyiség.
* [ ] Korábbi beszélgetések kezelése: Mentés, betöltés és megnyitás funkciók.
* [ ] Multimodális bevitel: Kép vagy PDF fájl csatolásának lehetősége.
* [ ] Biztonság (Moderáció): Prompt injection elleni védelem LLM segítséggel.
* [ ] Minőségellenőrzés (Önjavítás): Válaszok relevanciájának gépi ellenőrzése.
