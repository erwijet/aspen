//
//  SettingsView.swift
//  catkin
//
//  Created by Tyler Holewinski on 4/10/23.
//

import SwiftUI

extension SettingsView {
    class ViewModel: ObservableObject {
        @Published var firstName: String = "Tyler"
        @Published var lastName: String = "Holewinski"
        @Published var username: String = "erwijet"
        
        @AppStorage("jwt") var jwt: String?
        
        func logout() {
            jwt = nil
        }
    }
}

struct SettingsView: View {
    let authority: AspenAuthority
    
    @StateObject var viewModel = ViewModel()
    
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
