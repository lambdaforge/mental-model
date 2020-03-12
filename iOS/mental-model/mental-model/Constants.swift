//
//  Constants.swift
//  mental-model
//
//  Created by Judith on 13.11.19.
//  Copyright © 2019 lambdaforge UG. All rights reserved.
//

import Foundation

import UIKit

let BackgroundColor: UIColor = .white
let BannerHeight: CGFloat = 120.0
let BannerTop: CGFloat  = 0.0 //UIApplication.shared.statusBarFrame.height
let ScreenTop: CGFloat = BannerHeight + BannerTop
let Padding: CGFloat = 10.0

let WebDir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("www")
let HTMLFileName = "index.html"
let MediaSourcesFileName = "mediaSources.js"
let DownloadFileName = "mtool_data.csv"

struct ExplanationBox {
    static let widthFraction: CGFloat = 0.8
    static let padding: CGFloat = 10.0
    static let fontSize: CGFloat = 14.0
    static let textColor: UIColor = .gray
    static let borderSize: CGFloat = 1.0
    static let borderColor: UIColor = .black
}

struct Explanation {
    static let home: String = "Welcome to the Mental Model Mapping Tool!\nBelow you can choose to:\n- upload files to tailor the tool to your needs\n- start session to start mapping mental models, change settings or download your data\n- show manual to learn more about how to use M-TOOL"
    //static let homeItalicRanges = []
    static let upload = "Here you can upload the relevant audio/video/image files to tailor M-TOOL to your needs.\nOnce you have uploaded a file, it should show on this screen. Once you have uploaded all your files here, you can go to start session/settings to indicate where you want each file to operate within M-TOOL."
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
    static let importScreen = "Upload Files"
    static let topPadding: CGFloat = 10.0
    static let height: CGFloat = 30.0
    static let color: UIColor = .gray
    static let fontSize: CGFloat = 26.0
}
