//
//  ContentView.swift
//  catkin
//
//  Created by Tyler Holewinski on 3/25/23.
//

import SwiftUI

struct ContentView: View {
    @AppStorage("jwt") var jwt: String?
    
    var body: some View {
        Group {
            if let authority = AspenAuthority.init(from: jwt) {
                VStack {
                    Text("Hello, \(authority.firstName)")
                }
                .padding()
            } else {
                LoginView() {
                    jwt = $0
                }
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
