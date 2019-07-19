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

    private fun copyAssetsTo(assetPath: String, targetDir: String) {
        val assetManager = this.assets
        var assets: Array<String>? = null
        try {
            assets = assetManager.list(assetPath)
            if (assets!!.isEmpty()) {
                copyFile(assetPath, targetDir)
            } else {
                val fullPath = "$targetDir/$assetPath"
                val dir = File(fullPath)
                if (!dir.exists())
                    dir.mkdir()
                for (i in assets.indices) {
                    copyAssetsTo(assetPath + "/" + assets[i], targetDir)
                }
            }
        } catch (ex: IOException) {
            Log.e("tag", "I/O Exception", ex)
        }

    }

    private fun copyFile(filename: String, targetDir: String) {
        val assetManager = this.assets

        var inStream: InputStream? = null
        var outStream: OutputStream? = null
        try {
            inStream = assetManager.open(filename)
            val newFileName =  "$targetDir/$filename"
            outStream = FileOutputStream(newFileName)

            val buffer = ByteArray(1024)
            var read: Int
            while (true) {
                val bf = inStream.read(buffer)
                if (bf == -1) break
                outStream.write(buffer, 0, bf)
            }
            inStream.close()
            outStream.flush()
            outStream.close()
        } catch (e: Exception) {
            Log.e("tag", e.message)
        }

    }

    @Throws(IOException::class)
    private fun copyFile(inStream: InputStream, out: OutputStream) {
        val buffer = ByteArray(1024)
        while (true) {
            val read = inStream.read(buffer)
            if (read == -1) break
            out.write(buffer, 0, read)
        }
    }

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
        copyAssetsTo("www", dir)

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
