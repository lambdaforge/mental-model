//
//  AppDelegate.swift
//  mental-model
//
//  Created by Judith on 14.08.19.
//  Copyright © 2019 lambdaforge. All rights reserved.
//

import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    var navigationController: UINavigationController?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // Added until return
        window = UIWindow(frame: UIScreen.main.bounds)
        
        if let window = window {
            let mainVC = ViewController()
            navigationController = UINavigationController(rootViewController: mainVC)
       //     navigationController!.navigationBar.barStyle = .black
            
            if #available(iOS 11.0, *) {
                //navigationController!.navigationBar.prefersLargeTitles = true
            }
        
            
            window.rootViewController = navigationController
            window.makeKeyAndVisible()
        }
        
        return true
    }

    
  /*  func applyImageBackgroundToTheNavigationBar() {
        /*  These background images contain a small pattern which is displayed
         in the lower right corner of the navigation bar.
         */
        var backImageForDefaultBarMetrics = UIImage(named: "banner")
      
        /*  Both of the above images are smaller than the navigation bar's size.
         To enable the images to resize gracefully while keeping their
         content pinned to the bottom right corner of the bar, the images are
         converted into resizable images width edge insets extending from the
         bottom up to the second row of pixels from the top, and from the
         right over to the second column of pixels from the left. This results
         in the topmost and leftmost pixels being stretched when the images
         are resized. Not coincidentally, the pixels in these rows/columns are empty.
         */
        backImageForDefaultBarMetrics =
            backImageForDefaultBarMetrics!.resizableImage(
                withCapInsets: UIEdgeInsets(top: 0,
                                            left: 0,
                                            bottom: backImageForDefaultBarMetrics!.size.height - 1,
                                            right: backImageForDefaultBarMetrics!.size.width - 1))

        
        let navigationBarAppearance = navigationController!.navigationBar
        navigationBarAppearance.setBackgroundImage(backImageForDefaultBarMetrics, for: .default)
    }*/
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }


}

