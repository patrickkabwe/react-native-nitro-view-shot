//
//  HybridNitroViewShot.swift
//  Pods
//
//  Created by Patrick Kabwe on 11/29/2025.
//

import Foundation
import NitroModules
import React

class HybridNitroViewShot: HybridNitroViewShotSpec {

    private let outputHandler = NitroViewShotOutputHandler()

    func captureAsync(tag: Double, options: ViewShotOptions) throws -> Promise<String> {
        return .async { @MainActor [weak self] in
            guard let self = self else {
                throw RuntimeError.error(withMessage: "Instance deallocated")
            }

            return try self.performCapture(tag: tag, options: options)
        }
    }

    func capture(tag: Double, options: ViewShotOptions) throws -> String {
        var result: String = ""
        var error: Error?
        let semaphore = DispatchSemaphore(value: 0)

        DispatchQueue.main.async {
            do {
                result = try self.performCapture(tag: tag, options: options)
            } catch let e {
                error = e
            }
            semaphore.signal()
        }

        semaphore.wait()

        if let error = error {
            throw error
        }

        return result
    }

    private func performCapture(tag: Double, options: ViewShotOptions) throws -> String {
        let reactTag = NSNumber(value: tag)

        guard let view = getViewForTag(reactTag) else {
            throw RuntimeError.error(
                withMessage: "View not found for tag: \(tag)"
            )
        }

        let bounds = view.bounds
        guard bounds.width > 0, bounds.height > 0 else {
            throw RuntimeError.error(
                withMessage:
                    "Invalid view size: width=\(bounds.width), height=\(bounds.height)"
            )
        }

        let renderer = UIGraphicsImageRenderer(bounds: bounds)
        let image = renderer.image { context in
            // 1. Try drawHierarchy first (better for views with subviews)
            if view.window != nil {
                view.drawHierarchy(in: bounds, afterScreenUpdates: false)
            } else {
                // 2. Fallback to layer rendering if view is not in window
                view.layer.render(in: context.cgContext)
            }
        }

        let data: Data
        switch options.format {
        case .jpg:
            guard let jpegData = image.jpegData(
                    compressionQuality: options.quality ?? 1.0
                )
            else {
                throw RuntimeError.error(
                    withMessage: "Failure to convert UIImage to JPEG"
                )
            }
            data = jpegData
        case .webp:
            throw RuntimeError.error(
                withMessage: "WebP format not supported on iOS"
            )
        default:
            guard let pngData = image.pngData() else {
                throw RuntimeError.error(
                    withMessage: "Failure to convert UIImage to PNG"
                )
            }
            data = pngData
        }
        return try outputHandler.handleOutput(
            data: data,
            fileName: options.fileName,
            format: options.format,
            output: options.output
        )
    }

    private func getUIManager() -> RCTUIManager? {
        return autoreleasepool {
            guard let bridge = RCTBridge.current() else {
                return nil
            }
            return bridge.uiManager
        }
    }

    private func getViewForTag(_ tag: NSNumber) -> UIView? {
        guard let uiManager = getUIManager() else {
            return nil
        }
        return autoreleasepool { uiManager.view(forReactTag: tag) }
    }

}
