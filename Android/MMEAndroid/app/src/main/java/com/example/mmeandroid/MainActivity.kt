package com.example.mmeandroid

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Environment
import android.webkit.*
import androidx.appcompat.app.AlertDialog
import android.media.MediaScannerConnection
import android.util.Log
import java.io.*
import android.R.attr.path
import android.R.attr.mimeType
import android.R.attr.description
import androidx.core.content.ContextCompat.getSystemService
import android.app.DownloadManager
import android.content.ContentResolver
import android.content.ContentValues
import android.content.Context
import android.provider.MediaStore
import androidx.core.content.ContextCompat.getSystemService




class MainActivity : AppCompatActivity() {
    private fun isExternalStorageWritable(): Boolean {
        return Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED
    }
/*

    private fun downloadFile(fileData: String, filename: String, title: String) {

            var values = ContentValues()
            MediaStore.Downloads.MIME_TYPE

            values.put(MediaStore.Downloads.TITLE, filename);
            values.put((MediaStore.Downloads.DISPLAY_NAME, title)
            values.put(MediaStore.Downloads.MIME_TYPE, "text/plain")


            var uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
            var outputStream = contentResolver.openOutputStream(uri!!)
            val writer = outputStream.bufferedWriter()
            writer.write(fileData)
            writer.close()

        }*/


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

                    // getExternalStoragePublicDirectory deprecated
                    // addCompletedDownload deprecated
                    // Apps should instead contribute files to MediaStore.Downloads collection to make them available to user as part of Downloads
                    // content resolver

         /*           val dir = File("//sdcard//Download//")

                    val file = File(dir, fileName)

                    val downloadManager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager

                    downloadManager.addCompletedDownload(
                        file.name,
                        file.name,
                        true,
                        "text/plain",
                        file.absolutePath,
                        file.length(),
                        true
                    )*/



                    // val dir = this.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                    val file = File(dir, fileName)

                    file.createNewFile()

                    val writer = file.bufferedWriter()

                    writer.write(fileData)
                    writer.close()

              //      downloadFile(fileData, fileName, title)


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
