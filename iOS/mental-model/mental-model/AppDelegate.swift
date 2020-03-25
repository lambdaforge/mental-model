//
//  AppDelegate.swift
//  mental-model
//
//  Created by Judith on 14.08.19.
//  Copyright © 2019 lambdaforge UG. All rights reserved.
//

import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    var navigationController: UINavigationController?
    
    
    func copyDirectoryFiles(sourceDir: String, destinationDir: String) throws {
        let fileManager = FileManager.default
        
        print("Copying content...")
        do {
            let filelist = try fileManager.contentsOfDirectory(atPath: sourceDir)

            for filename in filelist {
            
                let sourceFile = "\(sourceDir)/\(filename)"
                let destinationFile = "\(destinationDir)/\(filename)"
                
                var isDir : ObjCBool = false
                if fileManager.fileExists(atPath: destinationFile, isDirectory: &isDir) {
                    
                    if isDir.boolValue {
                        try copyDirectoryFiles(sourceDir: sourceFile, destinationDir: destinationFile)
                    }
                    else {
                        print("File \(destinationFile) already exists")
                        if !(filename == MediaSourcesFileName) {
                            print("Overwriting file...")
                            try fileManager.removeItem(atPath: destinationFile)
                            try fileManager.copyItem(atPath: sourceFile, toPath: destinationFile)
                        }
                        else {
                            print("Skipping media sources file")
                        }
                        
                    }
                }
                else {
                    print("Copying File: \(sourceFile) to \(destinationFile)")
                    try fileManager.copyItem(atPath: sourceFile, toPath: destinationFile)
                }
            }
        } catch {
            print("Error copying web files")
        }
    }
    
    func application(_ application: UIApplication, willFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        
        print("Copying web resources...")
        
        let fileManager = FileManager.default
        let oldWebDir = Bundle.main.resourceURL!.appendingPathComponent("www")

        do {
            if (fileManager.fileExists(atPath: WebDir.path)) {
                print(" Web directory already exists, copying content only")
                try copyDirectoryFiles(sourceDir: oldWebDir.path, destinationDir: WebDir.path)
            }
            else {
                print(" Web directory does not exists, copying entire directory")
                try fileManager.copyItem(atPath: oldWebDir.path, toPath: WebDir.path)
            }
            
            print(" Resources copied successfully")
        }
        catch {
            print("Copying web directory failed.")
        }
        
        return true
    }

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // Added until return
        window = UIWindow(frame: UIScreen.main.bounds)
        
        if let window = window {
            let mainVC = ViewController()
            navigationController = UINavigationController(rootViewController: mainVC)
            
            window.rootViewController = navigationController
            window.makeKeyAndVisible()
        }
        
        return true
    }
    
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
