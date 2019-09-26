//
//  WebViewController.swift
//  mental-model
//
//  Created by Judith on 07.08.19.
//  Copyright © 2019 lambdaforge. All rights reserved.
//

import UIKit
import WebKit

class WebViewController: UIViewController, WKUIDelegate, WKNavigationDelegate {
    
    var webView: WKWebView!
    var downloadFileName = "mme_tool.csv"
    
    override func loadView() {
        print("Webapp loaded")
        let webConfiguration = WKWebViewConfiguration()
        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        view = webView
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        /*
         // load from same directory as html file
         if let url = Bundle.main.url(forResource: "www/index", withExtension: "html") {
         webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
         }*/
        let htmlURL = Bundle.main.url(forResource: "www/index", withExtension: "html")
        let request = URLRequest(url: htmlURL!)
        webView.load(request)
    }
    
    // WK Navigation Delegate Method

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                                       decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let url = navigationAction.request.url!.absoluteString;
        print("Download \(url)")
        
        if (url.starts(with: "data"))  {
            let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
            let documentsDirectory = paths[0]
            let targetFile = documentsDirectory.appendingPathComponent(downloadFileName)
            
        
            decisionHandler(WKNavigationActionPolicy.cancel);
            let startIndex = url.index(after: url.firstIndex(of: ",") ?? url.endIndex)
            let dataString = url.suffix(from: startIndex)
            
            do {
                try dataString.write(to: targetFile, atomically: true, encoding: String.Encoding.utf8)
                showMessage(message: "File \(downloadFileName) was saved to Documents directory")
                
            } catch {
                showMessage(message: "Data could not be downloaded")
                print(error)
            }
            
            return;
        }
        decisionHandler(WKNavigationActionPolicy.allow);
    }
    
    private func showMessage(message: String) {
        let alert = UIAlertController(title: "Download", message: message, preferredStyle: .alert)
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel, handler: nil)
        alert.addAction(cancelAction)
        self.present(alert, animated: true)
    }
    
}

