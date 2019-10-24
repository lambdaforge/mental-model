package com.example.mmeandroid

import android.content.ActivityNotFoundException
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.view.View
import androidx.appcompat.app.AlertDialog


class HomeActivity : AppCompatActivity() {

    private val tag = "Change Activity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)
    }

    fun changeToUpload(v: View) {
        startActivity(Intent(this@HomeActivity, UploadActivity::class.java))
        Log.i(tag, "Load upload layout")
    }


    fun changeToMain(v: View) {
        startActivity(Intent(this@HomeActivity, MainActivity::class.java))
        Log.i(tag, "Load main layout")
    }

    fun changeToManual(v: View) {
        openPDF()

        Log.i(tag, "Load manual layout")
    }

    private fun openPDF() {

        val path = Uri.parse("content://com.example.mmeandroid.assetprovider/manual.pdf")

        val pdfIntent = Intent(Intent.ACTION_VIEW)
        pdfIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        pdfIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        pdfIntent.setDataAndType(path , "application/pdf")


        try
        {
            startActivity(pdfIntent);
            Log.i("Manual", "Viewing manual.")

        }
        catch (e: ActivityNotFoundException)
        {
            openInfoDialog("Manual", "No Application available to view PDF!")
            Log.i("Manual", "PDF Viewer Missing")

        }
    }

    private fun openInfoDialog(title: String, message: String) {
        val builder = AlertDialog.Builder(this@HomeActivity)
        builder.setTitle(title)
        builder.setMessage(message)
        builder.setPositiveButton("OK")    { dialog, _ -> dialog.cancel()          }

        val dialog: AlertDialog = builder.create()
        dialog.show()
    }
}
