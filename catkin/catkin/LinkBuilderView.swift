//
//  LinkBuilderView.swift
//  catkin
//
//  Created by Tyler Holewinski on 4/7/23.
//

import SwiftUI

extension LinkBuilderView {
    struct Keyword: Identifiable {
        let id: UUID
        var keyword: String
    }
    
    
    @MainActor class ViewModel: ObservableObject {
        
        let authority: AspenAuthority
        let onCreate: (() -> Void)?
        
        init (_ authority: AspenAuthority, _ onCreate: (() -> Void)?) {
            self.authority = authority
            self.onCreate = onCreate
        }
        
        @Published var url: String = ""
        @Published var name: String = ""
        @Published var keywords = [Keyword]()
        
        
        func create() {
            let client: Aspen_Trunk_LinksNIOClient = .init(channel: AspenTrunk.shared.channel)
            
            let _ = try! client.create(.with { req in
                req.authority = Aspen_Trunk_Authority(aspenAuthority: authority)
                req.url = url
                req.keywords = keywords.map({ $0.keyword })
            }).response.wait()
            
            onCreate?()
        }
    }
}


struct LinkBuilderView: View {
    let authority: AspenAuthority
    let onCreate: (() -> Void)?
    
    @StateObject var viewModel: ViewModel;
    
    init(_ authority: AspenAuthority, _ onCreate: (() -> Void)?) {
        self.authority = authority
        self.onCreate = onCreate
        
        self._viewModel = StateObject(wrappedValue: ViewModel(authority, onCreate))
    }
    
    var body: some View {
        VStack {
            
            HStack {
                Text("New Link").font(.title).bold().frame(maxWidth: .infinity, alignment: .leading)
                Spacer()
                Button {
                    viewModel.create()
                } label: {
                    Text("Done")
                }.disabled(viewModel.keywords.isEmpty || viewModel.url.isEmpty)
            }.padding()
            
            Form {
                Section(header: Text("Basic")) {
                    TextField("Name", text: $viewModel.name)
                    TextField("Link To", text: $viewModel.url)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                }
                Section(header: Text("Keywords")) {
                    List {
                        ForEach($viewModel.keywords) { $keyword in
                            TextField("Keyword", text: $keyword.keyword)
                                .autocorrectionDisabled()
                                .textInputAutocapitalization(.never)
                        }.onDelete(perform: delete)
                    }
                    Button {
                        viewModel.keywords.append(.init(id: UUID(), keyword: ""))
                    } label: {
                        HStack {
                            Image(systemName: "plus")
                            Text("Add Keyword")
                        }
                    }
                }
            }.scrollContentBackground(.hidden)
        }
    }
    
    func delete(at offsets: IndexSet) {
        viewModel.keywords.remove(atOffsets: offsets)
    }
}

