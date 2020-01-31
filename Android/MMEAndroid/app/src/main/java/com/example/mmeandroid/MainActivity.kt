package com.example.mmeandroid

import android.Manifest
import android.app.DownloadManager
import android.content.ContentValues
import android.content.Context
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.media.AudioManager
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.io.File


private const val PERMISSIONS_REQUEST_WRITE_EXTERNAL_STORAGE: Int = 1


class MainActivity : AppCompatActivity() {


    private var webView: WebView? = null
    private var sessionData = ""
    private val dTag = "File Download"
    private val pTag = "Permissions"


    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Top bar with back button
        setSupportActionBar(findViewById(R.id.toolbar_main))
        val actionBar = supportActionBar
        actionBar!!.setDisplayHomeAsUpEnabled(true)
        actionBar.setDisplayShowTitleEnabled(false)

        webView = findViewById(R.id.webView)


        if (savedInstanceState == null) {
            webView!!.setDownloadListener { url, _, _, _, _ -> onDownload(url) }

            webView!!.setWebViewClient(object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                    webView!!.loadUrl(url)
                    return true
                }
            })

            webView!!.settings.javaScriptEnabled = true
            webView!!.settings.databaseEnabled = true
            webView!!.settings.domStorageEnabled = true
            webView!!.settings.allowContentAccess = true
            webView!!.settings.allowFileAccess = true

            webView!!.settings.supportZoom()
            webView!!.settings.builtInZoomControls = true
            webView!!.settings.displayZoomControls = false
            webView!!.settings.loadWithOverviewMode = true

            webView!!.loadUrl(getHtmlURL())

            if (android.os.Build.VERSION.SDK_INT > 16) {
                webView!!.settings.mediaPlaybackRequiresUserGesture = false
            }
        }
        else {
            webView!!.restoreState(savedInstanceState)
        }
    }


    public override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
    }


    public override fun onPause() {
        webView!!.onPause()
        webView!!.pauseTimers()
        super.onPause()
    }

    public override fun onResume() {
        super.onResume()

        volumeControlStream = AudioManager.STREAM_MUSIC // control volume with volume buttons
        webView!!.resumeTimers()
        webView!!.onResume()
    }

    override fun onDestroy() {
        webView!!.destroy()
        super.onDestroy()
    }


    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        if (webView != null) webView!!.saveState(outState)
    }

    override fun onRestoreInstanceState(savedInstanceState: Bundle?) {
        super.onRestoreInstanceState(savedInstanceState!!)
        if (webView != null) webView!!.restoreState(savedInstanceState)
    }


    private fun getHtmlURL(): String {

        return "file:${this.filesDir.absolutePath}/www/index.html"
    }


    private fun onDownload(url: String) {
        val dialog = Dialog(this@MainActivity)

        if (isExternalStorageWritable()) {
            val msg = "Do you want to save ${R.string.name_downloaded_file} to your 'Downloads' directory?"
            dialog.showDoOrNotChoice(dTag, msg) { saveFileToDownloads(url) }
        }
        else {
            val msg = "Saving file is not possible.\nIf device is connected to another device try disconnecting it."
            dialog.showInformation(dTag, msg)
        }
    }


    private fun isExternalStorageWritable(): Boolean {
        return Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED
    }


    override fun onRequestPermissionsResult(requestCode: Int,
                                            permissions: Array<String>, grantResults: IntArray) {
        when (requestCode) {
            PERMISSIONS_REQUEST_WRITE_EXTERNAL_STORAGE -> {
                if ((grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED)) {
                    Log.i(pTag, "WRITE_EXTERNAL_STORAGE granted")
                    saveFileToDownloadsOnAPILowerQ()
                } else {
                    Log.i(pTag, "WRITE_EXTERNAL_STORAGE denied")
                }
            }

            else -> {
                Log.i(pTag, "Code $requestCode is unknown")
            }
        }
    }


    private fun saveFileToDownloadsOnAPILowerQ() {
        val saveDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val file = File(saveDir, getString(R.string.name_downloaded_file))
        file.createNewFile()
        file.writeText(sessionData)

        val downloadManager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        downloadManager.addCompletedDownload(
            file.name,
            file.name,
            true,
            "text/csv",
            file.absolutePath,
            file.length(),
            true
        )
    }


    private fun saveFileToDownloadsOnAPISinceQ() {
        if ( android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            val values = ContentValues()
            values.put(MediaStore.Downloads.TITLE, getString(R.string.name_downloaded_file))
            values.put(MediaStore.Downloads.DISPLAY_NAME, getString(R.string.mediastore_display_name_downloaded_file))
            values.put(MediaStore.Downloads.MIME_TYPE, "text/csv")

            val uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
            val outputStream = contentResolver.openOutputStream(uri!!)
            val writer = outputStream!!.bufferedWriter()
            writer.write(sessionData)
            writer.close()
        } else {
            Log.i(dTag, "Function not applicable for APIs < Q")
        }
    }


    private fun saveFileToDownloads(url: String) {

        Log.i(dTag, "Build version ${android.os.Build.VERSION.SDK_INT}")

        val decodedURL = Uri.decode(url)
        val offset = decodedURL.indexOf("utf-8,") + "utf-8,".length
        sessionData = decodedURL.substring(offset)

        if ( android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.Q) {
            Log.i(dTag, "Save data to \"Downloads\" via DownloadManager")


            if (ContextCompat.checkSelfPermission(this,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                Log.i(dTag, "Permission not granted yet. Ask permission.")
                ActivityCompat.requestPermissions(this@MainActivity,
                    arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE),
                    PERMISSIONS_REQUEST_WRITE_EXTERNAL_STORAGE
                )
            } else {
                Log.i(dTag, "Permission granted")
                saveFileToDownloadsOnAPILowerQ()
            }
        }
        else {
            Log.i(dTag, "Save data to 'Downloads' via MediaStore")
            saveFileToDownloadsOnAPISinceQ()
        }
    }

}
