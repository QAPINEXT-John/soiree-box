package fr.soireebox.app;

import android.app.Activity;
import android.content.ContentUris;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Random;
import org.json.JSONObject;

/**
 * Photo roulette : tire des photos au hasard dans la galerie du téléphone, après accord du joueur
 * (autorisation Android « Photos »). Les photos sont réduites (640 px) et rendues au jeu une par une ;
 * rien n'est enregistré ni envoyé par cette classe.
 *
 * Côté JavaScript : AndroidGallery.random(n, req). Réponses par SB.onGallery({ req, t: "img" | "done" | "denied" | "error", … }).
 */
public class Gallery {
    static final int PERM = 42;
    private final Activity act;
    private final WebView web;
    private final HashSet<Long> given = new HashSet<Long>();
    private final Random rnd = new Random();
    private int wantN; private String wantReq;

    public Gallery(Activity act, WebView web) { this.act = act; this.web = web; }

    private static String[] perms() {
        if (Build.VERSION.SDK_INT >= 34) return new String[] { "android.permission.READ_MEDIA_IMAGES", "android.permission.READ_MEDIA_VISUAL_USER_SELECTED" };
        if (Build.VERSION.SDK_INT >= 33) return new String[] { "android.permission.READ_MEDIA_IMAGES" };
        return new String[] { "android.permission.READ_EXTERNAL_STORAGE" };
    }
    private boolean granted() {
        if (Build.VERSION.SDK_INT < 23) return true;
        for (String p : perms()) if (act.checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED) return true;
        return false;
    }

    @JavascriptInterface
    public void random(final int n, final String req) {
        final int k = Math.max(1, Math.min(12, n));
        act.runOnUiThread(new Runnable() { public void run() {
            if (granted()) { draw(k, req); return; }
            wantN = k; wantReq = req;
            if (Build.VERSION.SDK_INT >= 23) act.requestPermissions(perms(), PERM);
        } });
    }

    /** Appelé par MainActivity quand le joueur a répondu à la demande d'autorisation. */
    void onPermission() {
        String req = wantReq; wantReq = null;
        if (req == null) return;
        if (granted()) draw(wantN, req);
        else emit(obj(req, "denied"));
    }

    private void draw(final int n, final String req) {
        new Thread(new Runnable() { public void run() {
            try {
                ArrayList<Long> ids = new ArrayList<Long>();
                Cursor c = act.getContentResolver().query(MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                    new String[] { MediaStore.Images.Media._ID }, MediaStore.Images.Media.SIZE + " > 20000", null, null);
                if (c != null) { try { while (c.moveToNext()) ids.add(c.getLong(0)); } finally { c.close(); } }
                int total = ids.size();
                ArrayList<Long> fresh = new ArrayList<Long>();
                for (Long id : ids) if (!given.contains(id)) fresh.add(id);
                if (fresh.size() < n) { given.clear(); fresh = ids; }
                Collections.shuffle(fresh, rnd);
                int sent = 0;
                for (int i = 0; i < fresh.size() && sent < n && i < n * 4; i++) {
                    long id = fresh.get(i);
                    String d = load(id);
                    if (d == null) continue;
                    given.add(id); sent++;
                    emit(obj(req, "img").put("d", d));
                }
                emit(obj(req, "done").put("n", sent).put("total", total));
            } catch (Exception e) {
                try { emit(obj(req, "error").put("msg", String.valueOf(e.getMessage()))); } catch (Exception ignored) { }
            }
        } }).start();
    }

    private String load(long id) {
        try {
            Uri u = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id);
            BitmapFactory.Options o = new BitmapFactory.Options(); o.inJustDecodeBounds = true;
            InputStream in = act.getContentResolver().openInputStream(u);
            try { BitmapFactory.decodeStream(in, null, o); } finally { if (in != null) in.close(); }
            if (o.outWidth <= 0 || o.outHeight <= 0) return null;
            int s = 1; while (Math.max(o.outWidth, o.outHeight) / (s * 2) >= 640) s *= 2;
            BitmapFactory.Options o2 = new BitmapFactory.Options(); o2.inSampleSize = s;
            in = act.getContentResolver().openInputStream(u);
            Bitmap b;
            try { b = BitmapFactory.decodeStream(in, null, o2); } finally { if (in != null) in.close(); }
            if (b == null) return null;
            float k = Math.min(1f, 640f / Math.max(b.getWidth(), b.getHeight()));
            Matrix m = new Matrix(); m.postScale(k, k);
            int rot = orientation(u); if (rot != 0) m.postRotate(rot);
            Bitmap r = Bitmap.createBitmap(b, 0, 0, b.getWidth(), b.getHeight(), m, true);
            if (r != b) b.recycle();
            Bitmap out = Bitmap.createBitmap(r.getWidth(), r.getHeight(), Bitmap.Config.RGB_565);
            Canvas cv = new Canvas(out); cv.drawColor(Color.WHITE); cv.drawBitmap(r, 0, 0, null); r.recycle();
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            out.compress(Bitmap.CompressFormat.JPEG, 60, bo); out.recycle();
            return "data:image/jpeg;base64," + Base64.encodeToString(bo.toByteArray(), Base64.NO_WRAP);
        } catch (Throwable e) { return null; }
    }
    private int orientation(Uri u) {
        Cursor c = null;
        try {
            c = act.getContentResolver().query(u, new String[] { "orientation" }, null, null, null);
            if (c != null && c.moveToFirst()) return c.getInt(0);
        } catch (Exception ignored) { } finally { if (c != null) c.close(); }
        return 0;
    }
    private static JSONObject obj(String req, String t) {
        JSONObject o = new JSONObject();
        try { o.put("req", req).put("t", t); } catch (Exception ignored) { }
        return o;
    }
    private void emit(final JSONObject o) {
        act.runOnUiThread(new Runnable() { public void run() {
            if (web != null) web.evaluateJavascript("window.SB && SB.onGallery && SB.onGallery(" + o.toString() + ")", null);
        } });
    }
}
