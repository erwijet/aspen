//
//  AspenAuthority.swift
//  catkin
//
//  Created by Tyler Holewinski on 3/31/23.
//

import Foundation


extension String {
    func jwtDecoded() throws -> [String: Any] {
        
        enum DecodeErrors: Error {
            case badToken
            case other
        }
        
        func base64Decode(_ base64: String) throws -> Data {
            let base64 = base64
                .replacingOccurrences(of: "-", with: "+")
                .replacingOccurrences(of: "_", with: "/")
            let padded = base64.padding(toLength: ((base64.count + 3) / 4) * 4, withPad: "=", startingAt: 0)
            guard let decoded = Data(base64Encoded: padded) else {
                throw DecodeErrors.badToken
            }
            return decoded
        }
        
        func decodeJWTPart(_ value: String) throws -> [String: Any] {
            let bodyData = try base64Decode(value)
            let json = try JSONSerialization.jsonObject(with: bodyData, options: [])
            guard let payload = json as? [String: Any] else {
                throw DecodeErrors.other
            }
            return payload
        }
        
        let segments = self.components(separatedBy: ".")
        return try decodeJWTPart(segments[1])
    }
}

extension Aspen_Trunk_Authority {
    init(aspenAuthority: AspenAuthority) {
        self = Aspen_Trunk_Authority()
        self.jwt = aspenAuthority.jwt
    }
}

struct AspenAuthority {
    let firstName: String
    let lastName: String
    let userId: String
    let username: String
    let jwt: String
    
    init?(jwt: String?) {
        guard let jwt = jwt else { return nil }
        let claims = try! jwt.jwtDecoded()
        
        self.jwt = jwt
        self.firstName = claims["firstname"] as? String ?? ""
        self.lastName = claims["lastname"] as? String ?? ""
        self.userId = claims["sub"] as? String ?? ""
        self.username = claims["usr"] as? String ?? ""
    }
}
