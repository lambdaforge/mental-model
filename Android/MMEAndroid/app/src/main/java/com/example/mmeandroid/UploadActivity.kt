package com.example.mmeandroid

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
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
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.text.trimmedLength



private const val IMAGE_IMPORT_CODE: Int = 1
private const val AUDIO_IMPORT_CODE: Int = 2
private const val VIDEO_IMPORT_CODE: Int = 3

private const val PERMISSIONS_REQUEST_READ_EXTERNAL_STORAGE: Int = 4


class UploadActivity : AppCompatActivity() {

    private var listView = HashMap<String, ArrayAdapter<String>>()

    private val tag = "File Import"
    private val pTag = "Permissions"

    private val warningOnImportFailure = "File import failed! Please choose another file or try again later."
    private val webDirSubPath = "/www"
    private val mediaSourcesSubPath = "$webDirSubPath/mediaSources.js"

    private var currentImportFileType = ""
    private var currentIntent: Intent? = null


    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_upload)

        // Top bar with back button
        setSupportActionBar(findViewById(R.id.toolbar_upload))
        val actionBar = supportActionBar
        actionBar!!.setDisplayHomeAsUpEnabled(true)

        // Connect data arrays and table views
        prepareListViewFor("images", R.id.ImageList)
        prepareListViewFor("video", R.id.VideoList)
        prepareListViewFor("audio", R.id.AudioList)
    }


    override fun onOptionsItemSelected(item: MenuItem): Boolean { // Back button
       // val intent = Intent(applicationContext, StartActivity::class.java)
        //startActivityForResult(intent, 0)

        return when (item.itemId) {
            android.R.id.home -> {
                // API 5+ solution
                onBackPressed()
                true
            }

            else -> super.onOptionsItemSelected(item)
        }

    }


    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        currentIntent = data
        if (resultCode == RESULT_OK) {
            currentImportFileType =  when (requestCode) {
                IMAGE_IMPORT_CODE -> { "images" }
                AUDIO_IMPORT_CODE -> { "audio"  }
                VIDEO_IMPORT_CODE -> { "video"  }
                else -> { return }
            }

            handleFileImportsOnPermission()
        }
    }


    override fun onRequestPermissionsResult(requestCode: Int,
                                            permissions: Array<String>, grantResults: IntArray) {
        when (requestCode) {
            PERMISSIONS_REQUEST_READ_EXTERNAL_STORAGE -> {
                if ((grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED)) {
                    Log.i(pTag, "READ_EXTERNAL_STORAGE granted")
                    handleFileImports()
                } else {
                    Log.i(pTag, "READ_EXTERNAL_STORAGE denied")
                }
                return
            }
            else -> {
                Log.i(pTag, "Code $requestCode is unknown")
            }
        }
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


    private fun prepareListViewFor(fileType: String, viewID: Int) {
        listView[fileType] = ArrayAdapter(this, R.layout.list_row, ArrayList<String>())
        val list = findViewById<ListView>(viewID)
        list.adapter = listView[fileType]
    }


    private fun openPicker(fileType: String): Intent {

        val openIntent = Intent(Intent.ACTION_GET_CONTENT)

        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.JELLY_BEAN_MR1 ) {
            openIntent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
        }

        openIntent.addCategory(Intent.CATEGORY_OPENABLE)
        openIntent.type = fileType

        return openIntent

    }


    private fun getFileName(uri: Uri): String {
        var fileName = ""

        if (uri.scheme == "content") {
            val cursor = contentResolver.query(uri, null, null, null, null)
            try {
                if (cursor != null && cursor.moveToFirst()) {
                    fileName = cursor.getString(cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME))
                    Log.i(tag, fileName)

                }
            } finally {
                cursor!!.close()
            }
        }
        if (fileName == "") {

            fileName = uri.path ?: ""
            val cut = fileName.lastIndexOf('/')
            if (cut != -1) {
                fileName = fileName.substring(cut + 1)
            }
        }
        return fileName
    }

    
    // Returns content of file or null on failure
    private fun readMediaSourcesFile(fileName: String): String? {
        var fileContent: String?

        try {
            val buffer = StringBuffer("")
            val fis = FileInputStream(fileName)
            while (true) {
                    val ch = fis.read()
                    if (ch == -1) break
                buffer.append(ch.toChar())
            }
            fileContent = String(buffer)
        }
        catch (e: Exception) {
            openInfoDialog(tag, warningOnImportFailure)
            Log.e(tag, "Failure while reading file $fileName!")
            e.printStackTrace()

            fileContent = null
        }

        return fileContent
    }


    private fun openInfoDialog(title: String, message: String) {
        val builder = AlertDialog.Builder(this@UploadActivity)
        builder.setTitle(title)
        builder.setMessage(message)
        builder.setPositiveButton("OK")    { dialog, _ -> dialog.cancel()          }

        val dialog: AlertDialog = builder.create()
        dialog.show()
    }


    private fun copyFile(inStream: InputStream, outStream: FileOutputStream): Boolean {
        val buffer = ByteArray(1024)
        try {
            while (true) {
                val bf = inStream.read(buffer)
                if (bf == -1) break
                outStream.write(buffer, 0, bf)
            }
        } catch (e: IOException) {
            Log.e(tag, "Failure while copying file!")
            e.printStackTrace()
            return false
        } finally {
            inStream.close()
            outStream.flush()
            outStream.close()
        }
        return true
    }


    private fun saveToMediaList(fileName: String, mediaType: String): Boolean {
        val path = this.filesDir.absolutePath + mediaSourcesSubPath
        val content = readMediaSourcesFile(path)?: return false

        val json = content.substringAfter('=')
        val prefix = content.substringBefore("{")

        if (json.trimmedLength() < 1 || prefix.trimmedLength() < 1) {
            openInfoDialog(tag, warningOnImportFailure)
            Log.e(tag, "Content of mediaSources.js file is erroneous. Content must have format 'mediaSources = JSONOBJECT'.")
            return false
        }

        val jsonObj: JSONObject?
        val jsonList: JSONArray?

        try {
             jsonObj = JSONObject(json)
             jsonList = jsonObj.getJSONArray(mediaType)
        }
        catch (e: ClassCastException) {
            Log.e(tag, "Content of mediaSources.js must have format 'mediaSources = JSONOBJECT'. Property '$mediaType' of JSON object must exist and contain a list of file names.")
            return false
        }

        jsonList.put(fileName)
        val newContent = prefix + jsonObj.toString(2)

        val file = FileWriter(path)
        try {
            file.write(newContent)
        }
        catch (e: Exception){
            Log.e(tag, "Writing to $path failed!")
            return false
        }
        finally {
            file.flush()
            file.close()
        }

        Log.i(tag, "Media sources have been successfully updated. New content is:")
        Log.i(tag, newContent)

        return true
    }


    private fun handleSingleFile(uri: Uri, fileType: String) {

        val webDir = this.filesDir.absolutePath + webDirSubPath
        val fileDir = "$webDir/$fileType"
        val fileName = getFileName(uri)
        val newFileName = "$fileDir/$fileName"

        if (fileName == "") {
            openInfoDialog(tag, warningOnImportFailure)
            Log.e(tag, "Importing file '$fileName' failed since no filename could be established")
        }
        else {
            Log.i(tag, "Import file: $fileName")

            val pos = listView[fileType]?.getPosition(fileName)
            if( pos == -1 ) {
                if (!File(newFileName).exists()) {
                    Log.i(tag, "Read $uri")
                    val inStream = contentResolver.openInputStream(uri)!!

                    Log.i(tag, "Write $newFileName")
                    val outStream = FileOutputStream(newFileName)
                    val copySuccess = copyFile(inStream, outStream)
                    val registerSuccess = saveToMediaList(fileName, fileType)

                    if( copySuccess && registerSuccess ) {
                        listView[fileType]?.add(fileName)
                        Log.i(tag, "Written $newFileName")
                    }
                    else {
                        Log.i(tag, "File could not be imported.")
                        openInfoDialog(tag, warningOnImportFailure)
                    }
                }
                else {
                    val msg = "File $fileName has already been imported!"
                    Log.i(tag, msg)
                    openInfoDialog(tag, msg)
                }

            } else {
                Log.i(tag, "File $fileName already in list view.")
            }
        }

    }


    private fun handleFileImportsOnPermission() {
        if (ContextCompat.checkSelfPermission(this,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            Log.i(tag, "Permission not granted yet. Ask permission.")
            ActivityCompat.requestPermissions(this@UploadActivity,
                arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE),
                PERMISSIONS_REQUEST_READ_EXTERNAL_STORAGE
            )
        } else {
            Log.i(tag, "Permission granted")
            handleFileImports()
        }

    }


    private fun handleFileImports() {
        if (currentIntent != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN && currentIntent?.clipData != null) {
                val uris = currentIntent?.clipData!!
                val count = uris.itemCount - 1
                for (i in 0..count) handleSingleFile(uris.getItemAt(i).uri, currentImportFileType)

            } else {
                if (currentIntent?.data != null) handleSingleFile(currentIntent?.data!!, currentImportFileType)
                else Log.i(tag, "No File selected.")
            }
        }
        else Log.i(tag, "No data sent.")
    }

}


