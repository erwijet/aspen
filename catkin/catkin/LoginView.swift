//
//  LoginView.swift
//  catkin
//
//  Created by Tyler Holewinski on 3/25/23.
//

import SwiftUI

struct LoginView: View {
    var onLoginSuccess: ((_ jwt: String) -> Void)
    
    @State private var username: String = ""
    @State private var password: String = ""
    @State private var loading = false
    
    @Environment(\.colorScheme)
    private var colorScheme
    
    
    func login() {
        print("running!")
        let client = AuthClient()
        let resp = client.login(username: username, password: password)
        
        if resp != "" {
            onLoginSuccess(resp)
        }
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
                
                TextField("Username", text: $username)
                    .padding()
                    .textInputAutocapitalization(.never) .autocorrectionDisabled()
                    .background(Color(.systemGray6))
                    .cornerRadius(5.0)
                    .padding(.bottom, 20)
                
                SecureField("Password", text: $password)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(5.0)
                    .padding(.bottom, 20)
                
                Button(action: {
                    loading.toggle()
                    print("running!")
                    
                    DispatchQueue.main.async {
                        login()
                        loading.toggle()
                    }
                    
                    //                onLoginSuccess?()
                }) {
                    Text("Log in")
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue.opacity(username == "" || password == "" || loading ? 0.5 : 1.0))
                        .cornerRadius(5.0)
                }.disabled(loading || username == "" || password == "")
            }
            .padding()
            
            if loading {
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
