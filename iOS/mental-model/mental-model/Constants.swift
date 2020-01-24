//
//  Constants.swift
//  mental-model
//
//  Created by Judith on 13.11.19.
//  Copyright © 2019 lambdaforge. All rights reserved.
//

import Foundation

import UIKit

let BackgroundColor: UIColor = UIColor(red:0.93, green:0.93, blue:0.93, alpha:1.0)
let BannerHeight: CGFloat = 120.0
let BannerTop: CGFloat  = 0.0 //UIApplication.shared.statusBarFrame.height
let ScreenTop: CGFloat = BannerHeight + BannerTop
let DownloadFileName = "nommet_data.csv"
let Padding: CGFloat = 10.0

struct ExplanationBox {
    static let widthFraction: CGFloat = 0.8
    static let padding: CGFloat = 10.0
    static let fontSize: CGFloat = 16.0
    static let textColor: UIColor = .gray
    static let borderSize: CGFloat = 1.0
    static let borderColor: UIColor = .black
}

struct Explanation {
    static let home = "Welcome to the NOn-verbal Mental Model Elicitation Tool (NOMMET)!\n\nBelow you can choose to:\n - start uploading files to tailor the tool to your needs\n - start session to start mapping mental models, change settings or to download your data\n - view the manual if you want to learn more about how to use NOMMET"
   static let upload = "Here you can upload the relevant audio/video/image files to tailor NOMMET to your needs.\n\nOnce you have uploaded a file, it should show on this screen. Once you have uploaded all your files here, you can go to start session/settings to indicate where you want each file to operate within NOMMET."
}

struct Section {
    static let titleColor: UIColor = .gray
    static let titleFontSize: CGFloat = 20.0
    static let labelWidth: CGFloat = 150.0
}

struct UploadScreen {
    static let buttonHeight: CGFloat = 30.0
    static let buttonWidth: CGFloat = 100.0
}

struct Title {
    static let importScreen = "File Import"
    static let topPadding: CGFloat = 10.0
    static let height: CGFloat = 30.0
    static let color: UIColor = .gray
    static let fontSize: CGFloat = 26.0
}
