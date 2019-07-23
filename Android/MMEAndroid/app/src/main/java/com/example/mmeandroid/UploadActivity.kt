package com.example.mmeandroid

import android.app.Activity
import android.content.ClipData
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.provider.OpenableColumns
import android.util.Log
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import android.widget.TextView
import java.io.*
import org.json.*;


private const val TEXT_IMPORT_CODE: Int = 0
private const val IMAGE_IMPORT_CODE: Int = 1
private const val AUDIO_IMPORT_CODE: Int = 2
private const val VIDEO_IMPORT_CODE: Int = 3



class UploadActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_upload)
    }

    fun uploadText(v: View) {

        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "text/*"
            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            action = Intent.ACTION_GET_CONTENT
        }

        startActivityForResult(intent, TEXT_IMPORT_CODE)
    }

    fun uploadVideo(v: View) {

        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "video/*"
            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            action = Intent.ACTION_GET_CONTENT
        }

        startActivityForResult(intent, VIDEO_IMPORT_CODE)
    }

    fun uploadAudio(v: View) {

        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "audio/*"
            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            action = Intent.ACTION_GET_CONTENT
        }

        startActivityForResult(intent, AUDIO_IMPORT_CODE)
    }

    fun uploadImage(v: View) {

        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "image/*"
            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            action = Intent.ACTION_GET_CONTENT
        }

        startActivityForResult(intent, IMAGE_IMPORT_CODE)
    }

    private fun getFileName(uri: Uri): String {
        var result: String? = null

        if (uri.scheme == "content") {
            val cursor = contentResolver.query(uri, null, null, null, null)
            try {
                if (cursor != null && cursor.moveToFirst()) {
                    result = cursor.getString(cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME))
                }
            } finally {
                cursor!!.close()
            }
        }
        if (result == null) {
            result = uri.path
            val cut = result!!.lastIndexOf('/')
            if (cut != -1) {
                result = result.substring(cut + 1)
            }
        }
        return result
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

    private fun copyFile(inStream: InputStream, outStream: FileOutputStream) {
        val buffer = ByteArray(1024)
        while (true) {
            val bf = inStream.read(buffer)
            if (bf == -1) break
            outStream.write(buffer, 0, bf)
        }
        inStream.close()
        outStream.flush()
        outStream.close()
    }


    private fun saveToMediaList(fileName: String, mediaType: String) {
        val path = this.filesDir.absolutePath + "/www/mediaSources.js"
        val content = readFile(path)
        val json = content.substringAfter('=')
        val prefix = content.substringBefore("{")

        Log.i("mlist", json)

        var jsonObj = JSONObject(json)
        var jsonList = jsonObj.getJSONArray(mediaType)
        jsonList.put(fileName)
        val newContent = prefix + jsonObj.toString(2)

        Log.i("mlist", newContent)

        val file = FileWriter(path)
        file.write(newContent)
        file.flush()
        file.close()

    }


    private fun handleSingleFile(uri: Uri, fileType: String) {
        val webDir = this.filesDir.absolutePath + "/www/"
        val fileDir = "$webDir$fileType/"

        Log.i("File Chooser", "Read $uri")
        val inStream = contentResolver.openInputStream(uri)!!

        val fileName = getFileName(uri)
        val newFileName = "$fileDir$fileName"

        Log.i("File Chooser", "Write $newFileName")
        val outStream = FileOutputStream(newFileName)

        copyFile(inStream, outStream)
        Log.i("File Chooser", "Written $newFileName")

        saveToMediaList(fileName, fileType)
    }


    private fun handleFileImport(data: Intent?, fileType: String) {
        if (data != null) {
            if (data.clipData != null) {
                val uris = data.clipData!!
                val count = uris.itemCount
                for (i in 0..count) handleSingleFile(uris.getItemAt(i).uri, fileType)
            } else {
                if (data.data != null)  handleSingleFile(data.data!!, fileType)
                else Log.i("File Chooser", "No File selected")
            }
        }
    }


    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {

        if (requestCode == IMAGE_IMPORT_CODE && resultCode == RESULT_OK ) {
            handleFileImport(data, "images")
        }
        if (requestCode == AUDIO_IMPORT_CODE && resultCode == RESULT_OK ) {
            handleFileImport(data, "audio")
        }
        if (requestCode == VIDEO_IMPORT_CODE && resultCode == RESULT_OK ) {
            handleFileImport(data, "video")
        }

    }

}


