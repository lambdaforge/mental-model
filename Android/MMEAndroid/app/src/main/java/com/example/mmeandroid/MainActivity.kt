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

    private fun isExternalStorageWritable(): Boolean {
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


        val dir = this.filesDir.absolutePath

        webView.loadUrl("file:$dir/www/index.html")

        webView.setDownloadListener { url, _, _, _, _ -> // Check if working in actual app

            val fileName = "mmetool_data.csv"
            val title = "MME tool data"
            val builder = AlertDialog.Builder(this@MainActivity)

            Log.i("File Download", "Url:")
            Log.i("File Download", url.toString())

            val searchString = "utf-8,"
            val offset = url.indexOf(searchString) + searchString.length
            val fileData = url.substring(offset)


            builder.setTitle("Download")
            if (isExternalStorageWritable()) {

                builder.setMessage("Do you want to save $fileName?")

                builder.setPositiveButton("Yes") { _, _ ->

                    val dir = File("//sdcard//Download//")
                    val file = File(dir, fileName)
                    val downloadManager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager

                    if ( android.os.Build.VERSION.SDK_INT <= android.os.Build.VERSION_CODES.P) {
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

                        var values = ContentValues()
                        values.put(MediaStore.Downloads.TITLE, fileName)
                        values.put(MediaStore.Downloads.DISPLAY_NAME, title)
                        values.put(MediaStore.Downloads.MIME_TYPE, "text/plain")


                        var uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                        var outputStream = contentResolver.openOutputStream(uri!!)
                        val writer = outputStream!!.bufferedWriter()
                        writer.write(fileData)
                        writer.close()
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
