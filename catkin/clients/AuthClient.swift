//
//  AuthClient.swift
//  catkin
//
//  Created by Tyler Holewinski on 3/26/23.
//

import Foundation
import GRPC
import NIO

class AuthClient {
    var authServiceClient: Aspen_Trunk_AuthorizationNIOClient?
    let port: Int = 9000
    init() {
        // build a fountain of EventLoops
        let eventLoopGroup = MultiThreadedEventLoopGroup(numberOfThreads: 1)
        do {
            // open a channel to the gPRC server
            let channel = try GRPCChannelPool.with(
                target: .host("api.aspn.app", port: self.port),
                transportSecurity: .plaintext,
                eventLoopGroup: eventLoopGroup
            )
            // create a Client
            self.authServiceClient = Aspen_Trunk_AuthorizationNIOClient(channel: channel)
            print("[GRPC] connected to server")
        } catch {
            print("Couldn’t connect to gRPC server")
        }
    }
    
    func login(username: String, password: String) -> String {
        let accountCredentials: Aspen_Trunk_LoginRequest = .with {
            $0.username = username
            $0.password = password
        }
        let call = self.authServiceClient!.log_in(accountCredentials)
        let oauthCredentials: Aspen_Trunk_AuthResponse
        
        do {
            oauthCredentials = try call.response.wait()
        } catch {
            print("RPC method ‘login’ failed: \(error)")
            
            // TODO: fail better
            return ""
        }
        
        let oauthToken = oauthCredentials.authority.jwt
        return oauthToken
    }
}
