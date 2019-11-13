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
        print("Upload music")
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
    
    //
    // ViewController Methods
    //
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.navigationController?.navigationBar.frame = CGRect(x: 0, y: 0, width: self.view.frame.size.width, height: BannerHeight) // otherwise not taken into account
        
        view.backgroundColor = .white
        
        let space = (view.frame.height - ScreenTop) / 4.0
        let mediaViewOffset = ScreenTop + space
        
        addExplanationBox(maxH: space)
        
        imageListView = makeMediaView(row: 0, type: "Image", uploaded: imageList, addAction: #selector(uploadImage), offset: mediaViewOffset, space: space)
        videoListView = makeMediaView(row: 1, type: "Video", uploaded: videoList, addAction: #selector(uploadVideo), offset: mediaViewOffset, space: space)
        musicListView = makeMediaView(row: 2, type: "Music", uploaded: musicList, addAction: #selector(uploadMusic), offset: mediaViewOffset, space: space)
        
    }
    
    override func viewDidLayoutSubviews() {
        explanation.center = explanationView.center
    }
    
    private func addExplanationBox(maxH: CGFloat) {
        
        let w: CGFloat = self.view.frame.width * CGFloat(ExplanationBoxWidthFraction)
        let leftBound = (view.frame.width - w) / 2.0
        
        explanationView = UIView(frame: CGRect(x: leftBound, y: ScreenTop, width: w, height: maxH))
        view.addSubview(explanationView)
        
        explanation = TextBox(frame: CGRect(x: 0, y: 0, width: w, height: maxH))
        explanation.text = Explanation.upload
        explanation.adjustSize()
        view.addSubview(explanation)
    }
    
    private func makeMediaView(row: Int, type: String, uploaded: MediaListDataSource, addAction: Selector, offset: CGFloat, space: CGFloat) -> UITableView {
        let subview = UIView()
        let table = UITableView()
        let yPos = offset + (CGFloat(row) * space)
        
        table.delegate = uploaded
        table.dataSource = uploaded
        table.separatorStyle = .none
        table.register(UITableViewCell.self, forCellReuseIdentifier: "label")
        
        subview.frame = CGRect(x: 0, y: yPos, width: view.frame.width, height: space)
        subview.addSubview(label(text: "     \(type) Files  "))
        subview.addSubview(button(text: "Add File", action: addAction))
        subview.addSubview(table)
        
        table.translatesAutoresizingMaskIntoConstraints = false
        table.topAnchor.constraint(equalTo: subview.topAnchor, constant: 50).isActive = true
        table.leftAnchor.constraint(equalTo: subview.leftAnchor, constant: 20).isActive = true
        table.bottomAnchor.constraint(equalTo: subview.bottomAnchor).isActive = true
        table.rightAnchor.constraint(equalTo: subview.rightAnchor).isActive = true
        
        view.addSubview(subview)
        
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
        let label = UILabel(frame: CGRect(x: 0, y: 0, width: 150, height: 30))
        label.text = text
        label.font = UIFont.boldSystemFont(ofSize: 20.0)
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
