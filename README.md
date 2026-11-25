# XyxWord

Ekonomiczna gra strategiczna w czasie rzeczywistym (w stylu Economy World).
Zaczynasz od farmy albo kopalni, budujesz łańcuchy produkcji aż do fabryk komputerów i samochodów,
wozisz surowce statkami między kontynentami i walczysz w sezonowym rankingu z firmami AI.

## Pobierz (Android)
Najnowszy APK: **Releases → najnowsza wersja → `xyxword-X.Y.Z.apk`**
https://github.com/matixpompayt/xyxword/releases/latest

Gra sama sprawdza GitHub przy starcie i pokazuje pasek „Nowa wersja” → *Pobierz*.
Nowy APK instaluje się na starym (ten sam podpis), zapis gry zostaje.

## Jak działa wydawanie wersji
Każdy push do `main` → GitHub Actions buduje APK (Capacitor) → tworzy Release `v1.0.<numer_buildu>`.

## Struktura
- `www/` – cała gra (HTML/CSS/JS), ten sam kod pójdzie później na przeglądarkę
- `capacitor.config.json` – konfiguracja aplikacji Android
- `.github/workflows/android.yml` – automatyczny build APK + release
- Podpis APK – sekrety repo `KEYSTORE_BASE64` i `KEYSTORE_PASSWORD` (Settings → Secrets and variables → Actions). Bez nich build używa tymczasowego klucza. (hasło domyślne w workflow; można nadpisać sekretem `KEYSTORE_PASSWORD`)

## Lokalnie
Otwórz `www/index.html` w przeglądarce – gra działa bez instalacji.
