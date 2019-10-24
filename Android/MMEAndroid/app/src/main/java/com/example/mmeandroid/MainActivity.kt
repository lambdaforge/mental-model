package com.example.mmeandroid

import android.Manifest
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Environment
import android.webkit.*
import androidx.appcompat.app.AlertDialog
import android.util.Log
import java.io.*
import android.app.DownloadManager
import android.content.ContentValues
import android.content.Context
import android.provider.MediaStore
import android.net.Uri
import androidx.core.app.ActivityCompat
import android.content.pm.PackageManager
import android.media.AudioManager
import androidx.core.content.ContextCompat


private const val PERMISSIONS_REQUEST_WRITE_EXTERNAL_STORAGE: Int = 1


class MainActivity : AppCompatActivity() {


    private var webView: WebView? = null
    private val sessionDataFileName = "mmetool_data.csv"
    private val sessionDataDownloadTitle = "mmetool_data"

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

        webView = findViewById(R.id.webview)
        webView!!.settings.javaScriptEnabled = true
        webView!!.settings.databaseEnabled = true
        webView!!.settings.domStorageEnabled = true
        webView!!.settings.allowContentAccess = true
        webView!!.settings.allowFileAccess = true
        webView!!.webViewClient = WebViewClient()
        webView!!.loadUrl(getHtmlURL())
        webView!!.setDownloadListener { url, _, _, _, _ -> onDownload(url) }

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



    private fun getHtmlURL(): String {
        val dir = this.filesDir.absolutePath

        return "file:$dir/www/index.html"
    }


    private fun onDownload(url: String) {
        val decodedURL = Uri.decode(url)
        Log.i(dTag, "Url:")
        Log.i(dTag, url)
        Log.i(dTag, decodedURL)

        val builder = AlertDialog.Builder(this@MainActivity)
        builder.setTitle(dTag)
        if (isExternalStorageWritable()) {
            builder.setMessage("Do you want to save $sessionDataFileName to your 'Downloads' directory?")
            builder.setPositiveButton("Yes")    {      _, _ -> saveFileToDownloads(url) }
            builder.setNegativeButton("Cancel") { dialog, _ -> dialog.cancel()          }
        }
        else {
            builder.setMessage("Saving file is not possible.\nIf device is connected to another device try disconnecting it.")
            builder.setNegativeButton("Ok")     { dialog, _ -> dialog.cancel()          }
        }
        val dialog: AlertDialog = builder.create()
        dialog.show()
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
        val file = File(saveDir, sessionDataFileName)
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
            values.put(MediaStore.Downloads.TITLE, sessionDataFileName)
            values.put(MediaStore.Downloads.DISPLAY_NAME, sessionDataDownloadTitle)
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
