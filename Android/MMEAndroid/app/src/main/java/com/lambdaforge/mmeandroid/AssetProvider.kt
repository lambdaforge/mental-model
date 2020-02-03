package com.lambdaforge.mmeandroid

import android.content.ContentProvider
import android.content.res.AssetFileDescriptor
import android.net.Uri
import java.io.FileNotFoundException
import java.io.IOException
import android.content.ContentValues
import android.database.Cursor
import android.util.Log
import android.webkit.MimeTypeMap
import android.database.MatrixCursor
import android.provider.OpenableColumns


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
        proj: Array<String>?,
        selection: String?,
        selectionArgs: Array<String>?,
        sortOrder: String?
    ): Cursor? {
        var projection = proj
        if (projection == null) {
            projection = COLUMNS
        }

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

        val cols = arrayOfNulls<String>(projection.size)
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
        val filename = uri.lastPathSegment
        val lastDot = filename!!.lastIndexOf('.')
        if (lastDot >= 0) {
            val extension = filename.substring(lastDot + 1)
            val mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)
            if (mime != null) {
                Log.i(tag, "$mime")
                return mime
            }
        }

        return "application/octet-stream"
    }

    override fun delete(p1: Uri, p2: String?, p3: Array<String>?): Int {
        return 0
    }


    override fun insert(p1: Uri, p2: ContentValues?): Uri? {
        return null
    }

    override fun onCreate(): Boolean {
        return false
    }

    override fun update(p1: Uri, p2: ContentValues?, p3: String?, p4: Array<String>?): Int {
        return 0
    }

}