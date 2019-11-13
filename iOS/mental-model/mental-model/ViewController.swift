//
//  ViewController.swift
//  mental-model
//
//  Created by Judith on 07.08.19.
//  Copyright © 2019 lambdaforge. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    var bannerView: UIView!
    var imageView: UIImageView!
    
    var explanationView: UIView!
    var explanation: TextBox!
    
    var leftButton: UIButton!
    var leftColumn: UIView!
    var middleButton: UIButton!
    var middleColumn: UIView!
    var rightButton: UIButton!
    var rightColumn: UIView!
    
    
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
    
    override func viewWillLayoutSubviews() {
        
        imageView.centerYAnchor.constraint(equalTo: bannerView.centerYAnchor).isActive = true
        imageView.centerXAnchor.constraint(equalTo: bannerView.centerXAnchor).isActive = true
        
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
    
    
    private func addBanner() {
        let w = Int(view.frame.size.width)
        let h = Int(BannerHeight)
        
        bannerView = UIView(frame: CGRect(x: 0, y: 0, width: w, height: h))

        let bgView = UIImageView(frame: CGRect(x: 0, y: 0, width: w, height: h))
        bgView.image = UIImage(named: "bannerBG")
        bannerView.addSubview(bgView)
        
        imageView = UIImageView(frame: CGRect(x: 0, y: 0, width: w, height: h))
        imageView.contentMode = .scaleAspectFit
        imageView.image = UIImage(named: "bannerImage")
        bannerView.addSubview(imageView)
        
        self.navigationController?.navigationBar.frame = CGRect(x: 0, y: 0, width: w, height: h)
        self.navigationController?.navigationBar.insertSubview(bannerView, at: 2)
        self.navigationController?.navigationBar.tintColor = .white;
        
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        view.backgroundColor = .white
        
        addBanner() // for all views
        addButtonRow()
        addExplanationBox()
    }
    
    private func addExplanationBox() {
        
        let w: CGFloat = self.view.frame.width * CGFloat(ExplanationBoxWidthFraction)
        let leftBound = (view.frame.width - w) / 2.0
        let hButtons = leftButton.frame.size.height
        let hBanner = bannerView.frame.size.height
        let h = (view.safeAreaLayoutGuide.layoutFrame.size.height - hBanner - hButtons) / 2

        explanationView = UIView(frame: CGRect(x: leftBound, y: ScreenTop, width: w, height: h))
        view.addSubview(explanationView)

        explanation = TextBox(frame: CGRect(x: 0, y: 0, width: w, height: h))
        explanation.text = Explanation.home
        explanation.adjustSize()
        view.addSubview(explanation)
    }
    
    private func yOffset() -> CGFloat {
        return bannerView.frame.size.height + UIApplication.shared.statusBarFrame.height
    }
    
    private func addButtonRow() {
        let thirdWidth = view.frame.width / 3.0
        
        leftColumn = UIView()
        leftColumn.frame = CGRect(x: 0, y: yOffset(), width: thirdWidth, height: view.frame.height - yOffset())
        leftButton = makeButton(label: "Upload Files", action: #selector(changeToUpload))
        leftColumn.addSubview(leftButton)
        view.addSubview(leftColumn)
        
        middleColumn = UIView()
        middleColumn.frame = CGRect(x: thirdWidth, y: yOffset(), width: thirdWidth, height: view.frame.height - yOffset())
        middleButton = makeButton(label: "Start Session", action: #selector(changeToWebApp))
        middleColumn.addSubview(middleButton)
        view.addSubview(middleColumn)
        
        rightColumn = UIView()
        rightColumn.frame = CGRect(x: 2*thirdWidth, y: yOffset(), width: thirdWidth, height: view.frame.height - yOffset())
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
}

