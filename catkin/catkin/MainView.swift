//
//  MainView.swift
//  catkin
//
//  Created by Tyler Holewinski on 3/25/23.
//

import SwiftUI

struct MainView: View {
    @AppStorage("jwt") var jwt: String?
    @State private var curTabIdx = 0
    
    var body: some View {
        if let authority = AspenAuthority(jwt: jwt) {
            TabView(selection: $curTabIdx) {
                HomeView(authority: authority)
                    .tabItem {
                        Image(systemName: "house")
                        Text("Home")
                    }
                    .tag(0)
                
                Text("Settings, \(authority.firstName)")
                    .tabItem {
                        Image(systemName: "person.crop.circle")
                        Text("Settings")
                    }
                    .tag(1)
            }
            .accentColor(Color(UIColor.blue))
        } else {
            LoginView() {
                jwt = $0
            }
        }
    }
}

struct MainView_Preview : PreviewProvider {
    static var previews: some View {
        MainView()
    }
}
