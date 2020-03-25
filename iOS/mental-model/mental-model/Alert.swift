//
//  Alert.swift
//  mental-model
//
//  Created by Judith on 19.03.20.
//  Copyright © 2020 lambdaforge. All rights reserved.
//

import UIKit

class Alert {
    static func info(viewController: UIViewController, title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .cancel){ action in
                viewController.dismiss(animated: true)
            }
        )
        viewController.present(alert, animated: true)
    }
    
    static func decision(viewController: UIViewController, title: String, message: String, actionOnYes: ((UIAlertAction) -> Void)?) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Yes", style: .default, handler: actionOnYes))
        alert.addAction(UIAlertAction(title: "No", style: .cancel){ action in
                viewController.dismiss(animated: true)
            }
        )
        viewController.present(alert, animated: true, completion: nil)
    }
    
    
    static func missingResources(viewController: UIViewController) {
        let alert = UIAlertController(title: "Missing web directory!",
                                      message: "Try restarting the app. If this message still occurs, please contact the maintainer.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel){ action in
                viewController.dismiss(animated: true)
            }
        )
        viewController.present(alert, animated: true, completion: nil)
    }
}
