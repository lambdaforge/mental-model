package com.example.mmeandroid

import android.content.ContentProvider
import android.content.res.AssetFileDescriptor
import android.net.Uri
import java.io.FileNotFoundException
import java.io.IOException
import android.content.ContentValues
import android.database.Cursor
import android.util.Log
import android.webkit.MimeTypeMap
import androidx.core.content.FileProvider
import android.database.MatrixCursor
import android.provider.OpenableColumns
import android.content.res.AssetManager
import android.icu.lang.UCharacter.GraphemeClusterBreak.T
import android.icu.lang.UCharacter.GraphemeClusterBreak.T
import android.icu.lang.UCharacter.GraphemeClusterBreak.T








class AssetProvider : ContentProvider() {

    private val tag = "AP"

    private val COLUMNS = arrayOf(OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE)

    @Throws(FileNotFoundException::class)
    override fun openAssetFile(uri: Uri, mode: String): AssetFileDescriptor {
        val am = context!!.assets
        val filename = uri.lastPathSegment ?: throw FileNotFoundException()
        var afd: AssetFileDescriptor? = null
        try {
            afd = am.openFd(filename)
            Log.i(tag, "File found.")
        } catch (e: IOException) {
            e.printStackTrace()
            Log.i(tag, "File not found.")
        }

        return afd!!
    }

    private fun getRelativePath(uri: Uri): String {
        var path = uri.path
        if (path!![0] == '/') {
            path = path.substring(1)
        }
        return path
    }

    override fun query(
        uri: Uri,
        projection: Array<String>?,
        selection: String?,
        selectionArgs: Array<String>?,
        sortOrder: String?
    ): Cursor? {
        var projection = projection
        if (projection == null) {
            projection = COLUMNS
        }

        Log.i(tag, "query")
        val am = context!!.assets
        val path = getRelativePath(uri)
        var fileSize: Long = 0
        try {
            val afd = am.openFd(path)
            fileSize = afd.length
            afd.close()
        } catch (e: IOException) {
            Log.e(tag, "Can't open asset file", e)
        }

        val cols = arrayOfNulls<String>(projection!!.size)
        val values = arrayOfNulls<Any>(projection.size)
        var i = 0
        for (col in projection) {
            if (OpenableColumns.DISPLAY_NAME == col) {
                cols[i] = OpenableColumns.DISPLAY_NAME
                values[i++] = uri.lastPathSegment
            } else if (OpenableColumns.SIZE == col) {
                cols[i] = OpenableColumns.SIZE
                values[i++] = fileSize
            }
        }

        val cursor = MatrixCursor(cols, 1)
        cursor.addRow(values)
        return cursor
    }

    override fun getType(uri: Uri): String? {
        Log.i(tag, "type")
        val file_name = uri.lastPathSegment
        val lastDot = file_name!!.lastIndexOf('.')
        if (lastDot >= 0) {
            val extension = file_name.substring(lastDot + 1)
            val mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)
            if (mime != null) {
                Log.i(tag, "$mime")
                return mime
            }
        }
        Log.i(tag, "default type")

        return "application/octet-stream"
    }

    override fun delete(p1: Uri, p2: String?, p3: Array<String>?): Int {
        Log.i(tag, "del.")
        // TODO: Implement this method
        return 0
    }


    override fun insert(p1: Uri, p2: ContentValues?): Uri? {
        // TODO: Implement this method
        Log.i("AP", "insert.")
        return null
    }

    override fun onCreate(): Boolean {
        // TODO: Implement this method
        Log.i("AP", "create.")
        return false
    }

    override fun update(p1: Uri, p2: ContentValues?, p3: String?, p4: Array<String>?): Int {
        Log.i("AP", "update.")
        // TODO: Implement this method
        return 0
    }

}