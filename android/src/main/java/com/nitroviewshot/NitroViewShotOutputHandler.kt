package com.nitroviewshot

import android.content.Context
import com.margelo.nitro.nitroviewshot.NitroViewShotFormat
import com.margelo.nitro.nitroviewshot.NitroViewShotOutputType
import com.margelo.nitro.nitroviewshot.ViewShotOptions
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.Executors


class NitroViewShotOutputHandler(private val context: Context) {
    private val cacheFolderName = "react-native-nitro-view-shot"
    private val deletionExecutor = Executors.newSingleThreadExecutor()

    fun handleOutput(bytes: ByteArray, options: ViewShotOptions): String {
        return if (options.output == NitroViewShotOutputType.BASE64) {
            clearAllCapturesAsync()
            android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP)
        } else {
            val file = File(getCacheDir(), sanitizeFileName(targetFileName(options)))
            clearAllCapturesAsync(currentFile = file)
            FileOutputStream(file).use { it.write(bytes) }
            file.absolutePath
        }
    }

    private fun targetFileName(options: ViewShotOptions): String {
        return options.fileName.let { name ->
            val hasExtension = name.contains(".")
            if (hasExtension) name else "$name.${getExt(options.format)}"
        }
    }

    private fun getExt(format: NitroViewShotFormat?): String {
        return when (format) {
            NitroViewShotFormat.JPG -> "jpg"
            NitroViewShotFormat.WEBP -> "webp"
            else -> "png"
        }
    }

    private fun getCacheDir(): File {
        val dir = File(context.cacheDir, cacheFolderName)
        if (!dir.exists()) {
            dir.mkdirs()
        }
        return if (dir.exists()) dir else context.cacheDir
    }

    private fun clearAllCapturesAsync(currentFile: File? = null) {
        deletionExecutor.execute {
            val dir = getCacheDir()
            dir.listFiles()?.forEach { file: File ->
                if (file.isFile && file.absolutePath != currentFile?.absolutePath) {
                    file.delete()
                }
            }
        }
    }

    private fun sanitizeFileName(name: String): String {
        return name.substringAfterLast("/").substringAfterLast("\\")
    }
}
