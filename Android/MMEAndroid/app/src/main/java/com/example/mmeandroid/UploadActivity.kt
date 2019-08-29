package com.example.mmeandroid

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.util.Log
import android.view.MenuItem
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import java.io.*
import org.json.*


private const val IMAGE_IMPORT_CODE: Int = 1
private const val AUDIO_IMPORT_CODE: Int = 2
private const val VIDEO_IMPORT_CODE: Int = 3


class UploadActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_upload)
        val actionBar = supportActionBar
        actionBar!!.setDisplayHomeAsUpEnabled(true)
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

    override fun onOptionsItemSelected(item: MenuItem): Boolean { // Back button
        val intent = Intent(applicationContext, StartActivity::class.java)
        startActivityForResult(intent, 0)
        return true
    }

    fun uploadVideo(v: View) {
        val intent = openPicker("video/*")
        startActivityForResult(intent, VIDEO_IMPORT_CODE)
    }

    fun uploadAudio(v: View) {
        val intent = openPicker("audio/*")
        startActivityForResult(intent, AUDIO_IMPORT_CODE)
    }

    fun uploadImage(v: View) {
        val intent = openPicker("image/*")
        startActivityForResult(intent, IMAGE_IMPORT_CODE)
    }

    private fun openPicker(fileType: String): Intent {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT)
        intent.apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = fileType
            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            action = Intent.ACTION_GET_CONTENT
        }
        return intent
    }

    private fun getFileName(uri: Uri): String {
        var fileName: String? = null

        val mimeType = contentResolver.getType(uri)
        val extension = mimeType!!.substringAfter('/')

        if (uri.scheme == "content") {
            val cursor = contentResolver.query(uri, null, null, null, null)
            try {
                if (cursor != null && cursor.moveToFirst()) {
                    fileName = cursor.getString(cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME))
                }
            } finally {
                cursor!!.close()
            }
        }
        if (fileName == null) {
            fileName = uri.path
            val cut = fileName!!.lastIndexOf('/')
            if (cut != -1) {
                fileName = fileName.substring(cut + 1)
            }
        }

        if (!fileName.toLowerCase().endsWith(extension)) {
            fileName = "$fileName.$extension"
        }
        return fileName
    }

    private fun readFile(fileName: String): String {
        val fileContent = StringBuffer("")
        val fis: FileInputStream
        try {
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
            try {
                outStream.write(buffer, 0, bf)
            } catch (e: IOException) {

            }
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

        val jsonObj = JSONObject(json)
        val jsonList = jsonObj.getJSONArray(mediaType)
        jsonList.put(fileName)
        val newContent = prefix + jsonObj.toString(2)

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

}


