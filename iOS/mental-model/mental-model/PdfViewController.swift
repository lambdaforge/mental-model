//
//  WebViewController.swift
//  mental-model
//
//  Created by Judith on 07.08.19.
//  Copyright © 2019 lambdaforge. All rights reserved.
//

import UIKit
import WebKit

class PdfViewController: UIViewController, WKUIDelegate, WKNavigationDelegate {
    
    var webView: WKWebView!
    
    @IBAction func goBack(sender: UIButton!) {
        print("Load home view")
        self.dismiss(animated: true, completion: {});
        self.navigationController?.popViewController(animated: true);
    }
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationController?.isNavigationBarHidden = true
        view.backgroundColor = BackgroundColor
        let banner = Banner(atTopOf: view)
        banner.addBackButton(target: self, action: #selector(goBack))
        view.addSubview(banner)
        
        let webConfiguration = WKWebViewConfiguration()
        let h = view.frame.height - ScreenTop
        
        let wFrame = CGRect(x: 0.0, y: ScreenTop, width: view.frame.width, height: h)
        
        webView = WKWebView(frame: wFrame, configuration: webConfiguration)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        view.addSubview(webView)
        
        let url = Bundle.main.url(forResource: "ManualNOMMET", withExtension: "pdf")
        webView.load(URLRequest(url: url!))
        
        
    }
    
  
    
}

