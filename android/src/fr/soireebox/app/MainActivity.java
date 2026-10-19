package fr.soireebox.app;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

/** Soirée Box : les jeux tournent dans une WebView servie en https://localhost depuis les assets. */
public class MainActivity extends Activity {
    static final String ORIGIN_HOST = "localhost";
    private WebView web;
    private ValueCallback<Uri[]> pick;
    private Gallery gallery;
    private static final int PICK = 41;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        // Écran toujours allumé tant que l'appli est ouverte.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        web = new WebView(this);
        web.setBackgroundColor(0x00000000);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true); // photos choisies dans la galerie (Photo roulette)
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setTextZoom(100);

        web.addJavascriptInterface(new ShareBridge(), "AndroidShare");
        // Mises à jour sans réinstaller : les fichiers téléchargés (files/ota/www) passent avant ceux de l'APK.
        Updater.cleanup(this);
        web.addJavascriptInterface(new Updater(this, web), "AndroidUpdate");
        // Photo roulette : photos tirées au hasard dans la galerie, après autorisation du joueur.
        gallery = new Gallery(this, web);
        web.addJavascriptInterface(gallery, "AndroidGallery");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (!"https".equals(u.getScheme()) || !ORIGIN_HOST.equals(u.getHost())) return null;
                String path = u.getPath();
                if (path == null || path.equals("/") || path.isEmpty()) path = "/index.html";
                try {
                    File ota = new File(Updater.otaWww(MainActivity.this), path.substring(1));
                    InputStream in = Updater.safe(path.substring(1)) && ota.isFile() ? new FileInputStream(ota) : getAssets().open("www" + path);
                    return new WebResourceResponse(mime(path), "UTF-8", in);
                } catch (Exception e) {
                    WebResourceResponse nf = new WebResourceResponse("text/plain", "UTF-8", null);
                    nf.setStatusCodeAndReasonPhrase(404, "Not Found");
                    return nf;
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Uri u = Uri.parse(url);
                if ("https".equals(u.getScheme()) && ORIGIN_HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }
        });

        // Choix de photos dans la galerie (<input type="file">), une ou plusieurs à la fois.
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (pick != null) pick.onReceiveValue(null);
                pick = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("image/*");
                i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, p != null && p.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                try { startActivityForResult(Intent.createChooser(i, "Choisir des photos"), PICK); }
                catch (Exception e) { pick = null; cb.onReceiveValue(null); }
                return true;
            }
        });

        setContentView(web);
        String code = inviteCode(getIntent());
        if (state != null && code == null) web.restoreState(state);
        else web.loadUrl("https://" + ORIGIN_HOST + "/index.html" + (code != null ? "#" + code : ""));
    }

    /** Code de salon d'un lien d'invitation soireebox://join/ABCD (null sinon). */
    static String inviteCode(Intent i) {
        if (i == null || i.getData() == null) return null;
        Uri u = i.getData();
        if (!"soireebox".equals(u.getScheme()) || !"join".equals(u.getHost())) return null;
        String c = u.getPath() == null ? "" : u.getPath().replace("/", "").toUpperCase(java.util.Locale.ROOT);
        return c.matches("[A-Z]{4}") ? c : null;
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        setIntent(i);
        String code = inviteCode(i);
        if (code != null && web != null) web.evaluateJavascript("window.SB && SB.openInvite && SB.openInvite('" + code + "')", null);
    }

    private static String mime(String p) {
        String l = p.toLowerCase();
        if (l.endsWith(".html")) return "text/html";
        if (l.endsWith(".js")) return "text/javascript";
        if (l.endsWith(".css")) return "text/css";
        if (l.endsWith(".json") || l.endsWith(".webmanifest")) return "application/json";
        if (l.endsWith(".png")) return "image/png";
        if (l.endsWith(".svg")) return "image/svg+xml";
        if (l.endsWith(".woff2")) return "font/woff2";
        if (l.endsWith(".txt")) return "text/plain";
        return "application/octet-stream";
    }

    /** Ouvre la feuille de partage d'Android (WhatsApp, SMS, Snap…). */
    private class ShareBridge {
        /** Présent à partir de la version 4.6 de l'appli : le choix de photos fonctionne. */
        @JavascriptInterface
        public boolean photos() { return true; }

        @JavascriptInterface
        public void share(final String text) {
            runOnUiThread(new Runnable() {
                @Override public void run() {
                    Intent i = new Intent(Intent.ACTION_SEND);
                    i.setType("text/plain");
                    i.putExtra(Intent.EXTRA_TEXT, text);
                    startActivity(Intent.createChooser(i, "Partager"));
                }
            });
        }
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] perms, int[] res) {
        if (req == Gallery.PERM && gallery != null) gallery.onPermission();
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req != PICK) { super.onActivityResult(req, res, data); return; }
        if (pick == null) return;
        Uri[] r = null;
        if (res == RESULT_OK && data != null) {
            ClipData c = data.getClipData();
            if (c != null && c.getItemCount() > 0) {
                r = new Uri[c.getItemCount()];
                for (int k = 0; k < r.length; k++) r[k] = c.getItemAt(k).getUri();
            } else if (data.getData() != null) r = new Uri[] { data.getData() };
        }
        pick.onReceiveValue(r);
        pick = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }

    @Override
    protected void onPause() { web.onPause(); super.onPause(); }

    // Le bouton retour d'Android est confié au jeu (fermer un panneau, revenir au salon…).
    // L'appli ne se ferme que si le jeu répond qu'il n'y a plus rien à faire.
    @Override
    public void onBackPressed() {
        if (web == null) { super.onBackPressed(); return; }
        web.evaluateJavascript("(window.SB && SB.back) ? String(SB.back()) : 'false'", new android.webkit.ValueCallback<String>() {
            @Override public void onReceiveValue(String v) {
                if (v == null || !v.contains("true")) MainActivity.super.onBackPressed();
            }
        });
    }

    @Override
    protected void onDestroy() {
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }
}
