//
//  NitroViewShotOutputHandler.swift
//  NitroViewShot
//
//  Created by Patrick Kabwe on 11/30/2025.
//

import Foundation
import NitroModules

final class NitroViewShotOutputHandler {
    private static let cacheFolderName = "react-native-nitro-view-shot"
    private static let deletionQueue = DispatchQueue(label: "com.nitroviewshot.deletion", qos: .utility)

    private let fileManager = FileManager.default
    private let cacheDirectory: URL

    init() {
        cacheDirectory = fileManager.temporaryDirectory.appendingPathComponent(
            Self.cacheFolderName,
            isDirectory: true
        )
        if !fileManager.fileExists(atPath: cacheDirectory.path) {
            try? fileManager.createDirectory(
                at: cacheDirectory,
                withIntermediateDirectories: true
            )
        }
    }

    func handleOutput(
        data: Data,
        fileName: String,
        format: NitroViewShotFormat?,
        output: NitroViewShotOutputType?
    ) throws -> String {
        if output == .base64 {
            clearAllCapturesAsync()
            return data.base64EncodedString()
        }

        let url = fileURL(fileName: fileName, format: format)
        clearAllCapturesAsync(excluding: url)
        try data.write(to: url, options: [])
        return url.path
    }

    private func fileURL(fileName: String, format: NitroViewShotFormat?) -> URL {
        let ext: String
        switch format {
        case .jpg:
            ext = "jpg"
        default:
            ext = "png"
        }

        let base = URL(fileURLWithPath: fileName)
        let safeBaseName = base.deletingPathExtension().lastPathComponent

        if base.pathExtension.isEmpty {
            return cacheDirectory.appendingPathComponent(
                "\(safeBaseName).\(ext)"
            )
        }
        return cacheDirectory.appendingPathComponent(base.lastPathComponent)
    }

    private func clearAllCapturesAsync(excluding currentFile: URL? = nil) {
        Self.deletionQueue.async { [weak self] in
            guard let self = self,
                  let files = try? self.fileManager.contentsOfDirectory(
                      at: self.cacheDirectory,
                      includingPropertiesForKeys: [],
                      options: [.skipsHiddenFiles]
                  ) else { return }
            
            for file in files {
                if let currentFile = currentFile, file.path == currentFile.path {
                    continue
                }
                try? self.fileManager.removeItem(at: file)
            }
        }
    }
}
