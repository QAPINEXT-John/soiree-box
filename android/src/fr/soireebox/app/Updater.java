package fr.soireebox.app;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Iterator;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Mises à jour sans réinstaller l'APK.
 *
 * L'appli embarque le jeu (assets/www). Les nouveautés (jeux, cartes, corrections) sont publiées en ligne
 * avec un manifeste version.json (liste des fichiers + empreinte SHA-256). L'appli télécharge seulement
 * les fichiers qui ont changé dans files/ota/www, vérifie chaque empreinte, puis bascule d'un coup
 * sur la nouvelle version. Si un nouvel APK est installé par-dessus (plus récent que la mise à jour),
 * la copie téléchargée est effacée et l'appli repart sur ses fichiers d'origine.
 *
 * Côté JavaScript : AndroidUpdate.info(), .check(), .apply(), .restart(), .openApk().
 * Les résultats reviennent par SB.onUpdate({ t: "avail" | "none" | "progress" | "ready" | "error", … }).
 */
public class Updater {
    private final Activity act;
    private final WebView web;
    private JSONObject remote;
    private volatile boolean busy;

    public Updater(Activity act, WebView web) { this.act = act; this.web = web; }

    // ---------- Fichiers ----------
    static File otaRoot(Activity a) { return new File(a.getFilesDir(), "ota"); }
    static File otaWww(Activity a) { return new File(otaRoot(a), "www"); }

    static JSONObject bundled(Activity a) {
        try { return new JSONObject(new String(readAll(a.getAssets().open("www/version.json")), "UTF-8")); }
        catch (Exception e) { return new JSONObject(); }
    }
    static String otaVersion(Activity a) {
        try { return new JSONObject(new String(readAll(new FileInputStream(new File(otaRoot(a), "meta.json"))), "UTF-8")).optString("version", ""); }
        catch (Exception e) { return ""; }
    }
    /** Au démarrage : une mise à jour plus ancienne que l'APK installé (ou cassée) est effacée. */
    static void cleanup(Activity a) {
        String ota = otaVersion(a), base = bundled(a).optString("version", "0");
        if (ota.isEmpty() || cmp(ota, base) <= 0 || !new File(otaWww(a), "index.html").exists()) wipe(otaRoot(a));
        wipe(new File(a.getFilesDir(), "ota-next"));
        wipe(new File(a.getFilesDir(), "ota-old"));
    }
    String current() { String o = otaVersion(act); return o.isEmpty() ? bundled(act).optString("version", "0") : o; }
    int apkCode() {
        try { PackageInfo p = act.getPackageManager().getPackageInfo(act.getPackageName(), 0); return p.versionCode; }
        catch (Exception e) { return 0; }
    }
    String base() {
        String b = bundled(act).optString("base", "");
        return b.startsWith("https://") ? (b.endsWith("/") ? b : b + "/") : "";
    }

    // ---------- Pont JavaScript ----------
    @JavascriptInterface
    public String info() {
        try { return new JSONObject().put("version", current()).put("apk", apkCode()).put("base", base()).put("ota", !otaVersion(act).isEmpty()).toString(); }
        catch (Exception e) { return "{}"; }
    }

    @JavascriptInterface
    public void check() {
        if (base().isEmpty()) { emit(obj("t", "error", "msg", "Adresse de mise à jour absente")); return; }
        new Thread(new Runnable() { public void run() {
            try {
                JSONObject r = new JSONObject(new String(get(base() + "version.json?t=" + System.currentTimeMillis()), "UTF-8"));
                remote = r;
                String v = r.optString("version", "0");
                if (cmp(v, current()) > 0) {
                    JSONObject o = new JSONObject().put("t", "avail").put("v", v).put("cur", current())
                        .put("needApk", r.optInt("apkMin", 0) > apkCode()).put("notes", r.optJSONArray("notes") != null ? r.optJSONArray("notes") : new JSONArray());
                    emit(o);
                } else emit(new JSONObject().put("t", "none").put("v", current()));
            } catch (Exception e) { emit(obj("t", "error", "msg", "Impossible de joindre le serveur de mises à jour")); }
        } }).start();
    }

