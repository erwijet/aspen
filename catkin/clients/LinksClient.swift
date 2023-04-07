//
//  LinksClient.swift
//  catkin
//
//  Created by Tyler Holewinski on 4/7/23.
//

import Foundation
import GRPC
import NIO

class LinksClient {
    var linksServiceClient: Aspen_Trunk_LinksNIOClient?
    let port: Int = 9000
    init() {
        let eventLoopGroup = MultiThreadedEventLoopGroup(numberOfThreads: 1)
        
        do {
            let channel = try GRPCChannelPool.with(
                target: .host("api.aspn.app", port: self.port),
                transportSecurity: .plaintext,
                eventLoopGroup: eventLoopGroup
            )
            
            self.linksServiceClient = Aspen_Trunk_LinksNIOClient(channel: channel)
            print("[GRPC] connected to server")
        } catch {
            print("Couldn’t connect to gRPC server")
        }
    }
    
    func getAll(authority: AspenAuthority) -> [Aspen_Trunk_Link] {
        let req: Aspen_Trunk_GetAllLinksRequest = .with {
            $0.authority = Aspen_Trunk_Authority(aspenAuthority: authority)
        }
        
        let res = try! self.linksServiceClient!.get_all(req).response.wait()
        
        return res.results
    }
}

