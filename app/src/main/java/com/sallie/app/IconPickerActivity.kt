package com.sallie.app

import android.app.Activity
import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.util.concurrent.Executors

class IconPickerActivity : Activity() {
    private val iconUrls = listOf(
        // Example Material Icons PNG URLs (replace with actual open-source icon URLs)
        "https://raw.githubusercontent.com/google/material-design-icons/master/png/action/home/materialicons/48dp/1x/baseline_home_black_48dp.png",
        "https://raw.githubusercontent.com/google/material-design-icons/master/png/action/face/materialicons/48dp/1x/baseline_face_black_48dp.png",
        "https://raw.githubusercontent.com/google/material-design-icons/master/png/action/favorite/materialicons/48dp/1x/baseline_favorite_black_48dp.png"
        // ...add up to 35 URLs
    )
    private val aliasNames = (1..35).map { "com.sallie.app.MainActivityAlias$it" }
    private val client = OkHttpClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val scrollView = ScrollView(this)
        val layout = LinearLayout(this)
        layout.orientation = LinearLayout.VERTICAL
        scrollView.addView(layout)

        for ((i, url) in iconUrls.withIndex()) {
            val imageView = ImageView(this)
            val button = Button(this)
            button.text = "Set as Launcher Icon"
            layout.addView(imageView)
            layout.addView(button)
            loadIcon(url, imageView)
            button.setOnClickListener {
                setLauncherIcon(aliasNames[i])
            }
        }
        setContentView(scrollView)
    }

    private fun loadIcon(url: String, imageView: ImageView) {
        Executors.newSingleThreadExecutor().execute {
            try {
                val request = Request.Builder().url(url).build()
                val response = client.newCall(request).execute()
                val inputStream = response.body?.byteStream()
                val bitmap = BitmapFactory.decodeStream(inputStream)
                runOnUiThread {
                    imageView.setImageBitmap(bitmap)
                }
            } catch (e: IOException) {
                e.printStackTrace()
            }
        }
    }

    private fun setLauncherIcon(aliasName: String) {
        val pm = packageManager
        for (name in aliasNames) {
            pm.setComponentEnabledSetting(
                ComponentName(this, name),
                if (name == aliasName) PackageManager.COMPONENT_ENABLED_STATE_ENABLED else PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP
            )
        }
    }
}
