//
//  UploadCell.swift
//  
//
//  Created by Judith on 15.08.19.
//

import UIKit

class UploadCell: UITableViewCell
{
    
    var label: UITextField = UITextField()
    var button: UITextField = UIbutton()
    
    //-----------------
    // MARK: VIEW FUNCTIONS
    //-----------------
    
    ///------------
    //Method: Init with Style
    //Purpose:
    //Notes: This will NOT get called unless you call "registerClass, forCellReuseIdentifier" on your tableview
    ///------------
    override init(style: UITableViewCellStyle, reuseIdentifier: String!)
    {
        //First Call Super
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        
        //Initialize Text Field
        label = UITextField(frame: CGRect(x: 119.00, y: 9, width: 216.00, height: 31.00));
        
        //Add TextField to SubView
        self.addSubview(label)
    }
    
    
    ///------------
    //Method: Init with Coder
    //Purpose:
    //Notes: This function is apparently required; gets called by default if you don't call "registerClass, forCellReuseIdentifier" on your tableview
    ///------------
    required init(coder aDecoder: NSCoder)
    {
        //Just Call Super
        super.init(coder: aDecoder)
    }
}
