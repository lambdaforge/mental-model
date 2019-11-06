//
//  ViewController.swift
//  mental-model
//
//  Created by Judith on 07.08.19.
//  Copyright © 2019 lambdaforge. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    
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
        let webView = WebViewController()
        self.navigationController?.pushViewController(webView, animated: true)
    }
    /*
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        let height: CGFloat = 200 //whatever height you want to add to the existing height
        let bounds = self.navigationController!.navigationBar.bounds
        self.navigationController?.navigationBar.frame = CGRect(x: 0, y: 0, width: bounds.width, height: height)
    }*/
    /*
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        let height = CGFloat(72)
        self.navigationController?.navigationBar.frame = CGRect(x: 0, y: 0, width: view.frame.width, height: height)
    }*/
    
    override func viewWillLayoutSubviews() {
        
        leftButton.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true
        leftButton.centerXAnchor.constraint(equalTo: leftColumn.centerXAnchor).isActive = true
        middleButton.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true
        middleButton.centerXAnchor.constraint(equalTo: middleColumn.centerXAnchor).isActive = true
        rightButton.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true
        rightButton.centerXAnchor.constraint(equalTo: rightColumn.centerXAnchor).isActive = true
        
        imageView.centerYAnchor.constraint(equalTo: bannerView.centerYAnchor).isActive = true
        imageView.centerXAnchor.constraint(equalTo: bannerView.centerXAnchor).isActive = true
        
    }
    
    var bannerView: UIView!
    var imageView: UIImageView!
    
    func addBanner() {
        let width = self.view.frame.size.width
        
        bannerView = UIView(frame: CGRect(x: 0, y: 0, width: width, height: 120))

        let bgImage = UIImage(named: "bannerBG")
        
        let bgView = UIImageView(frame: CGRect(x: 0, y: 0, width: width, height: 120))
        bgView.image = bgImage
        bannerView.addSubview(bgView)
        
        imageView = UIImageView(frame: CGRect(x: 0, y: 0, width: width, height: 120))
        imageView.contentMode = .scaleAspectFit
        imageView.image = UIImage(named: "bannerImage")
        bannerView.addSubview(imageView)
        
        self.navigationController?.navigationBar.frame = CGRect(x: 0, y: 0, width: self.view.frame.size.width, height: 120.0)
        self.navigationController?.navigationBar.insertSubview(bannerView, at: 2)
        
        self.navigationController?.navigationBar.tintColor = .white;
        
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        addBanner() //
        
        let thirdWidth = view.frame.width / 3.0
        view.backgroundColor = .white
        
        leftColumn = UIView()
        leftColumn.frame = CGRect(x: 0, y: 100, width: thirdWidth, height: view.frame.height)
        leftButton = makeButton(label: "Upload Files", action: #selector(changeToUpload))
        leftColumn.addSubview(leftButton)
        view.addSubview(leftColumn)
        
        middleColumn = UIView()
        middleColumn.frame = CGRect(x: thirdWidth, y: 0, width: thirdWidth, height: view.frame.height)
        middleButton = makeButton(label: "Start Session", action: #selector(changeToWebApp))
        middleColumn.addSubview(middleButton)
        view.addSubview(middleColumn)
        
        rightColumn = UIView()
        rightColumn.frame = CGRect(x: 2*thirdWidth, y: 0, width: thirdWidth, height: view.frame.height)
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

