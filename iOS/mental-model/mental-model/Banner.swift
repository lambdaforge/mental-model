//
//  Banner.swift
//  mental-model
//
//  Created by Judith on 23.01.20.
//  Copyright © 2020 lambdaforge. All rights reserved.
//

import UIKit

class Banner:  UIView {
    
    var context: UIViewController?
    
    @IBAction func goBack(sender: UIButton!) {
        print("Load home view")
        context?.dismiss(animated: true, completion: {});
        context?.navigationController?.popViewController(animated: true);
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    
    init(atTopOf: UIView) {
        let w = Int(atTopOf.frame.size.width)
        let h = Int(BannerHeight)
        let y = Int(BannerTop)
        
        let frame = CGRect(x: 0, y: y, width: w, height: h)
        super.init(frame: frame)
        setup()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }
    
    func setup() {

         let bgView = UIImageView(frame: frame)
         bgView.image = UIImage(named: "bannerBG")
         
         self.addSubview(bgView)
         
         let imageView = UIImageView(frame: frame)
         imageView.contentMode = .scaleAspectFit
         imageView.image = UIImage(named: "bannerImage")
         self.addSubview(imageView)
    }
    
    func addBackButton(target: UIViewController?) {
        self.context = target
        
        let h = self.frame.height / 6.0
        let w = h
        let y = (self.frame.height - h) / 2.0
        let backbutton = UIButton(frame: CGRect(x: Padding*3, y: y, width: w, height: h))
        backbutton.setTitle("<", for: .normal)
        backbutton.titleLabel?.font =  UIFont(name: "Apple SD Gothic Neo", size: 35)
        backbutton.setTitleColor(.white, for: .normal)
        backbutton.addTarget(target, action: #selector(goBack), for: .touchUpInside)
        self.addSubview(backbutton)
    }
    
    func addBackButton(target: UIViewController?, action: Selector) {
        self.context = target
        
        let h = self.frame.height / 6.0
        let w = h
        let y = (self.frame.height - h) / 2.0
        let backbutton = UIButton(frame: CGRect(x: Padding*3, y: y, width: w, height: h))
        backbutton.setTitle("<", for: .normal)
        backbutton.titleLabel?.font =  UIFont(name: "Apple SD Gothic Neo", size: 35)
        backbutton.setTitleColor(.white, for: .normal)
        backbutton.addTarget(target, action: action, for: .touchUpInside)
        self.addSubview(backbutton)
    }
    
}
