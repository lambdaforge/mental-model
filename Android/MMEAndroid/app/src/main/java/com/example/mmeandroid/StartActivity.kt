package com.example.mmeandroid

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.content.Intent
import android.util.Log
import android.view.View
import java.io.*
import android.content.SharedPreferences
import androidx.appcompat.app.AlertDialog


class StartActivity : AppCompatActivity() {

    private val aTag = "Asset Copying"
    private val lTag = "Change Activity"


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_start)

        val targetDir = this.filesDir.absolutePath
        val webFileDir = File("$targetDir/www")

        if (!webFileDir.exists()) {
            copyAssetsTo("www", targetDir)
        }
    }


    private fun copyAssetsTo(assetPath: String, targetDir: String) {
        val assetManager = this.assets
        var assets: Array<String>?
        try {
            assets = assetManager.list(assetPath)
            if (assets!!.isEmpty()) {
                copyFile(assetPath, targetDir)

                Log.i(aTag, "file: $assetPath")

            } else {
                val fullPath = "$targetDir/$assetPath"

                Log.i(aTag, "dir: $fullPath")

                val dir = File(fullPath)
                if (!dir.exists())  dir.mkdir()

                for (i in assets.indices) {
                    copyAssetsTo(assetPath + "/" + assets[i], targetDir)
                }
            }
        } catch (e: IOException) {

            val webFileDir = File("${this.filesDir.absolutePath}/www")
            if (webFileDir.exists()) webFileDir.delete()
            openInfoDialog("Initialization Error","Initializing app failed! You can try freeing up some space and restarting the app.")
        }

    }


    private fun copyFile(filename: String, targetDir: String) {

        try {
            val inStream = this.assets.open(filename)
            val newFileName =  "$targetDir/$filename"
            val outStream = FileOutputStream(newFileName)

            val buffer = ByteArray(1024)
            while (true) {
                val bf = inStream.read(buffer)
                if (bf == -1) break
                outStream.write(buffer, 0, bf)
            }
            inStream.close()
            outStream.flush()
            outStream.close()
        } catch (e: Exception) {
            Log.e(aTag, "Assets could not be copied", e)

            val webFileDir = File("${this.filesDir.absolutePath}/www")
            if (webFileDir.exists()) webFileDir.delete()
            openInfoDialog("Initialization Error","Initializing app failed! You can try freeing up some space and restarting the app.")
        }

    }


    fun changeToUpload(v: View) {
        startActivity(Intent(this@StartActivity, UploadActivity::class.java))
        Log.i(lTag, "Load upload layout")
    }


    fun changeToMain(v: View) {
        startActivity(Intent(this@StartActivity, MainActivity::class.java))
        Log.i(lTag, "Load main layout")
    }


    private fun openInfoDialog(title: String, message: String) {
        val builder = AlertDialog.Builder(this@StartActivity)
        builder.setTitle(title)
        builder.setMessage(message)
        builder.setPositiveButton("OK")    { dialog, _ -> dialog.cancel()          }

        val dialog: AlertDialog = builder.create()
        dialog.show()
    }
}
