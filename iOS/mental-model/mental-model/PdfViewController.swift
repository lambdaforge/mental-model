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
    
    //
    // UIViewController Methods
    //
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationController?.isNavigationBarHidden = true
        view.backgroundColor = BackgroundColor
        let banner = Banner(atTopOf: view)
        banner.addBackButton(target: self, action: #selector(goBack))
        view.addSubview(banner)
        
        let h = view.frame.height - ScreenTop
        let wFrame = CGRect(x: 0.0, y: ScreenTop, width: view.frame.width, height: h)
        let webConfiguration = WKWebViewConfiguration()
        
        webView = WKWebView(frame: wFrame, configuration: webConfiguration)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        view.addSubview(webView)
    
        if let url = Bundle.main.url(forResource: "manual", withExtension: "pdf") {
            webView.loadFileURL(url, allowingReadAccessTo: url)
        } else {
            Alert.missingResource(viewController: self, resource: "manual.pdf")
        }
    }
    
    // Button actions
    
    @IBAction func goBack(sender: UIButton!) {
        print("Load home view")
        self.dismiss(animated: true, completion: {});
        self.navigationController?.popViewController(animated: true);
    }
}
