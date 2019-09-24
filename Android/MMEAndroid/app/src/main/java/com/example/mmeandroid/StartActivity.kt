package com.example.mmeandroid

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.content.Intent
import android.media.AudioManager
import android.util.Log
import java.io.*
import androidx.appcompat.app.AlertDialog


class StartActivity : AppCompatActivity() {

    private val aTag = "Asset Copying"

    private val mediaListFile = "mediaSources.js" // will only be copied once

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val targetDir = this.filesDir.absolutePath
        copyAssetsTo("www", targetDir)

        startActivity(Intent(this@StartActivity, HomeActivity::class.java))
    }


    private fun copyAssetsTo(assetPath: String, targetDir: String) {
        val assetManager = this.assets
        var assets: Array<String>?
        try {
            assets = assetManager.list(assetPath)
            if (assets!!.isEmpty()) {

                copyFile(assetPath, targetDir)

                Log.i(aTag, "file: $assetPath")

            } else { // file is directory
                val fullPath = "$targetDir/$assetPath"

                Log.i(aTag, "dir: $fullPath")

                val dir = File(fullPath)
                if (!dir.exists())  dir.mkdir()

                for (i in assets.indices) {
                    val fileName = assets[i]
                    val targetPath = File("$targetDir/$assetPath/$fileName")

                    // Avoid overwriting changes made in this file
                    if(!(fileName == mediaListFile && targetPath.exists()))
                      copyAssetsTo( "$assetPath/$fileName", targetDir)
                }
            }
        } catch (e: IOException) {

            val webFileDir = File("${this.filesDir.absolutePath}/www")
            if (webFileDir.exists()) webFileDir.delete()
            openExitDialog()
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

            openExitDialog()
        }

    }

    private fun openExitDialog() {
        val builder = AlertDialog.Builder(this@StartActivity)
        builder.setTitle("Initialization Error")
        builder.setMessage("Initialization of app failed! You can try freeing up some space and restarting the app.")
        builder.setPositiveButton("OK")    { dialog, _ ->
            dialog.cancel()
            super.finish() // Exit App
        }

        val dialog: AlertDialog = builder.create()
        dialog.show()
    }
}
