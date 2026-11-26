# XyxWord

Ekonomiczna gra strategiczna w czasie rzeczywistym (w stylu Economy World).
Zaczynasz od farmy albo kopalni, budujesz łańcuchy produkcji aż do fabryk komputerów i samochodów,
wozisz surowce statkami między kontynentami i walczysz w sezonowym rankingu z firmami AI.

## Pobierz (Android)
Najnowszy APK: **Releases → najnowsza wersja → `xyxword-0.X.apk`**
https://github.com/matixpompayt/xyxword/releases/latest

Gra sama sprawdza GitHub przy starcie i pokazuje pasek „Nowa wersja” → *Pobierz*.
Nowy APK instaluje się na starym (ten sam podpis), zapis gry zostaje.

## Jak działa wydawanie wersji
Każdy push do `main` → GitHub Actions buduje APK (Capacitor) → tworzy Release z kolejną wersją: `v0.1`, `v0.2`, `v0.3`….

## Struktura
- `www/` – cała gra (HTML/CSS/JS), ten sam kod pójdzie później na przeglądarkę
- `capacitor.config.json` – konfiguracja aplikacji Android
- `.github/workflows/android.yml` – automatyczny build APK + release
- `keystore/xyxword.jks` – stały klucz podpisu APK (dzięki niemu aktualizacje instalują się na starej wersji)

## Lokalnie
Otwórz `www/index.html` w przeglądarce – gra działa bez instalacji.

## Mapy i miejscowości
`www/maps.js` i `www/places.js` generuje `tools/build-maps.mjs` (mapy: Natural Earth, domena publiczna; miejscowości: GeoNames, CC BY 4.0).
Polecane miejsca startowe to `LOCS_BASE` w `www/game.js`. Gracz może też założyć własną miejscowość w grze (Budowa → „+ Własna”).
