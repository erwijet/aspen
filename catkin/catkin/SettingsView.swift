//
//  SettingsView.swift
//  catkin
//
//  Created by Tyler Holewinski on 4/10/23.
//

import SwiftUI

extension SettingsView {
    class ViewModel: ObservableObject {
        let authority: AspenAuthority
        
        @Published var firstName: String
        @Published var lastName: String
        @Published var username: String
        
        init (_ authority: AspenAuthority) {
            self.authority = authority
            self.firstName = self.authority.firstName
            self.lastName = self.authority.lastName
            self.username = self.authority.username
        }
        
        
        @AppStorage("jwt") var jwt: String?
        
        func logout() {
            jwt = nil
        }
    }
}

struct SettingsView: View {
    let authority: AspenAuthority
    @StateObject var viewModel: ViewModel
    
    init(authority: AspenAuthority) {
        self.authority = authority
        _viewModel = StateObject(wrappedValue: ViewModel(authority))
    }
    
    var body: some View {
        Form {
            Section {
                LabeledContent("Username", value: viewModel.username)
            }
            
            Section(header: Text("Personal Details")) {
                LabeledContent {
                    TextField("John", text: $viewModel.firstName)
                } label: {
                    Text("First Name")
                }
                
                LabeledContent {
                    TextField("Doe", text: $viewModel.lastName)
                } label: {
                    Text("Last Name")
                }
            }
            
            Section {
                Button {
                    viewModel.logout()
                } label: {
                    Text("Sign Out")
                }
                Button {
                    
                } label: {
                    Text("Close Account")
                        .tint(.red)
                }
            }
        }
    }
}
