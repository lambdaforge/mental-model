//
//  MediaListDataSource.swift
//  mental-model
//
//  Created by Judith on 10.09.19.
//  Copyright © 2019 lambdaforge. All rights reserved.
//
import UIKit

class MediaListDataSource: NSObject, UITableViewDataSource, UITableViewDelegate {
    
    var labels: [String]
    
    init(labels: [String]) {
        self.labels = labels
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return labels.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "label", for: indexPath)
        
        cell.textLabel?.text = labels[indexPath.row]
        
        return cell
    }
    
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    
}
