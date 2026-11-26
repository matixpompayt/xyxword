package pl.matixpompayt.xyxword;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/** Pobieranie aktualizacji APK w aplikacji (z postępem) i uruchomienie instalatora — jak w CAR OS Connect. */
@CapacitorPlugin(name = "XyxUpdater")
public class UpdaterPlugin extends Plugin {

    private File apkFile() {
        File dir = new File(getContext().getCacheDir(), "updates");
        dir.mkdirs();
        return new File(dir, "update.apk");
    }

    @PluginMethod
    public void canInstall(PluginCall call) {
        JSObject r = new JSObject();
        r.put("value", Build.VERSION.SDK_INT < 26 || getContext().getPackageManager().canRequestPackageInstalls());
        call.resolve(r);
    }

    @PluginMethod
    public void openInstallSettings(PluginCall call) {
        try {
            Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
        } catch (Exception e) { /* starsze Androidy */ }
        call.resolve();
    }

    @PluginMethod
    public void download(PluginCall call) {
        final String url = call.getString("url");
        if (url == null) { call.reject("Brak adresu"); return; }
        new Thread(() -> {
            File out = apkFile();
            HttpURLConnection c = null;
            try {
                String u = url;
                for (int hop = 0; hop < 5; hop++) { // GitHub przekierowuje na inny serwer
                    c = (HttpURLConnection) new URL(u).openConnection();
                    c.setInstanceFollowRedirects(false);
                    c.setConnectTimeout(15000);
                    c.setReadTimeout(30000);
                    c.setRequestProperty("User-Agent", "XyxWord");
                    int code = c.getResponseCode();
                    if (code >= 300 && code < 400) { u = c.getHeaderField("Location"); c.disconnect(); c = null; continue; }
                    if (code < 200 || code > 299) throw new Exception("HTTP " + code);
                    break;
                }
                if (c == null) throw new Exception("Za dużo przekierowań");
                long total = c.getContentLengthLong(), done = 0, lastEmit = 0;
                try (InputStream in = c.getInputStream(); FileOutputStream os = new FileOutputStream(out)) {
                    byte[] buf = new byte[64 * 1024];
                    int n;
                    while ((n = in.read(buf)) >= 0) {
                        os.write(buf, 0, n);
                        done += n;
                        long now = System.currentTimeMillis();
                        if (now - lastEmit > 120) {
                            lastEmit = now;
                            JSObject p = new JSObject();
                            p.put("loaded", done);
                            p.put("total", total);
                            notifyListeners("progress", p);
                        }
                    }
                }
                JSObject p = new JSObject();
                p.put("loaded", done);
                p.put("total", total > 0 ? total : done);
                notifyListeners("progress", p);
                JSObject r = new JSObject();
                r.put("size", done);
                call.resolve(r);
            } catch (Exception e) {
                out.delete();
                call.reject("Pobieranie nie powiodło się: " + e.getMessage());
            } finally {
                if (c != null) c.disconnect();
            }
        }).start();
    }

    @PluginMethod
    public void install(PluginCall call) {
        try {
            File f = apkFile();
            if (!f.exists()) { call.reject("Brak pobranego pliku"); return; }
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", f);
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(uri, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Exception e) {
            call.reject("Nie udało się uruchomić instalatora: " + e.getMessage());
        }
    }
}
