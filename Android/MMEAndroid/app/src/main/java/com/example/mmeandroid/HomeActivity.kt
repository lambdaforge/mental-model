package com.example.mmeandroid

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.content.Intent
import android.util.Log
import android.view.View


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

}
