//
//  WebViewController.swift
//  mental-model
//
//  Created by Judith on 07.08.19.
//  Copyright © 2019 lambdaforge UG. All rights reserved.
//

import UIKit
import WebKit

class WebViewController: UIViewController,
        WKUIDelegate,
        WKNavigationDelegate,
        UIDocumentPickerDelegate {
    
    var webView: WKWebView!
    let temporaryUserDataFileLocation = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]    
    
    //
    // UIViewControllerMethods
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
        webConfiguration.mediaTypesRequiringUserActionForPlayback = [] // new
        
        webView = WKWebView(frame: wFrame, configuration: webConfiguration)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        view.addSubview(webView)
        
        if (!FileManager.default.fileExists(atPath: WebDir.path)) {
            Popup.missingResource(presenting: self, resource: WebDir.lastPathComponent)
        } else {
            let url = WebDir.appendingPathComponent(HTMLFileName)
            webView.loadFileURL(url, allowingReadAccessTo: WebDir) // new
        }
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        
        // Stop all audio from playing after view has been closed
        let stopVideoScript = "var videos = document.getElementsByTagName('video'); for( var i = 0; i < videos.length; i++ ){videos.item(i).pause()}"
        let stopAudioScript = "var audios = document.getElementsByTagName('audio'); for( var i = 0; i < audios.length; i++ ){audios.item(i).pause()}"
        
        if (webView != nil) {
            webView.evaluateJavaScript(stopVideoScript, completionHandler:nil)
            webView.evaluateJavaScript(stopAudioScript, completionHandler:nil)
        }
        else {
            print("WebView has not bee initialized")
        }
    }
    
    // Button actions
    
    @IBAction func goBack(sender: UIButton!) {
        print("Load home view")
        self.dismiss(animated: true, completion: {});
        self.navigationController?.popViewController(animated: true);
    }
    
    //
    // WKNavigationDelegate Method
    //
    
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                                       decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let url = navigationAction.request.url!.absoluteString;
        print("Download \(url)")
        
        if (url.starts(with: "data"))  {
            let targetFile = temporaryUserDataFileLocation.appendingPathComponent(DownloadFileName)
        
            decisionHandler(WKNavigationActionPolicy.cancel);
            let startIndex = url.index(after: url.firstIndex(of: ",") ?? url.endIndex)
            let dataString = String(url.suffix(from: startIndex))
            
            let decoded = dataString.removingPercentEncoding
            
            do {

                if FileManager.default.fileExists(atPath: targetFile.path) {
                    try FileManager.default.removeItem(at: targetFile)
                }
                try decoded!.write(to: targetFile, atomically: true, encoding: String.Encoding.utf8)
                print("Saved data to \(targetFile.path)")
                print("Opening export dialog...")
                Popup.decision(presenting: self, title: "Save data externally?", message: "Pick a location in the cloud or another application. If you decide not to save the data externally, it will be saved in the M-Tool directory only.") { _ in
                    self.openDocumentPicker(url: targetFile)
                }
                
                
                
            } catch {
                Popup.info(presenting: self, title: "Data export failed!",
                           message: "Data could not be saved on device.")
                print(error)
            }
            
            return;
        }
        decisionHandler(WKNavigationActionPolicy.allow);
    }
    
    
    // Helper functions
    
    private func openDocumentPicker(url: URL) {
        let pickerController = UIDocumentPickerViewController(url: url, in: UIDocumentPickerMode.exportToService)
        pickerController.delegate = self
        pickerController.allowsMultipleSelection = false
        pickerController.modalPresentationStyle = .formSheet
        present(pickerController, animated: true, completion: nil) // completion of building dialog, not download
    }
    
    
}

