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
    
    override func viewWillLayoutSubviews() {
        leftButton.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true
        leftButton.centerXAnchor.constraint(equalTo: leftColumn.centerXAnchor).isActive = true
        rightButton.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true
        rightButton.centerXAnchor.constraint(equalTo: rightColumn.centerXAnchor).isActive = true
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let halfWidth = view.frame.width / 2.0
        
        view.backgroundColor = .white
        
        leftColumn = UIView()
        leftColumn.frame = CGRect(x: 0, y: 0, width: halfWidth, height: view.frame.height)
        leftButton = makeButton(label: "Upload", action: #selector(changeToUpload))
        leftColumn.addSubview(leftButton)
        view.addSubview(leftColumn)
        
        rightColumn = UIView()
        rightColumn.frame = CGRect(x: halfWidth, y: 0, width: halfWidth, height: view.frame.height)
        rightButton = makeButton(label: "Start Session", action: #selector(changeToWebApp))
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

