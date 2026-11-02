package fr.soireebox.app;

import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import android.webkit.JavascriptInterface;

import java.nio.charset.StandardCharsets;
import java.security.KeyStore;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** Coffre-fort : chiffre les données de l'appli (profil, compteur d'alcool, poids…) avec une clé AES gardée
 *  dans l'Android Keystore. La clé ne peut pas sortir du téléphone : une copie des fichiers de l'appli est illisible.
 *  Côté page : AndroidVault.enc(texte) -> "v1:..." et AndroidVault.dec("v1:...") -> texte ("" si illisible). */
public class Vault {
    private static final String ALIAS = "soiree-box-coffre-v1";
    private SecretKey key;

    private synchronized SecretKey key() throws Exception {
        if (key != null) return key;
        KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
        ks.load(null);
        if (ks.containsAlias(ALIAS)) {
            key = ((KeyStore.SecretKeyEntry) ks.getEntry(ALIAS, null)).getSecretKey();
        } else {
            KeyGenerator g = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
            g.init(new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(256)
                    .build());
            key = g.generateKey();
        }
        return key;
    }

    @JavascriptInterface
    public boolean ok() {
        try { key(); return true; } catch (Exception e) { return false; }
    }

    @JavascriptInterface
    public String enc(String plain) {
        try {
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.ENCRYPT_MODE, key());
            byte[] iv = c.getIV(), out = c.doFinal(plain.getBytes(StandardCharsets.UTF_8));
            byte[] all = new byte[iv.length + out.length];
            System.arraycopy(iv, 0, all, 0, iv.length);
            System.arraycopy(out, 0, all, iv.length, out.length);
            return "v1:" + Base64.encodeToString(all, Base64.NO_WRAP);
        } catch (Exception e) { return ""; }
    }

    @JavascriptInterface
    public String dec(String data) {
        try {
            if (data == null || !data.startsWith("v1:")) return "";
            byte[] all = Base64.decode(data.substring(3), Base64.NO_WRAP);
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, all, 0, 12));
            return new String(c.doFinal(all, 12, all.length - 12), StandardCharsets.UTF_8);
        } catch (Exception e) { return ""; }
    }
}
