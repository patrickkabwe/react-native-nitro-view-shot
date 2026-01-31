//
//  HybridNitroViewShot.swift
//  Pods
//
//  Created by Patrick Kabwe on 11/29/2025.
//

import Foundation
import NitroModules

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
        return try DispatchQueue.main.sync { [weak self] in
            guard let self else {
                throw RuntimeError.error(withMessage: "Instance deallocated")
            }
            return try self.performCapture(tag: tag, options: options)
        }
    }

    private func performCapture(tag: Double, options: ViewShotOptions) throws -> String {
        guard let view = findView(byTag: Int(tag)) else {
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
                    withMessage: "Failed to convert UIImage to JPEG"
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
                    withMessage: "Failed to convert UIImage to PNG"
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
}

extension HybridNitroViewShot {
    private func findView(byTag tag: Int) -> UIView? {
      guard let window = UIApplication.shared.connectedScenes
        .compactMap({ $0 as? UIWindowScene })
        .flatMap({ $0.windows })
        .first(where: { $0.isKeyWindow }) else {
        return nil
      }
      return findView(in: window, withTag: tag)
    }
    
    private func findView(in view: UIView, withTag tag: Int) -> UIView? {
      if view.tag == tag { return view }
      for subview in view.subviews {
        if let found = findView(in: subview, withTag: tag) {
          return found
        }
      }
      return nil
    }
}
