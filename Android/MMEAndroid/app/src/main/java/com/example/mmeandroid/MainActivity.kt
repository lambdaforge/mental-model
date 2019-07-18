package com.example.mmeandroid

import android.app.DownloadManager
import android.content.Context
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.net.Uri
import android.os.Environment
import android.webkit.*
import androidx.appcompat.app.AlertDialog
import android.content.Intent
import android.media.MediaScannerConnection
import android.provider.OpenableColumns
import android.util.Log
import android.webkit.DownloadListener
import androidx.core.content.ContextCompat.getSystemService
import android.media.MediaScannerConnection.OnScanCompletedListener
import java.io.*


class MainActivity : AppCompatActivity() {
    fun isExternalStorageWritable(): Boolean {
        return Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED
    }


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
        webView.loadUrl("file:///android_asset/index.html")

        webView.setDownloadListener { url, _, _, _, cLength -> // Check if working in actual app

            val filename = "mmetool_data.csv"
            val builder = AlertDialog.Builder(this@MainActivity)

            Log.i("File Download", "Url:")
            Log.i("File Download", url.toString())

            val searchString = "utf-8,"
            val offset = url.indexOf(searchString) + searchString.length
            val fileData = url.substring(offset)


            builder.setTitle("Download")
            if (isExternalStorageWritable()) {

                builder.setMessage("Do you want to save $filename?")

                builder.setPositiveButton("Yes") { _, _ ->

                    //val dir = this.getExternalFilesDir(null) // application directory -> save here? or downloads?
                    val dir = this.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                    val file = File(dir, filename)

                    file.createNewFile()

                    val writer = file.bufferedWriter()

                    writer.write(fileData)
                    writer.close()

                    // Refresh file display
                    MediaScannerConnection.scanFile(this, arrayOf(file.absolutePath),null)
                    {  path, uri ->
                        Log.v(
                            "File Download",
                            "file $path was scanned successfully: $uri"
                        )
                    }
                }
                builder.setNegativeButton("Cancel") { dialog, _ ->
                    dialog.cancel()
                }
            }
            else {
                builder.setMessage("Saving file is not possible")
                builder.setNegativeButton("Ok") { dialog, _ ->  dialog.cancel() }
            }

            val dialog: AlertDialog = builder.create()
            dialog.show()
        }
    }
}
