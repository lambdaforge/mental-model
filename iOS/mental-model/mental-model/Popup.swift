//
//  Alert.swift
//  mental-model
//
//  Created by Judith on 19.03.20.
//  Copyright © 2020 lambdaforge. All rights reserved.
//

import UIKit

class Popup {
    
    static func enqueue(presenting: UIViewController, presented: UIViewController) {
        DispatchQueue.main.async(execute: {
            showOrWait(presenting: presenting, presented: presented)
        })
    }
    
    static func showOrWait(presenting: UIViewController, presented: UIViewController) {
        if presenting.presentedViewController == nil {
            presenting.present(presented, animated: true)
        }
        else {
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(200), execute: {
                showOrWait(presenting: presenting, presented: presented)
            })
        }
    }
    
    static func info(presenting: UIViewController, title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .cancel){ action in
                presenting.dismiss(animated: true)
            }
        )
        enqueue(presenting: presenting, presented: alert)
    }
    
    static func decision(presenting: UIViewController, title: String, message: String, actionOnYes: ((UIAlertAction) -> Void)?) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Yes", style: .default, handler: actionOnYes))
        alert.addAction(UIAlertAction(title: "No", style: .cancel){ action in
                presenting.dismiss(animated: true)
            }
        )
        enqueue(presenting: presenting, presented: alert)
    }
    
    
    // Specific alerts used across classes
    
    static func missingResource(presenting: UIViewController, resource: String) {
        let title = "Missing app resource!"
        let msg = "Missing: \(resource)\nTry restarting the app. If this message still occurs, please contact the maintainer."
        Popup.info(presenting: presenting, title: title, message: msg)
    }
    
    static func accessDenied(presenting: UIViewController, resource: String) {
        let title = "Access denied for \(resource)!"
        let msg = "Use the 'Settings' app of your device to allow M-TOOL access to \(resource)."
        
        Popup.info(presenting: presenting, title: title, message: msg)
    }
}
