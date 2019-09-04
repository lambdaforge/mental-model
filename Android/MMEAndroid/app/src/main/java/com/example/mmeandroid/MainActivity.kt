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
import android.content.Intent
import android.webkit.DownloadListener
import android.net.Uri
import androidx.core.app.ComponentActivity
import androidx.core.app.ComponentActivity.ExtraData
import androidx.core.content.ContextCompat.getSystemService
import android.icu.lang.UCharacter.GraphemeClusterBreak.T




class MainActivity : AppCompatActivity() {


    private val sessionDataFileName = "mmetool_data.csv"
    //private val sessionDataDownloadTitle = "mmetool_data"
    private val sessionDataDownloadTitle = "mtdata"


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
        webView.setDownloadListener(DownloadListener { url, userAgent, contentDisposition, mimetype, contentLength ->
            Log.i("DL","Listener")
            Log.i("DL","url: $url")
            Log.i("DL","agent: $userAgent")
            Log.i("DL","disp: $contentDisposition")
            Log.i("DL","type: $mimetype")
            Log.i("DL","length: $contentLength")



            val dec = Uri.decode(url)
            Log.i("DL","dec: $dec")


         //   val i = Intent(Intent.ACTION_VIEW)
          //  i.data = Uri.parse(url)
          //  Log.i("DL","uri: ${i.data}")
        //    startActivity(i)
            onDownload(url)
        })
   //     webView.setDownloadListener { url, _, _, _, _ -> onDownload(url) }

    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        Log.i("ares", "$data")

    }

    private fun getHtmlURL(): String {
        val dir = this.filesDir.absolutePath
        /*
        Log.i("vfrgr", dir)
        var file = File(dir, "www")
        Log.i("frewr", file.exists().toString())*/

        return "file:$dir/www/index.html"
    }

    private fun onDownload(url: String) {
        val decodedURL = Uri.decode(url)
        Log.i("File Download", "Url:")
        Log.i("File Download", url)
        Log.i("File Download", decodedURL)

        val builder = AlertDialog.Builder(this@MainActivity)
        builder.setTitle("Download")
        if (isExternalStorageWritable()) {
            builder.setMessage("Do you want to save $sessionDataFileName?")
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

    private fun saveFileToDownloads(url: String) {

        Log.i("File Download", "Build version ${android.os.Build.VERSION.SDK_INT}")

        val decodedURL = Uri.decode(url)
        val offset = decodedURL.indexOf("utf-8,") + "utf-8,".length
        val fileData = decodedURL.substring(offset)
        val uri = Uri.parse(url)

        if ( android.os.Build.VERSION.SDK_INT <= android.os.Build.VERSION_CODES.P) {
            Log.i("File Download", "Save data to \"Downloads\" via DownloadManager")

            val saveDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val file = File(saveDir, sessionDataFileName)
            file.writeText(fileData)

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
        else {
            Log.i("File Download", "Save data to \"Downloads\" via MediaStore")

            val values = ContentValues()
            values.put(MediaStore.Downloads.TITLE, sessionDataFileName)
            values.put(MediaStore.Downloads.DISPLAY_NAME, sessionDataDownloadTitle)
            values.put(MediaStore.Downloads.MIME_TYPE, "text/csv")

            val uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
            val outputStream = contentResolver.openOutputStream(uri!!)
            val writer = outputStream!!.bufferedWriter()
            writer.write(fileData)
            writer.close()
        }
    }

}
