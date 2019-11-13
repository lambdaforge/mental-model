//
//  Constants.swift
//  mental-model
//
//  Created by Judith on 13.11.19.
//  Copyright © 2019 lambdaforge. All rights reserved.
//

import Foundation

import UIKit

let BannerHeight: CGFloat = 120.0
let ScreenTop: CGFloat = BannerHeight //+ UIApplication.shared.statusBarFrame.height
let ExplanationBoxWidthFraction: CGFloat = 0.9

struct Explanation {
    static let home = "Welcome to the NOn-verbal Mental Model Elicitation Tool (NOMMET)!\n\nBelow you can choose to start uploading files to tailor the tool to your needs, or to choose start session to start mapping mental models, change settings or to download your data. View the manual if you want to learn more about how to use NOMMET."
   static let upload = "Here you can upload the relevant audio/video/image files to tailor NOMMET to your needs.\n\nOnce you have uploaded a file, it should show on this screen. Once you have uploaded all your files here, you can go to start session/settings to indicate where you want each file to operate within NOMMET."
}
