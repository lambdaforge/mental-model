//
//  Alert.swift
//  mental-model
//
//  Created by Judith on 19.03.20.
//  Copyright © 2020 lambdaforge. All rights reserved.
//

import UIKit

class Popup {
    
    static func queueController(viewController: UIViewController, alert: UIAlertController) {
        DispatchQueue.main.async(execute: {
            showOrWait(viewController: viewController, alert: alert)
        })
    }
    
    static func showOrWait(viewController: UIViewController, alert: UIAlertController) {
        if viewController.presentedViewController == nil {
            viewController.present(alert, animated: true)
        }
        else {
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(200), execute: {
                showOrWait(viewController: viewController, alert: alert)
            })
        }
    }
    
    static func info(viewController: UIViewController, title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .cancel){ action in
                viewController.dismiss(animated: true)
            }
        )
        
        queueController(viewController: viewController, alert: alert)
    }
    
    static func decision(viewController: UIViewController, title: String, message: String, actionOnYes: ((UIAlertAction) -> Void)?) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Yes", style: .default, handler: actionOnYes))
        alert.addAction(UIAlertAction(title: "No", style: .cancel){ action in
                viewController.dismiss(animated: true)
            }
        )
        queueController(viewController: viewController, alert: alert)
    }
    
    
    // Specific alerts used across classes
    
    static func missingResource(viewController: UIViewController, resource: String) {
        let title = "Missing app resource!"
        let msg = "Missing: \(resource)\nTry restarting the app. If this message still occurs, please contact the maintainer."
        Popup.info(viewController: viewController, title: title, message: msg)
    }
    
    static func accessDenied(viewController: UIViewController, resource: String) {
        let title = ""
        let msg = ""
        
        Popup.info(viewController: viewController, title: title, message: msg)
    }
    
}
