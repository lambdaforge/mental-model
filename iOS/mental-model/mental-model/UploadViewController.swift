//
//  UploadViewController.swift
//  mental-model
//
//  Created by Judith on 07.08.19.
//  Copyright © 2019 lambdaforge. All rights reserved.
//
import UIKit
import Photos
import MediaPlayer

enum ImportError: Error {
    case failedWritingToMediaList
}

class UploadViewController:  UIViewController,
        UIImagePickerControllerDelegate, UINavigationControllerDelegate,
        MPMediaPickerControllerDelegate {
   
    var explanationView: UIView!
    var explanation: TextBox!
    
    var imageListView: UITableView!
    var videoListView: UITableView!
    var musicListView: UITableView!
    
    var imageList = MediaListDataSource(labels: [String]())
    var videoList = MediaListDataSource(labels: [String]())
    var musicList = MediaListDataSource(labels: [String]())
    
    let webDir = Bundle.main.resourceURL!.appendingPathComponent("www")

    
    //
    // Button actions
    //
    
    @IBAction func uploadMusic(sender: UIButton!) {
        print("Upload audio")
        let myMediaPickerVC = MPMediaPickerController(mediaTypes: MPMediaType.music)
        myMediaPickerVC.delegate = self
        myMediaPickerVC.allowsPickingMultipleItems = true
        myMediaPickerVC.popoverPresentationController?.sourceView = sender
        present(myMediaPickerVC, animated: true, completion: nil)
        
    }
    
    @IBAction func uploadImage(sender: UIButton!) {
        print("Upload image")
        let pickerController = visualMediaPicker(mediaType: "public.image")
        present(pickerController, animated: true, completion: nil)
    }
    
    @IBAction func uploadVideo(sender: UIButton!) {
        print("Upload video")
        let pickerController = visualMediaPicker(mediaType: "public.movie")
        present(pickerController, animated: true, completion: nil)
    }
    
    @IBAction func startSession(sender: UIButton!) {
        print("Start session")
        let webView = WebViewController()
        self.navigationController?.pushViewController(webView, animated: true)
    }
    
    @IBAction func goBack(sender: UIButton!) {
        print("Load home view")
        self.dismiss(animated: true, completion: {});
        self.navigationController?.popViewController(animated: true);
    }
    
    //
    // ViewController Methods
    //
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationController?.isNavigationBarHidden = true
        view.backgroundColor = BackgroundColor
        let banner = Banner(atTopOf: view)
        banner.addBackButton(target: self)
        
        view.addSubview(banner)
        
        let hView = view.frame.height
        let explanationBoxOffset = ScreenTop + Title.height
        let sessionButtonRowOffset = hView - UploadScreen.buttonHeight - 2*Padding
        
        let space = (sessionButtonRowOffset - ScreenTop) / 4.0
        let mediaViewOffset = ScreenTop + space
        
        addTitle(offset: ScreenTop + Title.topPadding, height: Title.height)
        addExplanationBox(offset: explanationBoxOffset, maxHeight: mediaViewOffset - explanationBoxOffset)
        addSessionButton(yOffset: sessionButtonRowOffset)
        
        videoListView = makeMediaView(row: 1, type: "Video", uploaded: videoList, addAction: #selector(uploadVideo), offset: mediaViewOffset, space: space)
        musicListView = makeMediaView(row: 2, type: "Audio", uploaded: musicList, addAction: #selector(uploadMusic), offset: mediaViewOffset, space: space)
        imageListView = makeMediaView(row: 0, type: "Image", uploaded: imageList, addAction: #selector(uploadImage), offset: mediaViewOffset, space: space)
        
    }
    
    func addSessionButton(yOffset: CGFloat) {
        let sessionButton = UIButton(type: .roundedRect)
        let wView = view.frame.width
        let x = wView - UploadScreen.buttonWidth - Padding
        let y = yOffset + Padding
        sessionButton.frame = CGRect(x: x, y: y, width: UploadScreen.buttonWidth, height: UploadScreen.buttonHeight)
        sessionButton.layer.borderWidth = 1
        sessionButton.layer.borderColor = sessionButton.tintColor.cgColor
        sessionButton.layer.cornerRadius = 5
        sessionButton.setTitle("Start Session", for: .normal)
        sessionButton.addTarget(self, action: #selector(startSession), for: .touchUpInside)
        
        view.addSubview(sessionButton)
        
    }
    
    override func viewDidLayoutSubviews() {
        explanation.center = explanationView.center
    }
    
    private func addTitle(offset: CGFloat, height: CGFloat) {
        let label = UILabel(frame: CGRect(x: 0, y: offset, width: view.frame.width, height: height))
        label.text = Title.importScreen
        label.font = UIFont.boldSystemFont(ofSize: Title.fontSize)
        label.textColor = Title.color
        label.textAlignment = .center;
        view.addSubview(label)
    }
    
    private func addExplanationBox(offset: CGFloat, maxHeight: CGFloat) {
        
        let w: CGFloat = self.view.frame.width * CGFloat(ExplanationBox.widthFraction)
        let leftBound = (view.frame.width - w) / 2.0
        
        explanationView = UIView(frame: CGRect(x: leftBound, y: offset, width: w, height: maxHeight))
        view.addSubview(explanationView)
        
        explanation = TextBox(frame: CGRect(x: 0, y: 0, width: w, height: maxHeight))
        explanation.text = Explanation.upload
        explanation.adjustSize(nLines:4)
        
        view.addSubview(explanation)
    }
    
    private func makeMediaView(row: Int, type: String, uploaded: MediaListDataSource, addAction: Selector, offset: CGFloat, space: CGFloat) -> UITableView {
        let titleBar = UIView()
        let table = UITableView()
        let yPos = offset + (CGFloat(row) * space)
        
        table.delegate = uploaded
        table.dataSource = uploaded
        table.separatorStyle = .none
        table.register(UITableViewCell.self, forCellReuseIdentifier: "label")
        table.backgroundColor = BackgroundColor
        
        titleBar.frame = CGRect(x: 0, y: yPos, width: view.frame.width, height: space)
        titleBar.addSubview(label(text: "     \(type) Files  "))
        titleBar.addSubview(button(text: "Add File", action: addAction))
        titleBar.addSubview(table)
        
        table.translatesAutoresizingMaskIntoConstraints = false
        table.topAnchor.constraint(equalTo: titleBar.topAnchor, constant: 50).isActive = true
        table.leftAnchor.constraint(equalTo: titleBar.leftAnchor, constant: 20).isActive = true
        table.bottomAnchor.constraint(equalTo: titleBar.bottomAnchor).isActive = true
        table.rightAnchor.constraint(equalTo: titleBar.rightAnchor).isActive = true
        
        view.addSubview(titleBar)
        
        return table
    }
    
    //
    // MPMediaPickerControllerDelegate Methods
    //
    
    func mediaPicker(_ mediaPicker: MPMediaPickerController, didPickMediaItems mediaItemCollection: MPMediaItemCollection) {
        print("Upload")
        print(mediaItemCollection)
        for item in mediaItemCollection.items {
            
            print(item.title!)
            let audioURL = item.assetURL
            let filename = audioURL!.lastPathComponent
            
            print("Reading \(String(describing: filename))")
            print("at \(String(describing: audioURL?.path))")
 
            do {
                let data = try Data(contentsOf: audioURL!)
                importFile(data: data, subdir: "audio", filename: filename, listView: musicListView!, listData: musicList)

            } catch {
                print(error)
                let message = "Audio file '\(filename)' could not be read."
                let alert = UIAlertController(title: "Import Error", message: message, preferredStyle: .alert)
                self.present(alert, animated: true)
            }
        }
        mediaPicker.dismiss(animated: true, completion: nil)
    }
    
    func mediaPickerDidCancel(_ mediaPicker: MPMediaPickerController) {
        mediaPicker.dismiss(animated: true, completion: nil)
    }
    
    
    //
    // UIImagePickerControllerDelegate Methods
    //
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) { // also for video?
        
        let url = info[UIImagePickerController.InfoKey.imageURL] as? URL
        let filename = url?.lastPathComponent
        
        print("Reading \(String(describing: filename))")
        print("at \(String(describing: url?.path))")
        
        print(info[UIImagePickerController.InfoKey.mediaType]!)
        
        if info[UIImagePickerController.InfoKey.mediaType] as! String == "public.image" {
            let subdir = "images"
            if let pickedImage = info[UIImagePickerController.InfoKey.editedImage] as? UIImage {
                let data = pickedImage.pngData()
                importFile(data: data!, subdir: subdir, filename: filename!, listView: imageListView!, listData: imageList)
            }
        }
        else { // TODO: test!
            let subdir = "video"
            if let pickedImage = info[UIImagePickerController.InfoKey.editedImage] as? UIImage {
                let data = pickedImage.pngData()
                importFile(data: data!, subdir: subdir, filename: filename!, listView: imageListView!, listData: imageList)
            }
        }

        dismiss(animated: true, completion: nil)
    
    }

    //
    // Helper Functions
    //
    
    private func importFile(data: Data, subdir: String, filename: String, listView: UITableView, listData: MediaListDataSource) {
        
        let targetDir = webDir.appendingPathComponent(subdir)
        let targetFile = targetDir.appendingPathComponent(filename)
        
        print("Writing to \(targetFile.path)")
        
        do {
            try data.write(to: targetFile)
            try saveToMediaList(filename: filename, fileSubdir: subdir)
            listData.labels.append(filename)
            listView.reloadData()
            print(filename)
        } catch {
            print(error)
            showImportError()
        }
    }
    
    private func label(text: String!) -> UILabel {
        let label = UILabel(frame: CGRect(x: 0, y: 0, width: Section.labelWidth, height: 30))
        label.text = text
        label.font = UIFont.boldSystemFont(ofSize: Section.titleFontSize)
        label.textColor = Section.titleColor
        return label
    }
    
    private func button(text: String, action: Selector) -> UIButton {
        let button = UIButton(type: .roundedRect)
        button.frame = CGRect(x: 150, y: 0, width: 100, height: 30)
        button.layer.borderWidth = 1
        button.layer.borderColor = button.tintColor.cgColor
        button.layer.cornerRadius = 5
        button.setTitle(text, for: .normal)
        button.addTarget(self, action: action, for: .touchUpInside)
        return button
    }
    
    private func visualMediaPicker(mediaType: String) -> UIImagePickerController {
        let pickerController = UIImagePickerController()
        pickerController.delegate = self
        pickerController.allowsEditing = true
        pickerController.mediaTypes = [mediaType]
        pickerController.sourceType = .photoLibrary
        return pickerController
    }
    
    private func saveToMediaList(filename: String, fileSubdir: String) throws {
        let targetFile = Bundle.main.url(forResource: "www/mediaSources", withExtension: "js")
        do {
            let content = try String(contentsOf: targetFile!, encoding: .utf8)
            let startIndex = content.firstIndex(of: "{") ?? content.endIndex
            let jsonContent = content.suffix(from: startIndex).data(using: .utf8)!
            let jsPrefix = content.prefix(upTo: startIndex)
            
            let json = try JSONSerialization.jsonObject(with: jsonContent, options: [])
            var jsonArray = json as! [String: [String]]
            jsonArray[fileSubdir]!.append(filename)
            try FileManager.default.removeItem(at: targetFile!)

            let data = try JSONSerialization.data(withJSONObject: jsonArray, options: JSONSerialization.WritingOptions.prettyPrinted)
            let convertedString = String(data: data, encoding: String.Encoding.utf8)
            let jsonOutput = jsPrefix + convertedString!
                
            try jsonOutput.write(to: targetFile!, atomically: true, encoding: String.Encoding.utf8)
        }
        catch {
            print(error)
            throw ImportError.failedWritingToMediaList
        }

    }
    
    private func showImportError() {
        let message = "Something went wrong while importing the File. Please check if space is low and try again later."
        let alert = UIAlertController(title: "Import Error", message: message, preferredStyle: .alert)
        self.present(alert, animated: true)
    }
    
}
