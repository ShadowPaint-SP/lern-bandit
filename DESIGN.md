# Gemeinsamer Einstieg für Lernbandit

Die Startseite führt direkt zu den vier Lernwerkzeugen. Die Auswahl besteht aus kleinen Ansichten der Maschinen und der Schreibfläche. Logo und zentrierte Fach-Navigation stehen auf jeder Seite zusammen in der Kopfzeile. Deutsch und Mathe öffnen jeweils ein Untermenü mit den passenden Werkzeugen. Das aktive Fach und das aktive Werkzeug sind markiert. Das Logo führt zur Startseite.

## Gestaltung

- Papier `#f7f4eb`, Kontur `#292b2b`, Gelb `#FEDE54`, Rot `#df4537`, Petrol `#247c79`, Innenfläche `#fffef8`.
- Grundschrift für Überschriften, Zahlen und Spielaktionen. Avenir Next mit Trebuchet-Fallback für die Bedienung.
- Zentrierte Überschrift und Fach-Navigation. Auf dem Desktop vier Vorschauen nebeneinander, auf dem Tablet zwei Spalten, auf dem Handy vier Zeilen mit Vorschau links und Beschreibung rechts.
- Die Bildsprache kommt von den bestehenden Walzen und der Schüttelbox. Keine zusätzliche Illustration oder automatisch laufende Bewegung.

```text
Lernbandit.    [Deutsch ▾ | Mathe ▾]    Hilfe / Einstellungen

                    Was spielen wir heute?

   [To | ma | te]     [7 | + | 3]     [●●● | ●●●]     [Die kleine Katze]
    Silben-Bandit      Mathe-Bandit     Schüttelbox       Silbenfarben
    Wörter entdecken   Rechnen üben    Zahlen zerlegen   Text schreiben
```

Der Abgleich mit dem Brief hat zusätzliche Einstiegs-Buttons, Statistiken und Erklärblöcke ausgeschlossen. Die vier Vorschauen sind selbst die Links zu den Werkzeugen. Direktaufrufe, Browser-Zurück und Öffnen in einem weiteren Tab funktionieren ohne eigene Routing-Bibliothek.

Die Schüttelbox übernimmt die zuletzt abgestimmte Fassung: keine Trennwand, fest mitbewegte Füße, animierte Rollläden vor dem Schütteln und danach, keine Kugelphysik und keine zusätzlichen Hinweistexte oder Zähler. Ihre vorhandenen Lernmodi bleiben erhalten.


## Silbenfarben

Ein freies Schreibwerkzeug ergänzt die drei Spiele. Es übernimmt Papier `#f7f4eb`, Gelb `#FEDE54`, Kontur `#292b2b`, Petrol `#247c79` und die Innenfläche `#fffef8`. Die Markierung verwendet das dunklere Rot `#c23e32` für gut lesbaren Text auf Weiß. Grundschrift trägt den eingegebenen Text, Avenir Next die Bedienung. Der Text bleibt linksbündig und erhält viel Zeilenabstand.

```text
Lernbandit.  [Deutsch ▾ | Mathe ▾]  Einstellungen

                         Silbenfarben
              Schreibe deinen Text. Die Silben färben sich mit.

┌───────────────────────────────────────────────────────────────────┐
│ Dein Text                               Beispieltext   Text leeren │
│ ┌───────────────────────────────────────────────────────────────┐ │
│ │ Die kleine Katze spielt im Garten.                            │ │
│ │                                                               │ │
│ │                                                               │ │
│ └───────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

Abgleich mit dem Brief: Das Werkzeug braucht keine zweite Vorschau, keinen Startknopf und keine Zähler. Die Schrift selbst zeigt seine Funktion. Der bestehende Maschinenrahmen verbindet es mit den anderen Werkzeugen. Einstellungen beschränken sich auf Schriftgröße, Markierungsfarbe und optionale Silbenbögen. Rot ist die Standard-Markierungsfarbe; Petrol und Blau sind auswählbar.

Ein normales Textfeld bleibt für Auswahl, Cursor, Einfügen und Rückgängig zuständig. Dahinter zeichnet eine für Screenreader ausgeblendete Ebene denselben Text mit farbigen Silben. Nach jedem Buchstaben wird auch das gerade geschriebene Wort neu zerlegt und markiert. Während einer laufenden Tastaturkomposition bleibt die Eingabe vorübergehend unmarkiert; danach erscheinen die Silben sofort. Silbenbögen ändern die Textbreite nicht.

Die Fach-Untermenüs verwenden normale Links und aufklappbare Schaltflächen. Ein Klick außerhalb, Escape oder das Verlassen der Navigation per Tab schließt das Untermenü. Pfeiltasten wechseln zwischen den Einträgen. Auf kleinen Bildschirmen bleiben die Menüs innerhalb der Fensterbreite.
