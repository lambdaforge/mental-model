package com.example.mmeandroid

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Environment
import android.webkit.*
import androidx.appcompat.app.AlertDialog
import android.media.MediaScannerConnection
import android.util.Log
import java.io.*


class MainActivity : AppCompatActivity() {
    private fun isExternalStorageWritable(): Boolean {
        return Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED
    }

/*
    private fun readFile(fileName: String): String {
        val fileContent = StringBuffer("")
        val fis: FileInputStream
        try {
            Log.i("rf", fileName)
            fis = FileInputStream(fileName)
            try {
                while (true) {
                    val ch = fis.read()
                    if (ch == -1) break
                    fileContent.append(ch.toChar())
                }

            } catch (e: IOException) {
                e.printStackTrace()
            }

        } catch (e: FileNotFoundException) {
            e.printStackTrace()
        }

        return String(fileContent)
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
