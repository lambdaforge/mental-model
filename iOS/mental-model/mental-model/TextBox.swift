//
//  TextBox.swift
//  mental-model
//
//  Created by Judith on 12.11.19.
//  Copyright © 2019 lambdaforge. All rights reserved.
//

import UIKit

class TextBox:  UITextView {
    private let color: UIColor = UIColor.gray
    private let textFont: UIFont = UIFont.systemFont(ofSize: 20)
    private let vSpacing: CGFloat = 16.0
    private let hSpacing: CGFloat = 16.0
    private let insets = UIEdgeInsets(top: 16, left: 16, bottom: 16, right: 16)
    private let borderWidth: CGFloat = 2.0
    
    override init(frame: CGRect, textContainer: NSTextContainer?) {
        super.init(frame: frame, textContainer: textContainer)
        setup()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }
    
    private func setup() {
        textContainerInset = insets
        textColor = color
        textAlignment = NSTextAlignment.left
        font = textFont
        isEditable = false
        isSelectable = false
        layer.borderColor = color.cgColor
        layer.borderWidth = borderWidth
    }
    
    func adjustSize() {
        let adjustedH = self.contentSize.height + 2*vSpacing
        //let adjustedW = self.contentSize.width + 2*hSpacing
        let adjustedW = self.contentSize.width
        
        frame = CGRect(x: frame.origin.x, y: frame.origin.y, width: adjustedW, height: adjustedH)
        textContainerInset = insets
    }

}
