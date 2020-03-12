//
//  WebViewController.swift
//  mental-model
//
//  Created by Judith on 07.08.19.
//  Copyright © 2019 lambdaforge UG. All rights reserved.
//

import UIKit
import WebKit

class WebViewController: UIViewController, WKUIDelegate, WKNavigationDelegate {
    
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
        webConfiguration.mediaTypesRequiringUserActionForPlayback = [] // new
        
        let h = view.frame.height - ScreenTop
        
        let wFrame = CGRect(x: 0.0, y: ScreenTop, width: view.frame.width, height: h)
        
        webView = WKWebView(frame: wFrame, configuration: webConfiguration)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        view.addSubview(webView)
        
        let htmlURL = WebDir.appendingPathComponent(HTMLFileName)
        let request = URLRequest(url: htmlURL)
        webView.load(request)
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        
        // Stop all audio from playing after view has been closed
        let stopVideoScript = "var videos = document.getElementsByTagName('video'); for( var i = 0; i < videos.length; i++ ){videos.item(i).pause()}"
        self.webView.evaluateJavaScript(stopVideoScript, completionHandler:nil)
        let stopAudioScript = "var audios = document.getElementsByTagName('audio'); for( var i = 0; i < audios.length; i++ ){audios.item(i).pause()}"
        self.webView.evaluateJavaScript(stopAudioScript, completionHandler:nil)
    }
    
    // WK Navigation Delegate Method

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                                       decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let url = navigationAction.request.url!.absoluteString;
        print("Download \(url)")
        
        if (url.starts(with: "data"))  {
            let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
            let documentsDirectory = paths[0]
            let targetFile = documentsDirectory.appendingPathComponent(DownloadFileName)
            
        
            decisionHandler(WKNavigationActionPolicy.cancel);
            let startIndex = url.index(after: url.firstIndex(of: ",") ?? url.endIndex)
            let dataString = url.suffix(from: startIndex)
            
            do {
                try dataString.write(to: targetFile, atomically: true, encoding: String.Encoding.utf8)
                showMessage(message: "File \(DownloadFileName) was saved to Documents directory")
                
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
        let button = UIAlertAction(title: "OK", style: .cancel, handler: nil)
        alert.addAction(button)
        self.present(alert, animated: true)
    }
    
}

