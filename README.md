# Lern-Bandit

Deutsch und Mathe mit drei drehenden Walzen. Die Website läuft ohne Anmeldung, Backend oder externe Abhängigkeiten im Browser.

## Benutzen

[Website öffnen](https://shadowpaint-sp.github.io/lern-bandit/)

- **Deutsch:** 2092 Wörter mit hinterlegten Lesesilben. Buchstaben, Lautverbindungen und Silbenanzahl lassen sich auswählen. Bei zwei Silben erscheint ein Stern an einer zufälligen Stelle.
- **Mathe:** Plus, Minus und Mal mit kombinierbaren Zahlenbereichen. Das Ergebnis lässt sich aufdecken und wieder verdecken.
- **Drei Sterne:** In beiden Modi 6 % Zufallschance, spätestens beim zehnten Dreh nach dem letzten Treffer. In den Einstellungen abschaltbar.

Die Einstellungen gelten für die aktuelle Sitzung und getrennt für Deutsch und Mathe.

### Zahlenbereiche

| Bereich | Zahlen auf den Walzen |
| --- | --- |
| Zehner | 0 bis 10 |
| Hunderter | 10 bis 100 |
| Tausender | 100 bis 1000 |
| Millionen | 1000 bis 1000000 |

Die Grenzen sind inklusive. Standardmäßig bleibt das Ergebnis zwischen null und der höchsten aktivierten Obergrenze. Die Checkbox „Ergebnisse außerhalb des Zahlenbereichs erlauben“ hebt die Obergrenze für das Ergebnis auf. Minus-Ergebnisse bleiben mindestens null. Unmögliche Kombinationen werden beim Übernehmen mit einem Hinweis abgelehnt.

## Lokal arbeiten

`index.html` enthält die gesamte Website einschließlich Schrift und Wortschatz. Die Datei lässt sich direkt im Browser öffnen und offline benutzen. Es ist kein Build und kein `npm install` erforderlich.

Für eine lokale Vorschau über HTTP:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Anschließend `http://127.0.0.1:8765/` öffnen.

Die Prüfskripte benötigen Node.js ab Version 18:

```sh
npm test
```

Sie prüfen Wortauswahl, Silbenreihenfolge, Sternpositionen, Trefferregeln sowie Rechenaufgaben mit allen Kombinationen aus Zahlenbereichen und Rechenzeichen, einschließlich Grenzfällen und freigegebener Ergebnisgrenze.

## Veröffentlichung

GitHub Pages veröffentlicht den Stammordner des Branches `main`. Nach einem Push startet GitHub die Veröffentlichung automatisch. `.nojekyll` aktiviert die direkte Auslieferung der statischen Dateien.

Eine eigene Domain lässt sich später unter **Settings → Pages → Custom domain** eintragen und beim Domain-Anbieter über DNS verbinden. Aktuell ist keine eigene Domain konfiguriert.

## Quellen und Schrift

Eigenständige Umsetzung, inspiriert vom [Silben-Bandit auf grundschul.tools](https://grundschul.tools/deutsch/silben-bandit.html).

Die unverändert eingebettete Schrift **Grundschrift** stammt von Christian Urff und steht unter [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/). Die Namensnennung und der Lizenzlink sind auch auf der Website vorhanden. Diese Schriftlizenz gilt für die Schrift; sie ist keine Lizenz für den übrigen Projektcode.
