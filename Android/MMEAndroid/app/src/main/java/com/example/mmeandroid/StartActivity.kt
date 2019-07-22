package com.example.mmeandroid

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import androidx.core.content.ContextCompat.startActivity
import android.content.Intent
import android.util.Log
import android.view.View
import java.io.*


class StartActivity : AppCompatActivity() {

    private fun copyAssetsTo(assetPath: String, targetDir: String) {
     //   Log.i("assets", targetDir)
        val assetManager = this.assets
        var assets: Array<String>? = null
        try {
            assets = assetManager.list(assetPath)
            if (assets!!.isEmpty()) {
                copyFile(assetPath, targetDir)
                Log.i("assets", "file: $assetPath")
            } else {
                val fullPath = "$targetDir/$assetPath"
                Log.i("assets", "dir: $fullPath")
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
            //   var read: Int
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


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_start)

        val dir = this.filesDir.absolutePath
        copyAssetsTo("www", dir)
    }

    fun changeToUpload(v: View) {
        startActivity(Intent(this@StartActivity, UploadActivity::class.java))
        Log.i("Content ", "Load upload layout")
    }

    fun changeToMain(v: View) {
        startActivity(Intent(this@StartActivity, MainActivity::class.java))
        Log.i("Content ", "Load main layout")
    }
}