    @JavascriptInterface
    public void apply() {
        if (busy) return;
        if (remote == null) { emit(obj("t", "error", "msg", "Vérifie d'abord les mises à jour")); return; }
        if (remote.optInt("apkMin", 0) > apkCode()) { emit(obj("t", "error", "msg", "Cette mise à jour demande la nouvelle appli")); return; }
        busy = true;
        new Thread(new Runnable() { public void run() {
            File next = new File(act.getFilesDir(), "ota-next"), nextWww = new File(next, "www");
            try {
                wipe(next);
                JSONObject files = remote.getJSONObject("files");
                int total = files.length(), done = 0, got = 0;
                Iterator<String> it = files.keys();
                while (it.hasNext()) {
                    String path = it.next();
                    if (!safe(path)) throw new Exception("chemin refusé : " + path);
                    String want = files.getJSONObject(path).getString("h");
                    byte[] cur = served(path);
                    File dst = new File(nextWww, path);
                    if (cur != null && sha(cur).equals(want)) {
                        File ota = new File(otaWww(act), path);
                        if (ota.exists()) write(dst, cur); // déjà à jour mais venu d'une mise à jour précédente : on le garde
                    } else {
                        byte[] b = get(base() + path + "?v=" + want.substring(0, 12));
                        if (!sha(b).equals(want)) throw new Exception("fichier corrompu : " + path);
                        write(dst, b); got++;
                    }
                    done++;
                    if (done % 3 == 0 || done == total) emit(new JSONObject().put("t", "progress").put("done", done).put("total", total).put("got", got));
                }
                if (!new File(nextWww, "index.html").exists()) write(new File(nextWww, "index.html"), readAll(act.getAssets().open("www/index.html")));
                write(new File(next, "meta.json"), new JSONObject().put("version", remote.optString("version")).toString().getBytes("UTF-8"));
                // Bascule : l'ancienne copie part, la nouvelle prend sa place.
                File root = otaRoot(act), old = new File(act.getFilesDir(), "ota-old");
                wipe(old);
                if (root.exists() && !root.renameTo(old)) throw new Exception("bascule impossible");
                if (!next.renameTo(root)) { old.renameTo(root); throw new Exception("bascule impossible"); }
                wipe(old);
                emit(new JSONObject().put("t", "ready").put("v", remote.optString("version")).put("got", got));
            } catch (Exception e) {
                wipe(next);
                emit(obj("t", "error", "msg", "La mise à jour a échoué (" + e.getMessage() + ")"));
            } finally { busy = false; }
        } }).start();
    }

    @JavascriptInterface
    public void restart() {
        act.runOnUiThread(new Runnable() { public void run() {
            web.clearCache(true);
            web.loadUrl("https://" + MainActivity.ORIGIN_HOST + "/index.html");
        } });
    }

    @JavascriptInterface
    public void openApk() {
        final String b = base();
        if (b.isEmpty()) return;
        act.runOnUiThread(new Runnable() { public void run() {
            try { act.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(b + "SoireeBox.apk"))); } catch (Exception ignored) { }
        } });
    }

    /** Efface la mise à jour téléchargée et revient aux fichiers d'origine de l'APK. */
    @JavascriptInterface
    public void reset() { wipe(otaRoot(act)); restart(); }

    // ---------- Outils ----------
    private byte[] served(String path) {
        try {
            File f = new File(otaWww(act), path);
            if (f.exists()) return readAll(new FileInputStream(f));
            return readAll(act.getAssets().open("www/" + path));
        } catch (Exception e) { return null; }
    }
    private void emit(final JSONObject o) {
        act.runOnUiThread(new Runnable() { public void run() {
            if (web != null) web.evaluateJavascript("window.SB && SB.onUpdate && SB.onUpdate(" + o.toString() + ")", null);
        } });
    }
    private static JSONObject obj(String... kv) {
        JSONObject o = new JSONObject();
        try { for (int i = 0; i + 1 < kv.length; i += 2) o.put(kv[i], kv[i + 1]); } catch (Exception ignored) { }
        return o;
    }
    static boolean safe(String p) { return p.matches("[A-Za-z0-9._/-]+") && !p.contains("..") && !p.startsWith("/"); }
    static byte[] get(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(15000); c.setReadTimeout(30000); c.setUseCaches(false);
        try {
            if (c.getResponseCode() != 200) throw new Exception("HTTP " + c.getResponseCode());
            return readAll(c.getInputStream());
        } finally { c.disconnect(); }
    }
    static byte[] readAll(InputStream in) throws Exception {
        try {
            ByteArrayOutputStream o = new ByteArrayOutputStream(); byte[] b = new byte[16384]; int n;
            while ((n = in.read(b)) > 0) o.write(b, 0, n);
            return o.toByteArray();
        } finally { in.close(); }
    }
    static void write(File f, byte[] b) throws Exception {
        File d = f.getParentFile(); if (d != null && !d.exists() && !d.mkdirs()) throw new Exception("dossier");
        FileOutputStream o = new FileOutputStream(f);
        try { o.write(b); o.getFD().sync(); } finally { o.close(); }
    }
    static String sha(byte[] b) throws Exception {
        byte[] h = MessageDigest.getInstance("SHA-256").digest(b);
        StringBuilder s = new StringBuilder(); for (byte x : h) s.append(String.format("%02x", x)); return s.toString();
    }
    static void wipe(File f) {
        if (f == null || !f.exists()) return;
        File[] l = f.listFiles(); if (l != null) for (File c : l) wipe(c);
        f.delete();
    }
    /** Compare deux versions « 4.10.1 » / « 4.9 » : négatif, zéro ou positif. */
    static int cmp(String a, String b) {
        String[] x = a.split("\\."), y = b.split("\\.");
        for (int i = 0; i < Math.max(x.length, y.length); i++) {
            int p = i < x.length ? num(x[i]) : 0, q = i < y.length ? num(y[i]) : 0;
            if (p != q) return p < q ? -1 : 1;
        }
        return 0;
    }
    private static int num(String s) { try { return Integer.parseInt(s.replaceAll("[^0-9]", "")); } catch (Exception e) { return 0; } }
}
