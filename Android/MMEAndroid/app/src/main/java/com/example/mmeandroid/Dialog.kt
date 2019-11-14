package com.example.mmeandroid

import android.content.Context
import androidx.appcompat.app.AlertDialog

class Dialog(private val context: Context) {

    fun showInformation(title: String, message: String) {
        val builder = AlertDialog.Builder(context)
        builder.setTitle(title)
        builder.setMessage(message)
        builder.setPositiveButton("OK")     { dialog, _ -> dialog.cancel() }

        val dialog: AlertDialog = builder.create()
        dialog.show()
    }

    fun showDoOrNotChoice(title: String, message: String, action: () -> Any) {
        val builder = AlertDialog.Builder(context)
        builder.setTitle(title)
        builder.setMessage(message)
        builder.setPositiveButton("Yes")    {      _, _ -> action()        }
        builder.setNegativeButton("Cancel") { dialog, _ -> dialog.cancel() }

        val dialog: AlertDialog = builder.create()
        dialog.show()
    }
}
