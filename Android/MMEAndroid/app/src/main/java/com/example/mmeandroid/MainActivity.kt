package com.example.mmeandroid

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val webView: WebView = findViewById(R.id.webview)
        webView.settings.javaScriptEnabled = true
        webView.settings.databaseEnabled = true
        webView.settings.domStorageEnabled = true

        /*
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT) {

            webView.settings.databasePath =
                //setDatabasePath("/data/data/" + webView.getContext().getPackageName() + "/databases/");
        }*/

       webView.loadUrl("file:///android_asset/index.html")
        //webView.settings.cacheMode = WebSettings.LOAD_NO_CACHE



    }
}
