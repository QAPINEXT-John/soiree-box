#!/usr/bin/env python3
"""Prépare une nouvelle version de Soirée Box.

1. Mets à jour VERSION dans www/core.js (par ex. "4.3") et ajoute les nouveautés dans NOUVEAUTES.json.
2. Lance : python3 tools/release.py
   - écrit www/version.json (version, nouveautés, empreinte SHA-256 de chaque fichier)
   - régénère la liste des fichiers et le nom du cache dans www/sw.js
   - aligne versionName de l'APK sur VERSION
3. Si tu as touché à la partie Android (android/src), augmente versionCode dans android/AndroidManifest.xml
   et apkMin dans release.json, puis recompile l'APK (./android/build.sh).
4. Publie (git push) : GitHub Pages met en ligne www, les applis installées proposent la mise à jour.
"""
import hashlib, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WWW = os.path.join(ROOT, "www")
SKIP = {"version.json", "sw.js", "games/_modele.js", "SoireeBox.apk"}

def rd(p): return open(os.path.join(ROOT, p), encoding="utf-8").read()
def wr(p, s): open(os.path.join(ROOT, p), "w", encoding="utf-8").write(s)

def main():
    core = rd("www/core.js")
    m = re.search(r'const VERSION = "([0-9.]+)";', core)
    if not m: sys.exit("VERSION introuvable dans www/core.js")
    version = m.group(1)
    rel = json.loads(rd("release.json"))
    notes = json.loads(rd("NOUVEAUTES.json")).get(version, [])
    man = rd("android/AndroidManifest.xml")
    code = int(re.search(r'android:versionCode="(\d+)"', man).group(1))
    man = re.sub(r'android:versionName="[^"]*"', 'android:versionName="%s"' % version, man)
    wr("android/AndroidManifest.xml", man)

    files = {}
    for d, _, fs in os.walk(WWW):
        for f in sorted(fs):
            full = os.path.join(d, f); rel_p = os.path.relpath(full, WWW).replace(os.sep, "/")
            if rel_p in SKIP or f.startswith("."): continue
            b = open(full, "rb").read()
            files[rel_p] = {"h": hashlib.sha256(b).hexdigest(), "s": len(b)}
    files = dict(sorted(files.items()))
    out = {"version": version, "apk": code, "apkMin": rel.get("apkMin", 0), "base": rel["base"], "notes": notes, "files": files}
    wr("www/version.json", json.dumps(out, ensure_ascii=False, indent=1) + "\n")

    sw = rd("www/sw.js")
    lst = ['  "./"'] + ['  "%s"' % p for p in files if not p.endswith((".txt", ".md")) and p not in ("PEERJS-LICENSE.txt",)]
    sw = re.sub(r'const CACHE = "[^"]*";', 'const CACHE = "soireebox-%s";' % version, sw)
    sw = re.sub(r"const FILES = \[[\s\S]*?\];", "const FILES = [\n" + ",\n".join(lst) + "\n];", sw, count=1)
    wr("www/sw.js", sw)
    print("Version %s · APK %d (apkMin %d) · %d fichiers · %s" % (version, code, out["apkMin"], len(files), rel["base"]))

if __name__ == "__main__":
    main()
