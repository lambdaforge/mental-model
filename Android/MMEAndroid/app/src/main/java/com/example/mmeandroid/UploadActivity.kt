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
import android.widget.ListView
import android.widget.ArrayAdapter
import androidx.appcompat.app.AlertDialog


private const val IMAGE_IMPORT_CODE: Int = 1
private const val AUDIO_IMPORT_CODE: Int = 2
private const val VIDEO_IMPORT_CODE: Int = 3


class UploadActivity : AppCompatActivity() {

    private var listView = HashMap<String, ArrayAdapter<String>>()


    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_upload)

        // top bar with back button
        val actionBar = supportActionBar
        actionBar!!.setDisplayHomeAsUpEnabled(true)


        listView["images"] = ArrayAdapter(this, R.layout.list_row, ArrayList<String>())
        val imageList = findViewById<ListView>(R.id.ImageList)
        imageList.adapter =  listView["images"]

        listView["video"] = ArrayAdapter(this, R.layout.list_row, ArrayList<String>())
        val videoList = findViewById<ListView>(R.id.VideoList)
        videoList.adapter =  listView["video"]

        listView["audio"] = ArrayAdapter(this, R.layout.list_row, ArrayList<String>())
        val audioList = findViewById<ListView>(R.id.AudioList)
        audioList.adapter =  listView["audio"]
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

        if (uri.scheme == "content") {
            val cursor = contentResolver.query(uri, null, null, null, null)
            try {
                if (cursor != null && cursor.moveToFirst()) {
                    fileName = cursor.getString(cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME))
                    Log.i("chooser", fileName)

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

    private fun openInfoDialog(title: String, message: String) {
        val builder = AlertDialog.Builder(this@UploadActivity)
        builder.setTitle(title)
        builder.setMessage(message)
        builder.setPositiveButton("OK")    { dialog, _ -> dialog.cancel()          }

        val dialog: AlertDialog = builder.create()
        dialog.show()
    }

    private fun copyFile(inStream: InputStream, outStream: FileOutputStream) {
        val buffer = ByteArray(1024)
        while (true) {
            val bf = inStream.read(buffer)
            if (bf == -1) break
            try {
                outStream.write(buffer, 0, bf)
            } catch (e: IOException) {
                openInfoDialog("File Import", "Importing file failed!")
                break
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
        val webDir = this.filesDir.absolutePath + "/www"
        val fileDir = "$webDir/$fileType"
        val fileName = getFileName(uri)
        val newFileName = "$fileDir/$fileName"

        val pos = listView[fileType]?.getPosition(fileName)

        if( pos == -1 ) {
            listView[fileType]?.add(fileName)
            if (!File(newFileName).exists()) {
                Log.i("File Chooser", "Read $uri")
                val inStream = contentResolver.openInputStream(uri)!!

                Log.i("File Chooser", "Write $newFileName")
                val outStream = FileOutputStream(newFileName)

                copyFile(inStream, outStream)
                Log.i("File Chooser", "Written $newFileName")

                saveToMediaList(fileName, fileType)
            }
            else {
                Log.i("File Chooser", "File $fileName already exists in $fileDir")
            }

        } else {
            Log.i("File Chooser", "File $fileName already in list view")
        }
    }

    private fun handleFileImport(data: Intent?, fileType: String) {
        if (data != null) {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN && data.clipData != null) {
                val uris = data.clipData!!
                val count = uris.itemCount - 1
                for (i in 0..count) handleSingleFile(uris.getItemAt(i).uri, fileType)

            } else {
                if (data.data != null)  handleSingleFile(data.data!!, fileType)
                else Log.i("File Chooser", "No File selected")
            }
        }
        else Log.i("File Chooser", "No data sent")
    }

}


