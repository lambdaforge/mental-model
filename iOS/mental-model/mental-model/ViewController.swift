//
//  ViewController.swift
//  mental-model
//
//  Created by Judith on 07.08.19.
//  Copyright © 2019 lambdaforge UG. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    var bannerView: Banner!
    var imageView: UIImageView!
    
    var explanationView: UIView!
    var explanation: TextBox!
    
    var leftButton: UIButton!
    var leftColumn: UIView!
    var middleButton: UIButton!
    var middleColumn: UIView!
    var rightButton: UIButton!
    var rightColumn: UIView!
    
    
    //
    // UIViewController Methods
    //
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationController?.isNavigationBarHidden = true
        view.backgroundColor = BackgroundColor
        view.addSubview(Banner(atTopOf: view))

        addButtonRow()
        addExplanationBox()
    }
    
    override func viewWillLayoutSubviews() {
        leftButton.centerYAnchor.constraint(equalTo: leftColumn.centerYAnchor).isActive = true
        leftButton.centerXAnchor.constraint(equalTo: leftColumn.centerXAnchor).isActive = true
        middleButton.centerYAnchor.constraint(equalTo: middleColumn.centerYAnchor).isActive = true
        middleButton.centerXAnchor.constraint(equalTo: middleColumn.centerXAnchor).isActive = true
        rightButton.centerYAnchor.constraint(equalTo: rightColumn.centerYAnchor).isActive = true
        rightButton.centerXAnchor.constraint(equalTo: rightColumn.centerXAnchor).isActive = true
    }
    
    override func viewDidLayoutSubviews() {
        explanation.center = explanationView.center
    }
    
    
    // Helper functions for view controller
    
    private func addButtonRow() {
         let thirdWidth = view.frame.width / 3.0
         
         leftColumn = UIView()
         leftColumn.frame = CGRect(x: 0, y: ScreenTop, width: thirdWidth, height: view.frame.height - ScreenTop)
         leftButton = makeButton(label: "Upload Files", action: #selector(changeToUpload))
         leftColumn.addSubview(leftButton)
         view.addSubview(leftColumn)
         
         middleColumn = UIView()
         middleColumn.frame = CGRect(x: thirdWidth, y: ScreenTop, width: thirdWidth, height: view.frame.height - ScreenTop)
         middleButton = makeButton(label: "Start Session", action: #selector(changeToWebApp))
         middleColumn.addSubview(middleButton)
         view.addSubview(middleColumn)
         
         rightColumn = UIView()
         rightColumn.frame = CGRect(x: 2*thirdWidth, y: ScreenTop, width: thirdWidth, height: view.frame.height - ScreenTop)
         rightButton = makeButton(label: "Show Manual", action: #selector(showManual))
         rightColumn.addSubview(rightButton)
         view.addSubview(rightColumn)
     }
     
     private func makeButton(label: String, action: Selector) -> UIButton {
         let button = UIButton(type: .roundedRect)
         let verticalSpacing: CGFloat = 8.0
         let horizontalSpacing: CGFloat = 16.0
         
         button.frame = CGRect(x: 150, y: 0, width: 200, height: 30)
         button.layer.borderWidth = 1
         button.layer.borderColor = button.tintColor.cgColor
         button.layer.cornerRadius = 5
         button.contentEdgeInsets = UIEdgeInsets(top: verticalSpacing, left: horizontalSpacing,
                                                 bottom: verticalSpacing, right: horizontalSpacing)
         button.setTitle(label, for: .normal)
         button.titleLabel?.font = UIFont.systemFont(ofSize: 20)
         button.translatesAutoresizingMaskIntoConstraints = false
         button.addTarget(self, action: action, for: .touchUpInside)
         return button
     }
    
    private func addExplanationBox() {
        
        let w: CGFloat = self.view.frame.width * CGFloat(ExplanationBox.widthFraction)
        let leftBound = (view.frame.width - w) / 2.0
        let hButtons = leftButton.frame.size.height
        let h = (view.frame.height - ScreenTop) / 2.0 - hButtons / 2.0

        // Helper view for centering explanation box
        explanationView = UIView(frame: CGRect(x: leftBound, y: ScreenTop, width: w, height: h))
        view.addSubview(explanationView)

        let italicFont = UIFont.italicSystemFont(ofSize: ExplanationBox.fontSize)
        let explanationText = NSMutableAttributedString(string: Explanation.home)
        explanationText.addAttribute(.font, value: UIFont.systemFont(ofSize: ExplanationBox.fontSize), range: NSRange(location: 0, length: Explanation.home.count))
        explanationText.addAttribute(.font, value: italicFont, range: NSRange(location: 69, length: 12))
        explanationText.addAttribute(.font, value: italicFont, range: NSRange(location: 117, length: 13))
        explanationText.addAttribute(.font, value: italicFont, range: NSRange(location: 203, length: 11))
        
        explanation = TextBox(frame: CGRect(x: leftBound, y: ScreenTop, width: w, height: h))
        explanation.attributedText = explanationText
        explanation.textColor = ExplanationBox.textColor
        explanation.adjustSize(nLines: 5)
        
        view.addSubview(explanation)
    }
    
 
    // Button actions
       
    @IBAction func changeToUpload(sender: UIButton!) {
        print("upload")
        let uploadView = UploadViewController()
        self.navigationController?.pushViewController(uploadView, animated: true)
    }
       
    @IBAction func changeToWebApp(sender: UIButton!) {
        print("webapp")
        let webView = WebViewController()
           self.navigationController?.pushViewController(webView, animated: true)
       }
       
    @IBAction func showManual(sender: UIButton!) {
        print("manual")
        let pdfView = PdfViewController()
        self.navigationController?.pushViewController(pdfView, animated: true)
    }
       
}
