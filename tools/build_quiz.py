#!/usr/bin/env python3
"""Construit www/games/quiz-data.js à partir des fichiers quiz/<thème>.json.
Chaque question : {"t":"q"|"n"|"vf", ("n": nombre | "v": bool), "fr": {...}, "en": {...}}
  q  : fr/en.a = 4 réponses, la bonne en premier
  n  : n = la valeur, fr/en.u = l'unité
  vf : v = vrai/faux, fr/en.x = l'explication
Usage : python3 tools/build_quiz.py   (vérifie le format et écrit le fichier)"""
import json, os, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "quiz")
OUT = os.path.join(ROOT, "www", "games", "quiz-data.js")
ORDER = ["culture", "pop", "histoire", "geo", "sport", "bouffe", "insolite", "soiree", "hot", "kid"]

def check(theme, i, q):
    where = "%s #%d" % (theme, i + 1)
    t = q.get("t")
    assert t in ("q", "n", "vf"), where + " : type inconnu"
    for lg in ("fr", "en"):
        L = q.get(lg)
        assert isinstance(L, dict) and isinstance(L.get("q"), str) and L["q"].strip(), where + " : question " + lg + " manquante"
        if t == "q":
            a = L.get("a")
            assert isinstance(a, list) and len(a) == 4 and all(isinstance(x, str) and x.strip() for x in a), where + " : il faut 4 réponses en " + lg
            assert len(set(x.strip().lower() for x in a)) == 4, where + " : réponses en double en " + lg
        if t == "vf":
            assert isinstance(L.get("x"), str), where + " : explication " + lg + " manquante"
        if t == "n":
            assert isinstance(L.get("u", ""), str), where + " : unité " + lg
    if t == "n":
        assert isinstance(q.get("n"), (int, float)) and not isinstance(q.get("n"), bool), where + " : nombre manquant"
    if t == "vf":
        assert isinstance(q.get("v"), bool), where + " : vrai/faux manquant"

def main():
    data, total = {}, 0
    files = {os.path.splitext(os.path.basename(f))[0]: f for f in glob.glob(os.path.join(SRC, "*.json"))}
    for theme in ORDER + sorted(k for k in files if k not in ORDER):
        if theme not in files:
            continue
        qs = json.load(open(files[theme], encoding="utf-8"))
        seen = set(); keep = []
        for i, q in enumerate(qs):
            check(theme, i, q)
            k = q["fr"]["q"].strip().lower()
            if k in seen:
                print("doublon retiré :", theme, q["fr"]["q"]); continue
            seen.add(k)
            out = {"t": q["t"], "fr": q["fr"], "en": q["en"]}
            if q["t"] == "n": out["n"] = q["n"]
            if q["t"] == "vf": out["v"] = q["v"]
            keep.append(out)
        data[theme] = keep; total += len(keep)
        print("%-10s %3d questions (%s)" % (theme, len(keep), ", ".join("%s %d" % (t, sum(1 for q in keep if q["t"] == t)) for t in ("q", "n", "vf"))))
    js = "/* Généré par tools/build_quiz.py à partir de quiz/*.json : ne pas modifier à la main. */\nSB.QUIZ = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
    open(OUT, "w", encoding="utf-8").write(js)
    print("total", total, "->", os.path.relpath(OUT, ROOT), "(%d ko)" % (len(js.encode()) // 1024))

if __name__ == "__main__":
    main()
