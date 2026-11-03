# Gemeinsamer Einstieg für Lernbandit

Die Startseite führt direkt zu den drei Spielen. Die Spielauswahl besteht aus kleinen Ansichten der echten Maschinen. Logo und zentrierte Navigation stehen auf jeder Seite zusammen in der Kopfzeile; das aktive Spiel ist markiert. Das Logo führt zur Startseite.

## Gestaltung

- Papier `#f7f4eb`, Kontur `#292b2b`, Gelb `#FEDE54`, Rot `#df4537`, Petrol `#247c79`, Innenfläche `#fffef8`.
- Grundschrift für Überschriften, Zahlen und Spielaktionen. Avenir Next mit Trebuchet-Fallback für die Bedienung.
- Zentrierte Überschrift und Spiele-Navigation. Auf dem Desktop drei Spielvorschauen nebeneinander, auf dem Handy drei Zeilen mit Vorschau links und Beschreibung rechts.
- Die Bildsprache kommt von den bestehenden Walzen und der Schüttelbox. Keine zusätzliche Illustration oder automatisch laufende Bewegung.

```text
Lernbandit.    [Silben-Bandit | Mathe-Bandit | Schüttelbox]    Hilfe / Einstellungen

                    Was spielen wir heute?

        [To | ma | te]      [7 | + | 3]       [●●● | ●●●]
         Silben-Bandit       Mathe-Bandit      Schüttelbox
         Wörter entdecken    Rechnen üben     Zahlen zerlegen
```

Der Abgleich mit dem Brief hat zusätzliche Einstiegs-Buttons, Statistiken und Erklärblöcke ausgeschlossen. Die drei Vorschauen sind selbst die Links zu den Spielen. Die Spiele nutzen echte Links; Direktaufrufe, Browser-Zurück und Öffnen in einem weiteren Tab funktionieren ohne eigene Routing-Bibliothek.

Die Schüttelbox übernimmt die zuletzt abgestimmte Fassung: keine Trennwand, fest mitbewegte Füße, animierte Rollläden vor dem Schütteln und danach, keine Kugelphysik und keine zusätzlichen Hinweistexte oder Zähler. Ihre vorhandenen Lernmodi bleiben erhalten.
