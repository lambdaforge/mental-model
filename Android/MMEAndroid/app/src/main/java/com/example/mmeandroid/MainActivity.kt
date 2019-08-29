package com.example.mmeandroid

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


class MainActivity : AppCompatActivity() {


    private val sessionDataFileName = "mmetool_data.csv"
    private val sessionDataDownloadTitle = "MME tool data"


    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val webView: WebView = findViewById(R.id.webview)
        webView.settings.javaScriptEnabled = true
        webView.settings.databaseEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.allowContentAccess = true
        webView.settings.allowFileAccess = true
        webView.webViewClient = WebViewClient()
        webView.loadUrl(getHtmlURL())
        webView.setDownloadListener { url, _, _, _, _ -> onDownload(url) }

    }

    private fun getHtmlURL(): String {
        val dir = this.filesDir.absolutePath
        Log.i("vfrgr", dir)
        var file = File(dir, "www")
        Log.i("frewr", file.exists().toString())

        return "file:$dir/www/index.html"
    }

    private fun onDownload(url: String) {
        Log.i("File Download", "Url:")
        Log.i("File Download", url)

        val builder = AlertDialog.Builder(this@MainActivity)
        builder.setTitle("Download")
        if (isExternalStorageWritable()) {
            builder.setMessage("Do you want to save $sessionDataFileName?")
            builder.setPositiveButton("Yes")    {      _, _ -> saveFileToDownloads(url) }
            builder.setNegativeButton("Cancel") { dialog, _ -> dialog.cancel()          }
        }
        else {
            builder.setMessage("Saving file is not possible")
            builder.setNegativeButton("Ok")     { dialog, _ -> dialog.cancel()          }
        }
        val dialog: AlertDialog = builder.create()
        dialog.show()
    }

    private fun isExternalStorageWritable(): Boolean {
        return Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED
    }

    private fun saveFileToDownloads(url: String) {

        if ( android.os.Build.VERSION.SDK_INT <= android.os.Build.VERSION_CODES.P) {

            val dir = File("//sdcard//Download//")
            val file = File(dir, sessionDataFileName)
            val downloadManager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            downloadManager.addCompletedDownload(
                file.name,
                file.name,
                true,
                "text/plain",
                file.absolutePath,
                file.length(),
                true
            )
        }
        else {

            val offset = url.indexOf("utf-8,") + "utf-8,".length
            val fileData = url.substring(offset)

            val values = ContentValues()
            values.put(MediaStore.Downloads.TITLE, sessionDataFileName)
            values.put(MediaStore.Downloads.DISPLAY_NAME, sessionDataDownloadTitle)
            values.put(MediaStore.Downloads.MIME_TYPE, "text/plain")

            val uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
            val outputStream = contentResolver.openOutputStream(uri!!)
            val writer = outputStream!!.bufferedWriter()
            writer.write(fileData)
            writer.close()
        }
    }

}
