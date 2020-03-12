//
//  UploadViewController.swift
//  mental-model
//
//  Created by Judith on 07.08.19.
//  Copyright © 2019 lambdaforge UG. All rights reserved.
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
   
    var mediaPickerVC: UIViewController!
    
    var explanationView: UIView!
    var explanation: TextBox!
    
    var imageListView: UITableView!
    var videoListView: UITableView!
    var musicListView: UITableView!
    
    var imageList = MediaListDataSource(labels: [String]())
    var videoList = MediaListDataSource(labels: [String]())
    var musicList = MediaListDataSource(labels: [String]())

    
    //
    // Button actions
    //
    
    @IBAction func uploadMusic(sender: UIButton!) {
        print("Upload audio")
        let myMediaPickerVC = MPMediaPickerController(mediaTypes: MPMediaType.music)
        myMediaPickerVC.delegate = self
        myMediaPickerVC.allowsPickingMultipleItems = true
        myMediaPickerVC.popoverPresentationController?.sourceView = sender
        
        mediaPickerVC = myMediaPickerVC
        present(mediaPickerVC, animated: true, completion: nil)
        
    }
    
    @IBAction func uploadImage(sender: UIButton!) {
        print("Upload image")
        mediaPickerVC = visualMediaPicker(mediaType: "public.image")
        present(mediaPickerVC, animated: true, completion: nil)
    }
    
    @IBAction func uploadVideo(sender: UIButton!) {
        print("Upload video")
        mediaPickerVC = visualMediaPicker(mediaType: "public.movie")
        present(mediaPickerVC, animated: true, completion: nil)
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
        explanation.adjustSize(nLines: 3)
        
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
        table.topAnchor.constraint(equalTo: titleBar.topAnchor, constant: 30).isActive = true
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
        mediaPicker.dismiss(animated: true, completion: nil)
        print("Upload")
        print(mediaItemCollection)
        for item in mediaItemCollection.items {
            
            print(item.title!)
            print(item.mediaType)
            
            // Get image URL
            let url = item.assetURL
            print("Reading file at: \(String(describing: url!.path))")
            
            // Determine current file name
            let filename = url!.lastPathComponent
            print("Current file name: \(String(describing: filename))")
            
            let data = try? Data(contentsOf: url!)
            checkedImport(data: data!, subdir: "audio", filename: filename, listView: musicListView!, listData: musicList)
        }
    }
    
    func mediaPickerDidCancel(_ mediaPicker: MPMediaPickerController) {
        mediaPicker.dismiss(animated: true, completion: nil)
    }
    
    
    //
    // UIImagePickerControllerDelegate Methods
    //
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        
        picker.dismiss(animated: true, completion: nil)
        
        let photoAsset = info[UIImagePickerController.InfoKey.phAsset]! as? PHAsset
        let mediaType = info[UIImagePickerController.InfoKey.mediaType]! as? String

        print("Media type: \(String(describing: mediaType))")
        if mediaType == "public.image" {
            let url = info[UIImagePickerController.InfoKey.imageURL] as? URL
            let filename = getFilename(url: url!, asset: photoAsset)
            var data = try? Data(contentsOf: url!)
            if let edited = info[UIImagePickerController.InfoKey.editedImage] as? UIImage {
                data = edited.pngData()
            }
            
            checkedImport(data: data!, subdir: "images", filename: filename, listView: imageListView!, listData: imageList)
        }
        else {
            let url = info[UIImagePickerController.InfoKey.mediaURL] as? URL
            
            let data = try? Data(contentsOf: url!)
            let filename = getFilename(url: url!, asset: photoAsset)
            
            checkedImport(data: data!, subdir: "video", filename: filename, listView: videoListView!, listData: videoList)
        }
        
        picker.dismiss(animated: true, completion: nil)
    }

    //
    // Helper Functions
    //
    
    private func getFilename(url: URL, asset: PHAsset?) -> String {
        
        print("Reading file at: \(String(describing: url.path))")
        
        let filename = url.lastPathComponent
        print("Current file name: \(String(describing: filename))")
            
        // Restore original file base name, but keep current file extension
        var newFilename = filename
        
        if (asset != nil) {
            let assetResources = PHAssetResource.assetResources(for: asset!)
            let originalFilename = assetResources.first!.originalFilename
            let basename = originalFilename.prefix(upTo: originalFilename.lastIndex(of: ".")!)
            let ext = filename.suffix(from: (filename.lastIndex(of: "."))!)
            
            newFilename = String(basename + ext)
            
            print("Original file name: \(String(describing: originalFilename))")
            print("Modified file name: \(String(describing: newFilename))")
        }
        return newFilename
    }

    private func checkedImport(data: Data, subdir: String, filename: String, listView: UITableView, listData: MediaListDataSource) {
        let targetDir = WebDir.appendingPathComponent(subdir)
        let targetFile = targetDir.appendingPathComponent(filename)
        
        print("Checked file import...")
        
        if (FileManager.default.fileExists(atPath: targetFile.path)){
            print(" File already exists")
            let title = "Do you want to overwrite \(filename)?"
            let message = "A file named \(filename) already exists in this application."
            let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)

            alert.addAction(UIAlertAction(title: "Yes", style: .default, handler: { _ in
                self.importFile(data: data, subdir: subdir, filename: filename, listView: listView, listData: listData)
                
            }))
            alert.addAction(UIAlertAction(title: "No", style: .cancel){ action in
                self.dismiss(animated: true)
                }
            )

            self.present(alert, animated: true, completion: nil)
                        
            print(" After alert")
        }
        else {
            print(" File does not yet exists")
            importFile(data: data, subdir: subdir, filename: filename, listView: listView, listData: listData)
        }
    }
    
    
    private func importFile(data: Data, subdir: String, filename: String, listView: UITableView, listData: MediaListDataSource) {
        
        let targetDir = WebDir.appendingPathComponent(subdir)
        let targetFile = targetDir.appendingPathComponent(filename)
        
        do {
            print("Writing to \(targetFile.path)")
            try data.write(to: targetFile)
            
            try saveToMediaList(filename: filename, fileSubdir: subdir)
            
            if (!listData.labels.contains(filename)) {
                print("Item \(filename) added to shown list of imported files")
                listData.labels.append(filename)
                listView.reloadData()
            }
            else {
                print("Item \(filename) is already shown in list of imported files")
            }
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
        let targetFile = WebDir.appendingPathComponent(MediaSourcesFileName)
        print("Updating media list...")
        do {
            let content = try String(contentsOf: targetFile, encoding: .utf8)
            
            let startIndex = content.firstIndex(of: "{") ?? content.endIndex
            let endIndex = content.lastIndex(of: ";") ?? content.endIndex
            let jsonContent = content[startIndex..<endIndex].data(using: .utf8)!
            let jsPrefix = content.prefix(upTo: startIndex)
            
            let json = try JSONSerialization.jsonObject(with: jsonContent, options: [])
            var jsonArray = json as! [String: [String]]
            
            if (!jsonArray[fileSubdir]!.contains(filename)) {
                print(" Add value: \(filename)")
                jsonArray[fileSubdir]!.append(filename)
                
                let data = try JSONSerialization.data(withJSONObject: jsonArray, options: JSONSerialization.WritingOptions.prettyPrinted)
                
                let convertedString = String(data: data, encoding: String.Encoding.utf8)
                let jsonOutput = jsPrefix + convertedString!
                
                print(" Replacing \(targetFile.path) with new version")
                try FileManager.default.removeItem(at: targetFile)
                try jsonOutput.write(to: targetFile, atomically: true, encoding: String.Encoding.utf8)
                
            } else {
                print(" \(filename) already in list of \(fileSubdir) - media list remains unchanged")
            }
        }
        catch {
            print(error)
            throw ImportError.failedWritingToMediaList
        }

    }
    
    private func showImportError() {
        let message = "Something went wrong while importing the File. Please check if space is low and try again later."
        let alert = UIAlertController(title: "Import Error", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .cancel){ action in
                self.dismiss(animated: true)
            }
        )
        self.present(alert, animated: true)
    }
    
}
