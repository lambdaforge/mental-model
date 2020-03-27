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
import MobileCoreServices

enum ImportError: Error {
    case failedWritingToMediaList
}

class UploadViewController: UIViewController,
        UINavigationControllerDelegate,
        UIImagePickerControllerDelegate,
        MPMediaPickerControllerDelegate,
        UIDocumentPickerDelegate {
    
    var explanationView: UIView!
    var explanation: TextBox!
    
    var imageListView: UITableView!
    var videoListView: UITableView!
    var audioListView: UITableView!
    
    var imageList = MediaListDataSource(labels: [String]())
    var videoList = MediaListDataSource(labels: [String]())
    var audioList = MediaListDataSource(labels: [String]())


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
        audioListView = makeMediaView(row: 2, type: "Audio", uploaded: audioList, addAction: #selector(uploadAudio), offset: mediaViewOffset, space: space)
        imageListView = makeMediaView(row: 0, type: "Image", uploaded: imageList, addAction: #selector(uploadImage), offset: mediaViewOffset, space: space)
        
        checkWebdirectory()
        checkPhotoLibraryAuthorization()
        checkMediaLibraryAuthorization()
        checkVideoCaptureAuthorization()

    }
    
    override func viewDidLayoutSubviews() {
        explanation.center = explanationView.center
    }
    
    
    // Helper functions for view controller
    
    private func addSessionButton(yOffset: CGFloat) {
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
    
    
    // Button actions
    
    @IBAction func uploadImage(sender: UIButton!) {
        print("Upload image button pressed")
        openSourcePickerDialog(mediaType: "public.image", photoLibrary: true, savedPhotosAlbum: true, camera: true,
                               mediaLibrary: false, externalDocuments: true)
    }
    
    @IBAction func uploadVideo(sender: UIButton!) {
        print("Upload video button pressed")
        openSourcePickerDialog(mediaType: "public.movie", photoLibrary: true, savedPhotosAlbum: true, camera: false,
                               mediaLibrary: true, externalDocuments: true)
    }
    
    @IBAction func uploadAudio(sender: UIButton!) {
        print("Upload audio button pressed")
        openSourcePickerDialog(mediaType: "public.audio", photoLibrary: false, savedPhotosAlbum: false, camera: false,
                               mediaLibrary: true, externalDocuments: true)
    }
    
    @IBAction func startSession(sender: UIButton!) {
        print("Start session")
        let webView = WebViewController()
        navigationController?.pushViewController(webView, animated: true)
    }
    
    @IBAction func goBack(sender: UIButton!) {
        print("Load home view")
        dismiss(animated: true, completion: nil);
        navigationController?.popViewController(animated: true);
    }
    
    
    // Helper functions for button actions
    
    private func openSourcePickerDialog(mediaType: String,
                                        photoLibrary: Bool,
                                        savedPhotosAlbum: Bool,
                                        camera: Bool,
                                        mediaLibrary: Bool,
                                        externalDocuments: Bool) {
        print("Open source dialog")
        let alert = UIAlertController(title: "Choose file source", message: "", preferredStyle: .alert) // .actionsheet not working
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in
            self.dismiss(animated: true)
        })
        if photoLibrary {
            alert.addAction(UIAlertAction(title: "Photo Library", style: .default) { _ in
                self.dismiss(animated: true)
                self.openImagePicker(mediaType: mediaType, specific: "Photo Library")
            })
        }
        if savedPhotosAlbum {
            alert.addAction(UIAlertAction(title: "Saved Photos Album", style: .default) { _ in
                self.dismiss(animated: true)
                self.openImagePicker(mediaType: mediaType, specific: "Saved Photos Album")
            })
        }
        if camera {
            if (mediaType == "public.image") {
                alert.addAction(UIAlertAction(title: "Camera", style: .default) { _ in
                    self.dismiss(animated: true)
                    self.openImagePicker(mediaType: mediaType, specific: "Camera")
                })
            }
            else {
                print("Camera only allowed for photos, not with \(mediaType)")
            }
        }
        if mediaLibrary {
            alert.addAction(UIAlertAction(title: "Media Library", style: .default) { _ in
                self.dismiss(animated: true)
                self.openMediaPicker(mediaType: mediaType)
            })
        }
        if externalDocuments {
            alert.addAction(UIAlertAction(title: "External Files", style: .default) { _ in
                self.dismiss(animated: true)
                self.openDocumentPicker(mediaType: mediaType)
            })
        }
        present(alert, animated: true)
    }
    
    private func openImagePicker(mediaType: String, specific: String) {
        let pickerController = UIImagePickerController()
        pickerController.delegate = self
        pickerController.allowsEditing = true
        pickerController.mediaTypes = [mediaType]
        
        switch specific {
            case "Photo Library":
                pickerController.sourceType = .photoLibrary
                if (PHPhotoLibrary.authorizationStatus() == .authorized) {
                    present(pickerController, animated: true, completion: nil)
                }
                else {
                    print("Picking media not allowed")
                    Alert.accessDenied(viewController: self, resource: specific)
                }
            case "Saved Photos Album":
                pickerController.sourceType = .savedPhotosAlbum
                if (PHPhotoLibrary.authorizationStatus() == .authorized) {
                    present(pickerController, animated: true, completion: nil)
                }
                else {
                    print("Picking media not allowed")
                    Alert.accessDenied(viewController: self, resource: specific)
                }
            case "Camera":
                pickerController.sourceType = .camera
                if (AVCaptureDevice.authorizationStatus(for: AVMediaType.video) == .authorized) {
                    present(pickerController, animated: true, completion: nil)
                }
                else {
                    print("Picking media not allowed")
                    Alert.accessDenied(viewController: self, resource: specific)
                }
            
            default: print("Unknown image picker resource")
        }
    }
    
    private func openMediaPicker(mediaType: String){
        if let mediaTypes = getMediaLibraryMediaTypes(mediaType: mediaType) {
            let pickerController = MPMediaPickerController(mediaTypes: mediaTypes)
            pickerController.delegate = self
            pickerController.allowsPickingMultipleItems = true
            if (MPMediaLibrary.authorizationStatus() == .authorized) {
                present(pickerController, animated: true, completion: nil)
            }
            else {
                print("Picking media not allowed")
                Alert.accessDenied(viewController: self, resource: "Media Library")
            }
        } else {
            let msg = "Media type '\(mediaType)' not allowed in media picker."
            Alert.info(viewController: self, title: "Incompatible media type!", message: msg)
        }
    }
    
    private func openDocumentPicker(mediaType: String) {
        let pickerController = UIDocumentPickerViewController(documentTypes: [mediaType], in: UIDocumentPickerMode.import)
        pickerController.delegate = self
        pickerController.allowsMultipleSelection = true
        pickerController.modalPresentationStyle = .formSheet
        present(pickerController, animated: true, completion: nil)
    }
    
    private func getMediaLibraryMediaTypes(mediaType: String) -> MPMediaType? {
        var mpMediaTypes: MPMediaType?
        switch mediaType {
            case "public.movie": mpMediaTypes = MPMediaType.anyVideo
            case "public.audio": mpMediaTypes = MPMediaType.anyAudio
            default: print("Invalid media type for media library")
        }
        return mpMediaTypes
    }
    
    
    //
    // UIImagePickerControllerDelegate Methods
    //
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        picker.dismiss(animated: true, completion: nil)
        
        let mediaType: String = info[UIImagePickerController.InfoKey.mediaType] as? String ?? "unknown"
        let data = getImageData(info: info)
        let filename = getFilename(info: info, mediaType: mediaType)

        print("Media type: \(mediaType)")
        switch mediaType {
            case "public.image":
                checkedImport(data: data, subdir: "images", filename: filename, listView: imageListView!, listData: imageList)
            case "public.movie":
                checkedImport(data: data, subdir: "video", filename: filename, listView: videoListView!, listData: videoList)
            default:
                let msg = "Media type: \(mediaType)"
                Alert.info(viewController: self, title: "Incompatible media type!", message: msg)
        }
    }
    
    // Helper functions
    
    private func getURL(info: [UIImagePickerController.InfoKey : Any]) -> URL? {
        var url: URL?
        
        if let imageUrl = info[UIImagePickerController.InfoKey.imageURL] as? URL {
            url = imageUrl
        }
        else if let mediaUrl = info[UIImagePickerController.InfoKey.mediaURL] as? URL {
            url = mediaUrl
        }
        else {
            print(" No URL could be retrieved from info data")
        }
        return url
    }
    
    private func getImageData(info: [UIImagePickerController.InfoKey : Any]) -> Data? {
        var data: Data?
        
        if let image = info[UIImagePickerController.InfoKey.editedImage] as? UIImage {
            data = image.pngData()
        }
        else if let image = info[UIImagePickerController.InfoKey.originalImage] as? UIImage {
            data = image.pngData()
        }
        else if let url = info[UIImagePickerController.InfoKey.imageURL] as? URL {
            data = try? Data(contentsOf: url)
        }
        else if let url = info[UIImagePickerController.InfoKey.mediaURL] as? URL {
            data = try? Data(contentsOf: url)
        }
        else {
            print(" No content could be retrieved from info data")
        }
        return data
    }
    
    private func getOriginalFilename(info: [UIImagePickerController.InfoKey : Any]) -> String? {
        var originalFilename: String?
        
        var photoAsset: PHAsset? = nil
        if #available(iOS 11.0, *) {
            if let asset = info[UIImagePickerController.InfoKey.phAsset] as? PHAsset {
                photoAsset = asset
            }
         } else {
            if let assetURL = info[UIImagePickerController.InfoKey.referenceURL] as? URL {
                let result = PHAsset.fetchAssets(withALAssetURLs: [assetURL], options: nil)
                photoAsset = result.firstObject
            }
        }
        
        if (photoAsset != nil) {
            let assetResources = PHAssetResource.assetResources(for: photoAsset!)
            originalFilename = assetResources.first!.originalFilename
        }
        return originalFilename
    }
    
    private func getFilename(info: [UIImagePickerController.InfoKey : Any], mediaType: String) -> String {
        var filename: String?
        
        var currentFilename: String?
        if let url = getURL(info: info) {
            print("Reading file at: \(String(describing: url.path))")
            currentFilename = url.lastPathComponent
            print(" Current file name: \(String(describing: currentFilename))")
            filename = currentFilename
        }
        
        if let originalFilename = getOriginalFilename(info: info) {
            
            if currentFilename != nil {
                // Restore original file base name, but keep current file extension
                // Reason: sometimes .MOV files instead of image extension
                let basename = originalFilename.prefix(upTo: originalFilename.lastIndex(of: ".")!)
                let ext = currentFilename!.suffix(from: (currentFilename!.lastIndex(of: "."))!)
                filename = String(basename + ext)
                print("Original file name: \(String(describing: originalFilename))")
                print("Modified file name: \(String(describing: filename))")
            }
            else {
                filename = originalFilename
            }
        }
               
        if filename == nil {
            var ext = ".jpeg" // public.image assumed
            if mediaType == "public.movie" {
                ext = ".MOV"
            }
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd_HH-mm-ss"
            let basename = dateFormatter.string(from: Date())
            
            filename = String(basename + ext)
        }
        
        return filename! 
    }
    
    
    //
    // MPMediaPickerControllerDelegate Methods
    //
    
    func mediaPicker(_ mediaPicker: MPMediaPickerController, didPickMediaItems mediaItemCollection: MPMediaItemCollection) {
        mediaPicker.dismiss(animated: true, completion: nil)
        
        print("MPMediaPicker started")
        print(mediaItemCollection)
        for item in mediaItemCollection.items {
            
            print("Title: \(item.title!)")
            print("Media type from item: \(item.mediaType)")
            
            // Get image URL
            if let url = item.assetURL {
                 print("Reading file at: \(String(describing: url.path))")
                               
                 // Determine file name
                 let filename = url.lastPathComponent
                 print("File name: \(String(describing: filename))")
                 
                 let data = try? Data(contentsOf: url)
                 let mediaType = urlToMediaType(url: url)
                 print("Media type from url: \(mediaType)")
                 switch mediaType {
                     case "public.movie":
                         checkedImport(data: data, subdir: "video", filename: filename, listView: videoListView!, listData: videoList)
                     case "public.audio":
                         checkedImport(data: data, subdir: "audio", filename: filename, listView: audioListView!, listData: audioList)
                     default:
                         print(" Unknown media type")
                         let msg = "File name: \(filename)\nMedia type: \(mediaType)"
                         Alert.info(viewController: self, title: "Incompatible media type!", message: msg)
                 }
            }
            else {
                Alert.info(viewController: self, title: "File import failed!", message: "Audio URL could not be established")
            }
        }
    }
    
    func mediaPickerDidCancel(_ mediaPicker: MPMediaPickerController) {
        mediaPicker.dismiss(animated: true, completion: nil)
    }
    
    
    //
    // UIDocumentViewControllerDelegate Methods
    //
    
    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
       controller.dismiss(animated: true, completion: nil)
       
       print("DocumentPicker started")
       print(urls)
       for url in urls {
           
            print("Reading file at: \(String(describing: url.path))")
                          
            // Determine file name
            let filename = url.lastPathComponent
            print("File name: \(String(describing: filename))")
            
            let data = try? Data(contentsOf: url)
            let mediaType = urlToMediaType(url: url)
            print("MediaType: \(mediaType)")
            switch mediaType {
                case "public.image":
                    checkedImport(data: data, subdir: "images", filename: filename, listView: imageListView!, listData: imageList)
                case "public.movie":
                    checkedImport(data: data, subdir: "video", filename: filename, listView: videoListView!, listData: videoList)
                case "public.audio":
                    checkedImport(data: data, subdir: "audio", filename: filename, listView: audioListView!, listData: audioList)
                default:
                    print(" Unknown media type")
                    let msg = "File name: \(filename)\nMedia type: \(mediaType)"
                    Alert.info(viewController: self, title: "Incompatible media type!", message: msg)
            }
        }
    }

    //
    // Helper functions for file pickers
    //
    
    private func urlToMediaType(url: URL) -> String {
        var mediaType = "unknown"
        let rawExt = url.pathExtension as CFString
        if let uti = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, rawExt, nil) {
            let fileUTI = uti.takeRetainedValue()
            
            if UTTypeConformsTo(fileUTI, kUTTypeImage) {
                mediaType = "public.image"
            }
            else if UTTypeConformsTo(fileUTI, kUTTypeVideo) {
                mediaType = "public.movie"
            }
            else if UTTypeConformsTo(fileUTI, kUTTypeAudio) {
                mediaType = "public.audio"
            }
            else {
                mediaType = fileUTI as String
            }
        }
        
        return mediaType
    }
    

    private func checkedImport(data: Data?, subdir: String, filename: String, listView: UITableView, listData: MediaListDataSource) {
        let targetDir = WebDir.appendingPathComponent(subdir)
        let targetFile = targetDir.appendingPathComponent(filename)
        
        print("Checked file import...")
        
        if (data != nil) {
            if (FileManager.default.fileExists(atPath: targetFile.path)){
                print(" File already exists")
                let title = "Do you want to overwrite \(filename)?"
                let message = "A file named \(filename) already exists in this application."
                
                Alert.decision(viewController: self, title: title, message: message) { _ in
                    self.importFile(data: data!, subdir: subdir, filename: filename, listView: listView, listData: listData)
                }
            }
            else {
                print(" File does not yet exists")
                importFile(data: data!, subdir: subdir, filename: filename, listView: listView, listData: listData)
            }
        }
        else {
            Alert.info(viewController: self, title: "File import failed!", message: "Media content could not be read.")
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
            Alert.info(viewController: self, title: "File import failed!", message: "Writing failed.")
        }
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
        let title = "Import Error"
        let message = "Something went wrong while importing the File. Please check if space is low and try again later."
        Alert.info(viewController: self, title: title, message: message)
    }
    
    // Checks on startup
    
    private func checkWebdirectory() {
        if (!FileManager.default.fileExists(atPath: WebDir.path)) {
            Alert.missingResource(viewController: self, resource: WebDir.lastPathComponent)
        }
    }
    
    private func checkPhotoLibraryAuthorization() {
        print("Checking photo library authorization...")
        let authorizationHint = "Please, use the 'Settings' app on your device to grant photo library access permissions to M-TOOL."
        let status = PHPhotoLibrary.authorizationStatus()
        
        print(" Status: \(status.rawValue)")
        switch status {
            case .notDetermined:
                print(" Permission not determined")
                PHPhotoLibrary.requestAuthorization({ status in
                    if status == .authorized {
                        print("  Access to photos now granted")
                    }
                    else {
                        print("  Access to photos still not granted")
                    }
                })
            case .denied:
                print(" Permission denied")
                Alert.info(viewController: self, title: "No photo library access!", message: authorizationHint)
            case .restricted:
                print(" Permission restricted")
                Alert.info(viewController: self, title: "Restricted library access!", message: authorizationHint)
            default:
                print(" Permission for photo library already granted")
        }
    }
    
    private func checkMediaLibraryAuthorization() {
        print("Checking media library authorization...")
        let authorizationHint = "Please, use the 'Settings' app on your device to grant media library access permissions to M-TOOL."
        let status = MPMediaLibrary.authorizationStatus()
        
        print(" Status: \(status.rawValue)")
        switch status {
            case .notDetermined:
                print(" Permission not determined")
                MPMediaLibrary.requestAuthorization({ status in // might not appear due to known iOS bug
                    if status == .authorized {
                        print("  Access to media now granted")
                    }
                    else {
                        print("  Access to media still not granted")
                    }
                })
            case .denied:
            print(" Permission denied")
                Alert.info(viewController: self, title: "No media library access!", message: authorizationHint)
            case .restricted:
            print(" Permission restricted")
                Alert.info(viewController: self, title: "Restricted media library access!", message: authorizationHint)
            default:
                print(" Permission for media library already granted")
        }
    }
    
    private func checkVideoCaptureAuthorization() { // TODO: delete
        print("Checking camera library authorization...")
        let authorizationHint = "Please, use the 'Settings' app on your device to grant video capture access permissions to M-TOOL."
        let status = AVCaptureDevice.authorizationStatus(for: AVMediaType.video)
        
        print(" Status: \(status.rawValue)")
        switch status {
            case .notDetermined:
                print(" Permission not determined")
                MPMediaLibrary.requestAuthorization({ status in // might not appear due to known iOS bug
                    if status == .authorized {
                        print("  Access to capture now granted")
                    }
                    else {
                        print("  Access to capture still not granted")
                    }
                })
            case .denied:
            print(" Permission denied")
                Alert.info(viewController: self, title: "No capture access!", message: authorizationHint)
            case .restricted:
            print(" Permission restricted")
                Alert.info(viewController: self, title: "Restricted capture access!", message: authorizationHint)
            default:
                print(" Permission for capture already granted")
        }
    }
}
