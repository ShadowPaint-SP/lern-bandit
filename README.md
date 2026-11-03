# Lernbandit

Drei Lernspiele für die Grundschule mit gemeinsamer Startseite, Logo und Navigation. Die Website läuft ohne Anmeldung, Backend oder externe Laufzeit-Abhängigkeiten.

[Website öffnen](https://shadowpaint-sp.github.io/lern-bandit/)

- **Silben-Bandit:** 2092 Wörter mit hinterlegten Lesesilben. Buchstaben, Lautverbindungen und Silbenanzahl lassen sich auswählen. Bei zwei Silben erscheint ein Stern an einer zufälligen Stelle.
- **Mathe-Bandit:** Plus, Minus und Mal mit kombinierbaren Zahlenbereichen. Das Ergebnis lässt sich aufdecken und wieder verdecken.
- **Schüttelbox:** Zahlen von 2 bis 20 zerlegen. Beide Abdeckungen fahren vor dem Schütteln zu. Nach der Boxanimation öffnet sich die neue Verteilung in Fünferreihen. Im Modus „Ergänzen“ bleibt rechts verdeckt. Die Leertaste schüttelt ebenfalls.

In den beiden Banditen können Drei-Sterne-Treffer zufällig mit 6 % Chance auftreten, spätestens beim zehnten Dreh nach dem letzten Treffer. In den Einstellungen abschaltbar. Die Einstellungen gelten für den jeweiligen Seitenaufruf.

## Seiten und Dateien

| Datei | Aufgabe |
| --- | --- |
| `index.html` | Startseite mit drei Spielvorschauen |
| `bandit.html?fach=deutsch` | Silben-Bandit |
| `bandit.html?fach=mathe` | Mathe-Bandit |
| `schuettelbox.html` | Schüttelbox, Startmenge optional über `?n=7` |
| `assets/site.css` / `assets/site.js` | Gemeinsame Gestaltung, Logo und Spiele-Navigation |
| `assets/bandit.css` / `assets/bandit.js` | Gemeinsame Engine der beiden Banditen, einschließlich Wortschatz |
| `assets/schuettelbox.css` / `assets/schuettelbox.js` | Abdeckungen, Mengen und Boxanimation |

Alle Seiten und der Ordner `assets/` gehören zusammen. Nach dem Herunterladen lassen sich die HTML-Dateien direkt öffnen und offline benutzen. Die Schrift ist in der gemeinsamen CSS-Datei eingebettet. Die Website benötigt keinen Build.

Für eine lokale Vorschau über HTTP:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Anschließend `http://127.0.0.1:8765/` öffnen.

## Prüfen

Die Tests der Wortauswahl und der Rechenaufgaben benötigen Node.js ab Version 18 und keine Installation:

```sh
npm test
```

Sie prüfen Silbenreihenfolge, Sternpositionen, Trefferregeln sowie Rechenaufgaben mit allen Kombinationen aus Zahlenbereichen und Rechenzeichen, einschließlich Grenzfällen und freigegebener Ergebnisgrenze.

Für die Browsertests mit Playwright, Node.js ab Version 20 und Python 3:

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

Diese prüfen den Einstieg in alle drei Spiele, Navigation und Direktlinks, Einstellungen, Lesen und Rechnen, Lösungsanzeige, das Schließen der Abdeckungen vor der Boxanimation und die Darstellung auf einem schmalen Handy.

## Zahlenbereiche beim Mathe-Bandit

| Bereich | Zahlen auf den Walzen |
| --- | --- |
| Zehner | 0 bis 10 |
| Hunderter | 10 bis 100 |
| Tausender | 100 bis 1000 |
| Millionen | 1000 bis 1000000 |

Die Grenzen sind inklusive. Standardmäßig bleibt das Ergebnis zwischen null und der höchsten aktivierten Obergrenze. Die Checkbox „Ergebnisse außerhalb des Zahlenbereichs erlauben“ hebt die Obergrenze für das Ergebnis auf. Minus-Ergebnisse bleiben mindestens null. Unmögliche Kombinationen werden beim Übernehmen mit einem Hinweis abgelehnt.

## Veröffentlichung

GitHub Pages veröffentlicht den Stammordner des Branches `main`. Die HTML-Dateien und `assets/` werden direkt ausgeliefert. Ein Push auf `main` veröffentlicht die Änderungen; ein Build-Workflow ist nicht nötig.

## Quellen und Schrift

Eigenständige Umsetzung, inspiriert vom [Silben-Bandit auf grundschul.tools](https://grundschul.tools/deutsch/silben-bandit.html).

Die unverändert eingebettete Schrift **Grundschrift** stammt von Christian Urff und steht unter [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/). Die Namensnennung und der Lizenzlink sind auch auf der Website vorhanden. Diese Schriftlizenz gilt für die Schrift; sie ist keine Lizenz für den übrigen Projektcode.
