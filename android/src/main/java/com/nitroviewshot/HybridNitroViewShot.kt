package com.nitroviewshot

import android.graphics.Bitmap
import android.graphics.Canvas
import android.view.View
import com.facebook.react.uimanager.UIManagerHelper
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import com.margelo.nitro.nitroviewshot.HybridNitroViewShotSpec
import androidx.core.graphics.createBitmap
import com.margelo.nitro.nitroviewshot.NitroViewShotFormat
import android.os.Looper
import com.margelo.nitro.nitroviewshot.ViewShotOptions
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream

class HybridNitroViewShot: HybridNitroViewShotSpec() {
    val reactContext = NitroModules.applicationContext ?: throw Error("React context not found")
    val mainScope = MainScope()
    private val outputHandler = NitroViewShotOutputHandler(reactContext)

    override fun captureAsync(
        tag: Double,
        options: ViewShotOptions
    ): Promise<String> {
        return Promise.async(mainScope) {
            performCapture(tag, options)
        }
    }

    override fun capture(
        tag: Double,
        options: ViewShotOptions
    ): String {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            return performCapture(tag, options)
        }
        return runBlocking {
            withContext(Dispatchers.Main.immediate) {
                performCapture(tag, options)
            }
        }
    }

    private fun getView(reactTag: Int): View {
        val uiManager = UIManagerHelper.getUIManagerForReactTag(reactContext, reactTag) ?: throw Error("UI manager not found")
        val view = uiManager.resolveView(reactTag) ?: throw Error("View not found")
        return view
    }

    private fun performCapture(
        tag: Double,
        options: ViewShotOptions
    ): String {
        val view  = getView(tag.toInt())
        val width = view.width
        val height = view.height

        require(width > 0 && height > 0) {
            throw Error("Invalid view size: $width x $height")
        }

        val bitmap = createBitmap(width, height)
        val canvas = Canvas(bitmap)
        view.draw(canvas)

        val compressFormat = when(options.format) {
            NitroViewShotFormat.JPG -> Bitmap.CompressFormat.JPEG
            NitroViewShotFormat.WEBP -> Bitmap.CompressFormat.WEBP
            else -> Bitmap.CompressFormat.PNG
        }

        val qualityWithDefaultValue = options.quality ?: 1.0
        val quality = (qualityWithDefaultValue * 100).toInt().coerceIn(0, 100)

        val output = ByteArrayOutputStream()
        if (!bitmap.compress(compressFormat, quality, output)) {
            throw Error("Bitmap.compress failed")
        }

        val bytes = output.toByteArray()
        return outputHandler.handleOutput(bytes, options)
    }
}
