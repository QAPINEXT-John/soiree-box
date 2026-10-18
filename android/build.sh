#!/usr/bin/env bash
# Compile Soirée Box en APK sans Android Studio ni Gradle.
# Outils (Ubuntu/Debian) : sudo apt install aapt dalvik-exchange zipalign apksigner libandroid-23-java default-jdk
set -euo pipefail
cd "$(dirname "$0")"
ANDROID_JAR=${ANDROID_JAR:-/usr/lib/android-sdk/platforms/android-23/android.jar}
KS=signing/soireebox.jks
PW=$(cat signing/mot-de-passe.txt)
OUT=build
rm -rf "$OUT"; mkdir -p "$OUT/classes" "$OUT/gen" "$OUT/dex" "$OUT/assets"

# Icônes de lancement à partir de l'icône de la PWA
python3 - <<'PY'
from PIL import Image
src=Image.open("../www/icons/icon-512.png").convert("RGBA")
for d,px in {"mdpi":48,"hdpi":72,"xhdpi":96,"xxhdpi":144,"xxxhdpi":192}.items():
    import os; os.makedirs(f"res/mipmap-{d}",exist_ok=True)
    src.resize((px,px),Image.LANCZOS).save(f"res/mipmap-{d}/ic_launcher.png")
PY

# Le jeu (dossier www) est embarqué tel quel dans les assets
cp -r ../www "$OUT/assets/www"
rm -f "$OUT/assets/www/sw.js" "$OUT/assets/www/games/_modele.js"

aapt package -f -m -J "$OUT/gen" -M AndroidManifest.xml -S res -I "$ANDROID_JAR"
javac -nowarn -Xlint:-options -source 8 -target 8 -bootclasspath "$ANDROID_JAR" -d "$OUT/classes" $(find src "$OUT/gen" -name "*.java")
dalvik-exchange --dex --output="$OUT/dex/classes.dex" "$OUT/classes"
aapt package -f -M AndroidManifest.xml -S res -A "$OUT/assets" -I "$ANDROID_JAR" -0 arsc -F "$OUT/unsigned.apk"
( cd "$OUT/dex" && aapt add -k ../unsigned.apk classes.dex >/dev/null )
zipalign -f -p 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"
apksigner sign --ks "$KS" --ks-key-alias soireebox --ks-pass "pass:$PW" --key-pass "pass:$PW" --out SoireeBox.apk "$OUT/aligned.apk"
apksigner verify --print-certs SoireeBox.apk | head -3
echo "APK prêt : $(pwd)/SoireeBox.apk"
