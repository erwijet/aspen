//
//  HomeView.swift
//  catkin
//
//  Created by Tyler Holewinski on 4/7/23.
//

import SwiftUI

extension HomeView {
    @MainActor class ViewModel: ObservableObject {
        private let authority: AspenAuthority
        
        init (_ authority: AspenAuthority) {
            self.authority = authority
        }
        
        @Published var loading: Bool = false
        @Published var links: [Aspen_Trunk_Link] = []
        
        func refreshLinks() {
            //        let client = AuthClient()
            //        let resp = client.login(username: username, password: password)
            //
            //        if resp != "" {
            //            onLoginSuccess(resp)
            //        }
            
            let client = LinksClient()
            links = client.getAll(authority: authority)
        }
    }
}

struct HomeView: View {
    var authority: AspenAuthority
    @StateObject var viewModel: ViewModel
    
    init(authority: AspenAuthority) {
        self.authority = authority
        self._viewModel = StateObject(wrappedValue: ViewModel(authority))
    }
    
    var body: some View {
        NavigationStack {
            List($viewModel.links.indices, id: \.self) { idx in
                NavigationLink {
                    Text(self.viewModel.links[idx].url)
                } label: {
                    Text(self.viewModel.links[idx].url)
                }
            }
            .listStyle(.plain)
            .navigationTitle("My Links")
            .onAppear {
                if viewModel.links.isEmpty {
                    viewModel.refreshLinks()
                }
            }
        }
    }
}
