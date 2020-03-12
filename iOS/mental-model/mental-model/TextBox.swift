//
//  TextBox.swift
//  mental-model
//
//  Created by Judith on 12.11.19.
//  Copyright © 2019 lambdaforge UG. All rights reserved.
//

import UIKit

class TextBox:  UITextView {
    private let color: UIColor = ExplanationBox.textColor
    private let textFont: UIFont = UIFont.systemFont(ofSize: ExplanationBox.fontSize)
    private let pad = ExplanationBox.padding
    private let borderWidth = ExplanationBox.borderSize
    
    override init(frame: CGRect, textContainer: NSTextContainer?) {
        super.init(frame: frame, textContainer: textContainer)
        setup()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }
    
    private func insets() -> UIEdgeInsets {
        return UIEdgeInsets(top: pad, left: pad, bottom: pad, right: pad)
    }
    
    private func setup() {
        textContainerInset = insets()
        textColor = color
        
        textAlignment = NSTextAlignment.left
        
        font = textFont
        isEditable = false
        isSelectable = false
        layer.borderColor = ExplanationBox.borderColor.cgColor
        layer.borderWidth = borderWidth
        layer.backgroundColor = BackgroundColor.cgColor
        
    }
    
    
    func adjustSize() {
        let adjustedH = self.contentSize.height + 2*pad
        let adjustedW = self.frame.width
                
        frame = CGRect(x: frame.origin.x, y: frame.origin.y, width: adjustedW, height: adjustedH)

    }


    func adjustSize(nLines: CGFloat) {
        let adjustedH = self.font!.lineHeight * nLines + 2*pad
        let newW = frame.width
        let newH = min(frame.height, adjustedH)
                
        frame = CGRect(x: frame.origin.x, y: frame.origin.y, width: newW, height: newH)

    }

}
