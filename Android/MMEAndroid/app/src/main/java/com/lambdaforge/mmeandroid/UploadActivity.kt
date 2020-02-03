package com.lambdaforge.mmeandroid

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.OpenableColumns
import android.util.Log
import android.view.MenuItem
import android.view.View
import android.widget.ArrayAdapter
import android.widget.ListView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.text.trimmedLength
import org.json.JSONArray
import org.json.JSONObject
import java.io.*


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

    private var mediaListPrefix: String? = null
    private var mediaList: JSONObject? = null
    private var mediaListing = HashMap<String, JSONArray?>()



    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_upload)

        // Top bar with back button
        setSupportActionBar(findViewById(R.id.toolbar_upload))
        val actionBar = supportActionBar
        actionBar!!.setDisplayHomeAsUpEnabled(true)
        actionBar.setDisplayShowTitleEnabled(false)

        // Read media list file
        initMediaList()

        // Connect data arrays and table views
        prepareListViewFor("images", R.id.ImageList)
        prepareListViewFor("video", R.id.VideoList)
        prepareListViewFor("audio", R.id.AudioList)
    }


    override fun onOptionsItemSelected(item: MenuItem): Boolean { // Back button

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

        super.onActivityResult(requestCode, resultCode, data)

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
        openPicker("video/*", VIDEO_IMPORT_CODE)
    }


    fun uploadAudio(v: View) {
        openPicker("audio/*", AUDIO_IMPORT_CODE)
    }


    fun uploadImage(v: View) {
        openPicker("image/*", IMAGE_IMPORT_CODE)
    }

    fun startSession(v: View) {
        startActivity(Intent(this@UploadActivity, MainActivity::class.java))
        Log.i(tag, "Load main layout")
    }


    private fun prepareListViewFor(fileType: String, viewID: Int) {
        listView[fileType] = ArrayAdapter(this, R.layout.list_row, ArrayList<String>())
        val list = findViewById<ListView>(viewID)
        list.adapter = listView[fileType]

        list.isFastScrollAlwaysVisible = true

    }


    private fun openPicker(fileType: String, Icode: Int) {

        val intent: Intent
        if (Build.VERSION.SDK_INT < 19) {
            intent = Intent(Intent.ACTION_GET_CONTENT)
            if (Build.VERSION.SDK_INT > Build.VERSION_CODES.JELLY_BEAN_MR1 ) {
                intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            }
            intent.type = fileType
            startActivityForResult(
                Intent.createChooser(
                    intent,"Select File"
                ), Icode
            )
        } else {
            intent = Intent(Intent.ACTION_OPEN_DOCUMENT)
            intent.type = fileType
            intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            startActivityForResult(intent, Icode)
        }
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
        val fileContent: String?

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
            Dialog(this@UploadActivity)
                .showInformation(tag, warningOnImportFailure)
            throw java.lang.Exception("Failure while reading media sources file $fileName!")
        }

        return fileContent
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
            return false
        } finally {
            inStream.close()
            outStream.flush()
            outStream.close()
        }
        return true
    }


    private fun initMediaList() {
        val path = this.filesDir.absolutePath + mediaSourcesSubPath
        val content = readMediaSourcesFile(path)

        val json = content!!.substringAfter('=')
        val prefix = content.substringBefore("{")

        if (json.trimmedLength() < 1 || prefix.trimmedLength() < 1) {
            throw java.lang.Exception("Content of media sources file must have format 'mediaSources = JSONOBJECT'.")
        }

        mediaListPrefix = prefix
        try {
            mediaList = JSONObject(json)
        }
        catch (e: ClassCastException) {
            throw java.lang.Exception( "Content of media sources file must have format 'mediaSources = JSONOBJECT'.")

        }
        try {
            mediaListing["audio"] = mediaList!!.getJSONArray("audio")
            mediaListing["video"] = mediaList!!.getJSONArray("video")
            mediaListing["images"] = mediaList!!.getJSONArray("images")
        }
        catch (e: ClassCastException) {
            throw java.lang.Exception("Properties 'audio', 'video' and 'images' must exist in JSON object and contain a list of file names.")
        }

    }


    private fun saveMediaListFile(): Boolean {
        val path = this.filesDir.absolutePath + mediaSourcesSubPath
        val newContent = mediaListPrefix + mediaList!!.toString(2)

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


    private fun updateMediaListFile(fileName: String, mediaType: String): Boolean {

        if (!fileInMediaList(fileName, mediaType)) {
            mediaListing[mediaType]!!.put(fileName)
            return saveMediaListFile()
        }
        else {
            Log.i(tag, "Filename already listed in media list")
        }

        return true
    }


    private fun fileInMediaList(fileName: String, mediaType: String): Boolean {
        return positionInMediaList(fileName, mediaType) != -1
    }


    private fun positionInMediaList(fileName: String, mediaType: String): Int {
        var index = -1
        for (i in 0 until mediaListing[mediaType]!!.length())
            if (mediaListing[mediaType]!!.getString(i) == fileName)
                index = i
        return index
    }


    private fun deleteFromMediaList(fileName: String, mediaType: String) {
        val mlPos = positionInMediaList(fileName, mediaType)
        if( mlPos != -1 ) {
            val list = JSONArray()
            for (i in 0 until mediaListing[mediaType]!!.length()) {
                // Excluding the item at position
                if (i != mlPos) {
                    list.put(mediaListing[mediaType]!!.get(i))
                }
            }

            mediaListing[mediaType] = list
            mediaList!!.put(mediaType, mediaListing[mediaType])
            Log.i(tag, "New media list: $mediaList")
        }
    }


    private fun fileInListView(fileName: String, mediaType: String): Boolean {
        return listView[mediaType]!!.getPosition(fileName) != -1

    }


    private fun importFile(uri: Uri, mediaType: String) {
        val fileDir = "${this.filesDir.absolutePath + webDirSubPath}/$mediaType"
        val fileName = getFileName(uri)
        val targetFilePath = "$fileDir/$fileName"
        val dialog = Dialog(this@UploadActivity)

        val newFile = File(targetFilePath)
        if( newFile.exists() ) { // try to avoid IOExceptions
            applicationContext.deleteFile(newFile.name)
            deleteFromMediaList(fileName, mediaType)
            saveMediaListFile()
            Log.i(tag, "Deleted duplicate file.")
        }

        val progressDialog = dialog.showInformationNoCancel(tag, "Importing $fileName...")

        Log.i(tag, "Read $uri")
        val inStream = contentResolver.openInputStream(uri)!!

        Log.i(tag, "Write $targetFilePath")
        val outStream = FileOutputStream(targetFilePath)
        val copySuccess = copyFile(inStream, outStream)

        progressDialog.cancel()

        if( copySuccess ) {
            Log.i(tag, "Written $targetFilePath")

            val registerSuccess = updateMediaListFile(fileName, mediaType)

            if( registerSuccess ) {
                Log.i(tag, "Media file updated")
                if( !fileInListView(fileName, mediaType) ) listView[mediaType]!!.add(fileName)
            }
            else {
                Log.w(tag, "File could not be imported. Registering to media list failed.")
                dialog.showInformation(tag, warningOnImportFailure)
            }
        }
        else {
            Log.w(tag, "File could not be imported. Copying file failed.")
            dialog.showInformation(tag, warningOnImportFailure)
        }
    }


    private fun handleSingleFile(uri: Uri, mediaType: String) {

        val webDir = this.filesDir.absolutePath + webDirSubPath
        val fileName = getFileName(uri)
        val dialog = Dialog(this@UploadActivity)

        if (fileName == "") {
            dialog.showInformation(tag, warningOnImportFailure)
            Log.e(tag, "Importing file '$fileName' failed since no filename could be established")
        }
        else {
            Log.i(tag, "Import file: $fileName")

            val fileExists = File("$webDir/$mediaType/$fileName").exists()
            if( !(fileExists && fileInMediaList(fileName, mediaType)) ) {
                importFile(uri, mediaType)
            }
            else {
                Log.w(tag, "File $fileName already exists in directory")
                val msg = "File $fileName has already been imported! Do you want to overwrite the existing file?"
                dialog.showDoOrNotChoice("File Import", msg) { importFile(uri, mediaType) }
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


