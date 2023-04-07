//
//  AspenTrunk.swift
//  catkin
//
//  Created by Tyler Holewinski on 4/7/23.
//

import Foundation
import NIO
import GRPC

class AspenTrunk {
    static let shared = AspenTrunk()
    
    let channel: GRPCChannel
    
    private init() {
        let eventLoopGroup = MultiThreadedEventLoopGroup(numberOfThreads: 1)
        
        channel = try! GRPCChannelPool.with(
            target: .host("api.aspn.app", port: 9000),
            transportSecurity: .plaintext,
            eventLoopGroup: eventLoopGroup
        )
    }
    
    deinit {
        try! channel.close().wait()
    }
}
