# Lernbandit

Fünf Lernwerkzeuge für die Grundschule mit gemeinsamer Startseite, Logo und einer Navigation nach den Fächern Deutsch und Mathe. Die Website läuft ohne Anmeldung, Backend oder externe Abrufe.

[Website öffnen](https://shadowpaint-sp.github.io/lern-bandit/)

- **Silben-Bandit:** 2092 Wörter mit hinterlegten Lesesilben. Buchstaben, Lautverbindungen und Silbenanzahl lassen sich auswählen. Bei zwei Silben erscheint ein Stern an einer zufälligen Stelle.
- **Mathe-Bandit:** Plus, Minus und Mal mit kombinierbaren Zahlenbereichen. Das Ergebnis lässt sich aufdecken und wieder verdecken.
- **Schüttelbox:** Zahlen von 2 bis 20 zerlegen. Beide Abdeckungen fahren vor dem Schütteln zu. Nach der Boxanimation öffnet sich die neue Verteilung in Fünferreihen. Im Modus „Ergänzen“ bleibt rechts verdeckt. Optional bleibt auch die Plusaufgabe bis zum Aufdecken verborgen und wird beim nächsten Schütteln wieder verdeckt. Die Leertaste schüttelt ebenfalls.

- **Silbenfarben:** Eigene Texte schreiben und nach jedem Buchstaben jede zweite Silbe einfärben, auch im gerade geschriebenen Wort. Rot ist die Standard-Markierungsfarbe. Schriftgröße, Markierungsfarbe und Silbenbögen sind einstellbar. Die Eingabe nutzt ein natives Textfeld; Textauswahl und Rückgängig bleiben erhalten.

- **Buchstabengeburtstag:** Im Deutsch-Menü Buchstaben auf einen Kalendertag ziehen oder erst den Buchstaben und dann den Tag anklicken. Namen einzeln im einzeiligen Eingabefeld eintragen und mit Enter oder „Name hinzufügen“ übernehmen. Das Feld wird danach geleert und bleibt für den nächsten Namen bereit. Sobald alle unterschiedlichen Buchstaben eines Namens einen Einführungstermin haben, erscheint der Name am spätesten dieser Termine. Bereits geplante Buchstaben lassen sich verschieben, durch Ablegen außerhalb des Kalenders oder über „Aus Planung nehmen“ entfernen. Geburtstage passen sich dabei automatisch an. Die Datumsanzeige beim Namen führt direkt zum passenden Kalendermonat.

Der Buchstabengeburtstag-Planer speichert Namen und Termine automatisch im `localStorage` dieses Browsers unter `lernbandit.buchstabengeburtstag.v1`. Groß- und Kleinschreibung sowie wiederholte Buchstaben ändern die Berechnung nicht. Ä, Ö, Ü und ß zählen einzeln, andere Akzente als Grundbuchstabe. Nicht verfügbare Buchstaben bleiben beim Namen als offen sichtbar. Die Einstellungen bieten „Daten löschen“ mit anschließender Bestätigung für alle Planerdaten. Andere Werkzeuge bleiben davon unberührt. Offene Planer-Tabs übernehmen Änderungen und Löschungen. Bei blockierter Speicherung erscheint ein Hinweis, der Planer bleibt für den aktuellen Seitenaufruf nutzbar. Die Speicherung gilt für den jeweiligen Browser und die aufgerufene Website beziehungsweise lokale Datei. Sie wird nicht zwischen Geräten oder verschiedenen Website-Adressen übertragen.

In den beiden Banditen können Drei-Sterne-Treffer zufällig mit 6 % Chance auftreten, spätestens beim zehnten Dreh nach dem letzten Treffer. In den Einstellungen abschaltbar. Die Einstellungen gelten für den jeweiligen Seitenaufruf.

## Seiten und Dateien

| Datei | Aufgabe |
| --- | --- |
| `index.html` | Startseite mit vier Spielvorschauen und einem Link zum Planer |
| `bandit.html?fach=deutsch` | Silben-Bandit |
| `bandit.html?fach=mathe` | Mathe-Bandit |
| `schuettelbox.html` | Schüttelbox, Startmenge optional über `?n=7` |
| `silbenfarben.html` | Eigene Texte mit farbig markierten Silben |
| `buchstabengeburtstag.html` | Buchstaben im Kalender planen und Buchstabengeburtstage anzeigen |
| `assets/site.css` / `assets/site.js` | Gemeinsame Gestaltung, Logo und Fach-Untermenüs |
| `assets/bandit.css` / `assets/bandit.js` | Gemeinsame Engine der beiden Banditen |
| `assets/schuettelbox.css` / `assets/schuettelbox.js` | Abdeckungen, Mengen und Boxanimation |
| `assets/words.js` | Gemeinsamer Wortschatz mit 2092 festgelegten Lesesilben-Zerlegungen |
| `assets/syllables.js` / `assets/vendor/de-syllable.js` | Silbentrennung mit eingebettetem WebAssembly-Modul |
| `assets/silbenfarben.css` / `assets/silbenfarben.js` | Schreibfläche und Einstellungen |
| `assets/buchstabengeburtstag.css` / `assets/buchstabengeburtstag.js` | Kalender, Namensliste, lokale Speicherung und Löschen |
| `assets/buchstabengeburtstag-model.js` | Namensnormalisierung, Geburtstagsberechnung und Prüfung gespeicherter Daten |

Alle Seiten und der Ordner `assets/` gehören zusammen. Nach dem Herunterladen lassen sich die HTML-Dateien direkt öffnen und offline benutzen. Die Schrift ist in der gemeinsamen CSS-Datei eingebettet. Die Website benötigt keinen Build.

Für eine lokale Vorschau über HTTP:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Anschließend `http://127.0.0.1:8765/` öffnen.

## Prüfen

Die Tests der Wortauswahl, der Rechenaufgaben, der Silbentrennung und der Buchstabengeburtstage benötigen Node.js ab Version 18 und keine Installation:

```sh
npm test
```

Sie prüfen Silbenreihenfolge, Sternpositionen, Trefferregeln sowie Rechenaufgaben mit allen Kombinationen aus Zahlenbereichen und Rechenzeichen, einschließlich Grenzfällen und freigegebener Ergebnisgrenze. Der Silbentest prüft außerdem alle 2092 gemeinsamen Wortzerlegungen, unbekannte Wörter, Groß-/Kleinschreibung und kombinierte Umlautzeichen.

Die Planertests prüfen die Berechnung bei wiederholten und fehlenden Buchstaben, verschobene Termine über Jahresgrenzen, Umlaute, Akzente, ungültige Kalenderdaten und beschädigte Speicherdaten.

Für die Browsertests mit Playwright, Node.js ab Version 20 und Python 3:

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

Diese prüfen Navigation und Direktlinks, Einstellungen, Lesen und Rechnen, Lösungsanzeige, das Schließen der Abdeckungen vor der Boxanimation und die Darstellung auf einem schmalen Handy. Für Silbenfarben werden sofortige Markierung, Cursor, Rückgängig, Einfügen von Text, Einstellungen, Scrollen und der direkte Offline-Aufruf als lokale Datei geprüft.

Für den Planer werden Ziehen und Verschieben, Klick- und Tastaturbedienung, automatische Geburtstage, Monatswechsel, Speicherung beim Neuladen, Löschen mit Bestätigung, Synchronisierung offener Tabs, Speicherfehler, sichere Namensdarstellung und die lokale Offline-Nutzung geprüft.

## Zahlenbereiche beim Mathe-Bandit

| Bereich | Zahlen auf den Walzen |
| --- | --- |
| Zehner | 0 bis 10 |
| Zwanziger | 0 bis 20 |
| Hunderter | 10 bis 100 |
| Tausender | 100 bis 1000 |
| Millionen | 1000 bis 1000000 |

Die Grenzen sind inklusive. Standardmäßig bleibt das Ergebnis zwischen null und der höchsten aktivierten Obergrenze. Die Checkbox „Ergebnisse außerhalb des Zahlenbereichs erlauben“ hebt die Obergrenze für das Ergebnis auf. Minus-Ergebnisse bleiben mindestens null. Unmögliche Kombinationen werden beim Übernehmen mit einem Hinweis abgelehnt.

## Veröffentlichung

GitHub Pages veröffentlicht den Stammordner des Branches `main`. Die HTML-Dateien und `assets/` werden direkt ausgeliefert. Ein Push auf `main` veröffentlicht die Änderungen; ein Build-Workflow ist nicht nötig.

## Quellen und Schrift

Eigenständige Umsetzung, inspiriert vom [Silben-Bandit auf grundschul.tools](https://grundschul.tools/deutsch/silben-bandit.html).

Die unverändert eingebettete Schrift **Grundschrift** stammt von Christian Urff und steht unter [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/). Die Namensnennung und der Lizenzlink sind auch auf der Website vorhanden. Diese Schriftlizenz gilt für die Schrift; sie ist keine Lizenz für den übrigen Projektcode.


### Automatische Silbentrennung

Silbenfarben bevorzugt die Lesesilben aus `assets/words.js`. Für unbekannte Wörter nutzt es das Muster `de-x-syllable` aus Hyphenopoly 6.1.0. Die unveränderte Wasm-Datei ist als Base64 in `assets/vendor/de-syllable.js` eingebettet, damit auch beim direkten Öffnen lokaler Dateien kein `fetch` erforderlich ist. Das Modul nimmt Wörter mit bis zu 61 UTF-16-Einheiten entgegen. Längere oder nicht unterstützte Wörter bleiben unverändert.

Automatische Muster sind keine Garantie für pädagogisch korrekte Lesesilben. Bekannte Abweichungen bei den vorhandenen Wörtern können im gemeinsamen Wortschatz korrigiert werden. Der Silben-Bandit verwendet Wörter mit zwei oder drei Silben; weitere Ausnahmen für längere Wörter müssten gesondert hinterlegt werden. Texte werden nicht gespeichert oder an einen Dienst gesendet.

Hyphenopoly und die deutschen Silbenmuster stammen von Mathias Nater. Die MIT-Lizenz und die Copyright-Hinweise stehen in `assets/vendor/HYPHENOPOLY-LICENSE.txt`. Es ist keine npm-Laufzeitabhängigkeit nötig.
