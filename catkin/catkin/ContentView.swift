//
//  ContentView.swift
//  catkin
//
//  Created by Tyler Holewinski on 3/25/23.
//

import SwiftUI

struct ContentView: View {
    @AppStorage("jwt") var jwt: String?
    @State private var curTabIdx = 0
    
    var body: some View {
        Group {
            if let authority = AspenAuthority.init(from: jwt) {
                TabView(selection: $curTabIdx) {
                    Text("Hello, \(authority.firstName)")
                        .tabItem {
                            Image(systemName: "links")
                            Text("Links")
                        }
                        .tag(0)
                    
                    Text("Settings, \(authority.firstName)")
                        .tabItem {
                            Image(systemName: "1.circle")
                            Text("Settings")
                        }
                        .tag(1)
                }
                .accentColor(Color(UIColor.blue))
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
