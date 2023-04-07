//
//  LoginView.swift
//  catkin
//
//  Created by Tyler Holewinski on 3/25/23.
//

import SwiftUI

extension LoginView {
    @MainActor class ViewModel: ObservableObject {
        var onLoginSuccess: ((_ jwt: String) -> Void)
        
        init(_ onLoginSuccess: @escaping ((_ jwt: String) -> Void)) {
            self.onLoginSuccess = onLoginSuccess
        }
        
        @Published var username: String = ""
        @Published var password: String = ""
        @Published var loading = false
        
        func login() {
            let client = AuthClient()
            let resp = client.login(username: username, password: password)
            
            if resp != "" {
                onLoginSuccess(resp)
            }
        }
    }
}

struct LoginView: View {
    @Environment(\.colorScheme)
    private var colorScheme
    
    var onLoginSuccess: ((_ jwt: String) -> Void)
    @StateObject var viewModel: ViewModel
    
    init(onLoginSuccess: @escaping (_ jwt: String) -> Void) {
        self.onLoginSuccess = onLoginSuccess
        self._viewModel =  StateObject(wrappedValue: ViewModel(onLoginSuccess))
    }
    
    var body: some View {
        ZStack {
            VStack {
                ZStack {
                    Rectangle()
                        .foregroundColor(Color(UIColor.systemBackground))
                        .cornerRadius(5.0)
                    
                    Image(colorScheme == .light ? "aspen" : "aspen-white")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .padding(20)
                }
                .frame(height: 150)
                .padding(.bottom, 50)
                
                
                Text("Welcome back!")
                    .font(.title)
                    .fontWeight(.bold)
                    .padding(.bottom, 50)
                
                TextField("Username", text: $viewModel.username)
                    .padding()
                    .textInputAutocapitalization(.never) .autocorrectionDisabled()
                    .background(Color(.systemGray6))
                    .cornerRadius(5.0)
                    .padding(.bottom, 20)
                
                SecureField("Password", text: $viewModel.password)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(5.0)
                    .padding(.bottom, 20)
                
                Button(action: {
                    viewModel.loading.toggle()
                    print("running!")
                    
                    DispatchQueue.main.async {
                        viewModel.login()
                        viewModel.loading.toggle()
                    }
                }) {
                    Text("Log in")
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue.opacity(viewModel.username == "" || viewModel.password == "" || viewModel.loading ? 0.5 : 1.0))
                        .cornerRadius(5.0)
                }.disabled(viewModel.loading || viewModel.username == "" || viewModel.password == "")
            }
            .padding()
            
            if viewModel.loading {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle())
                    .padding()
                    .background(Color(UIColor.lightGray.withAlphaComponent(0.8)))
                    .cornerRadius(10.0)
            }
        }
        
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView() { _ in }
    }
}
