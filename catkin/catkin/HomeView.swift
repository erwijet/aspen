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
        private let linksClient: Aspen_Trunk_LinksNIOClient = .init(channel: AspenTrunk.shared.channel)
        
        init (_ authority: AspenAuthority) {
            self.authority = authority
        }
        
        @Published var loading: Bool = false
        @Published var links: [Aspen_Trunk_Link] = []
        
        func refreshLinks() {
            links = try! linksClient.get_all(.with { req in
                req.authority = Aspen_Trunk_Authority(aspenAuthority: authority)
            }).response.wait().results;
        }
    }
}

struct HomeView: View {
    var authority: AspenAuthority
    
    @StateObject private var viewModel: ViewModel
    @State private var isLinkBuilderOpen: Bool = false
    
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
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        isLinkBuilderOpen.toggle()
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .onAppear {
                if viewModel.links.isEmpty {
                    viewModel.refreshLinks()
                }
            }
        }
        
        .sheet(isPresented: $isLinkBuilderOpen) {
            VStack {
                Capsule().fill(Color.secondary).frame(width: 30, height: 3).padding(10)
                LinkBuilderView(authority) {
                    isLinkBuilderOpen.toggle()
                    viewModel.refreshLinks()
                }
            }
        }
    }
}
