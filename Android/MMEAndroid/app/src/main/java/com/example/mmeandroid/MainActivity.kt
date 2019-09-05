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
import android.content.Intent
import android.net.Uri
import androidx.core.app.ActivityCompat
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat


private const val MY_PERMISSIONS_REQUEST_WRITE_EXTERNAL_STORAGE: Int = 1


class MainActivity : AppCompatActivity() {


    private val sessionDataFileName = "mmetool_data.csv"
    private val sessionDataDownloadTitle = "mmetool_data"

    private var sessionData = ""

    //private val sessionDataDownloadTitle = "mtdata"


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

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        Log.i("ares", "$data")

    }

    private fun getHtmlURL(): String {
        val dir = this.filesDir.absolutePath

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

    override fun onRequestPermissionsResult(requestCode: Int,
                                            permissions: Array<String>, grantResults: IntArray) {
        when (requestCode) {
            MY_PERMISSIONS_REQUEST_WRITE_EXTERNAL_STORAGE -> {
                // If request is cancelled, the result arrays are empty.
                if ((grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED)) {
                    Log.i("Permissions", "WRITE_EXTERNAL_STORAGE granted")
                    saveFileToDownloadsOnAPILowerQ()
                } else {
                    Log.i("Permissions", "WRITE_EXTERNAL_STORAGE denied")
                }
                return
            }

            else -> {
                Log.i("Permissions", "Code $requestCode is unknown")
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
            Log.i("File Download", "Function not applicable for APIs < Q")
        }
    }


    private fun saveFileToDownloads(url: String) {

        Log.i("File Download", "Build version ${android.os.Build.VERSION.SDK_INT}")

        val decodedURL = Uri.decode(url)
        val offset = decodedURL.indexOf("utf-8,") + "utf-8,".length
        sessionData = decodedURL.substring(offset)

        if ( android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.Q) {
            Log.i("File Download", "Save data to \"Downloads\" via DownloadManager")


            if (ContextCompat.checkSelfPermission(this,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                Log.i("File Download", "Permission not granted yet. Ask permission.")
                ActivityCompat.requestPermissions(this@MainActivity,
                    arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE),
                    MY_PERMISSIONS_REQUEST_WRITE_EXTERNAL_STORAGE
                )
            } else {
                Log.i("File Download", "Permission granted")
                saveFileToDownloadsOnAPILowerQ()
            }
        }
        else { // working
            Log.i("File Download", "Save data to \"Downloads\" via MediaStore")
            saveFileToDownloadsOnAPISinceQ()
        }
    }

}
