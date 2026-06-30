import AuthenticationServices
import CryptoKit
import Foundation
import shared
import UIKit

private let redirectUri = "weirhere://callback"
private let loginNotification = Notification.Name("WeirHereAuthLogin")
private let logoutNotification = Notification.Name("WeirHereAuthLogout")

final class Auth0Manager: NSObject {
    static let shared = Auth0Manager()

    private let presentationContext = WebAuthPresentationContext()
    private var activeSession: ASWebAuthenticationSession?

    func install() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleLoginNotification),
            name: loginNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleLogoutNotification),
            name: logoutNotification,
            object: nil
        )
    }

    @objc private func handleLoginNotification() {
        performLogin()
    }

    @objc private func handleLogoutNotification() {
        performLogout()
    }

    private func performLogin() {
        let domain = IosAuthBridgeKt.iosAuthGetDomain().trimmingCharacters(in: .whitespacesAndNewlines)
        let clientId = IosAuthBridgeKt.iosAuthGetClientId().trimmingCharacters(in: .whitespacesAndNewlines)
        let audience = IosAuthBridgeKt.iosAuthGetAudience().trimmingCharacters(in: .whitespacesAndNewlines)

        guard !domain.isEmpty, !clientId.isEmpty else {
            IosAuthBridgeKt.iosAuthOnLoginFailure(
                message: "Set weir_here.auth0.domain and weir_here.auth0.clientId in apps/kt/local.properties"
            )
            return
        }

        let codeVerifier = Self.generateCodeVerifier()
        let codeChallenge = Self.codeChallenge(for: codeVerifier)
        let state = UUID().uuidString

        var components = URLComponents()
        components.scheme = "https"
        components.host = domain
        components.path = "/authorize"
        var queryItems = [
            URLQueryItem(name: "client_id", value: clientId),
            URLQueryItem(name: "response_type", value: "code"),
            URLQueryItem(name: "scope", value: "openid profile email offline_access"),
            URLQueryItem(name: "redirect_uri", value: redirectUri),
            URLQueryItem(name: "state", value: state),
            URLQueryItem(name: "code_challenge", value: codeChallenge),
            URLQueryItem(name: "code_challenge_method", value: "S256"),
            URLQueryItem(name: "prompt", value: "login"),
        ]
        if !audience.isEmpty {
            queryItems.append(URLQueryItem(name: "audience", value: audience))
        }
        components.queryItems = queryItems

        guard let authURL = components.url else {
            IosAuthBridgeKt.iosAuthOnLoginFailure(message: "Could not build Auth0 authorize URL.")
            return
        }

        let session = ASWebAuthenticationSession(
            url: authURL,
            callbackURLScheme: "weirhere"
        ) { [weak self] callbackURL, error in
            self?.activeSession = nil
            if let error = error as NSError? {
                if error.domain == ASWebAuthenticationSessionErrorDomain,
                   error.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                    IosAuthBridgeKt.iosAuthOnLoginFailure(message: "Login cancelled.")
                    return
                }
                IosAuthBridgeKt.iosAuthOnLoginFailure(message: error.localizedDescription)
                return
            }

            guard let callbackURL else {
                IosAuthBridgeKt.iosAuthOnLoginFailure(message: "No callback URL received from Auth0.")
                return
            }

            guard let callbackComponents = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false),
                  let items = callbackComponents.queryItems else {
                IosAuthBridgeKt.iosAuthOnLoginFailure(message: "Invalid Auth0 callback URL.")
                return
            }

            if let authError = items.first(where: { $0.name == "error" })?.value {
                let description = items.first(where: { $0.name == "error_description" })?.value
                IosAuthBridgeKt.iosAuthOnLoginFailure(
                    message: description ?? authError
                )
                return
            }

            guard let code = items.first(where: { $0.name == "code" })?.value, !code.isEmpty else {
                IosAuthBridgeKt.iosAuthOnLoginFailure(message: "No authorization code in Auth0 callback.")
                return
            }

            let returnedState = items.first(where: { $0.name == "state" })?.value
            guard returnedState == state else {
                IosAuthBridgeKt.iosAuthOnLoginFailure(message: "Auth0 state mismatch.")
                return
            }

            Self.exchangeCode(
                domain: domain,
                clientId: clientId,
                audience: audience,
                code: code,
                codeVerifier: codeVerifier
            )
        }

        session.presentationContextProvider = presentationContext
        session.prefersEphemeralWebBrowserSession = false
        activeSession = session
        if !session.start() {
            IosAuthBridgeKt.iosAuthOnLoginFailure(message: "Could not start Auth0 login session.")
        }
    }

    private func performLogout() {
        let domain = IosAuthBridgeKt.iosAuthGetDomain().trimmingCharacters(in: .whitespacesAndNewlines)
        let clientId = IosAuthBridgeKt.iosAuthGetClientId().trimmingCharacters(in: .whitespacesAndNewlines)

        guard !domain.isEmpty, !clientId.isEmpty else {
            IosAuthBridgeKt.iosAuthOnLogoutComplete()
            return
        }

        var components = URLComponents()
        components.scheme = "https"
        components.host = domain
        components.path = "/v2/logout"
        components.queryItems = [
            URLQueryItem(name: "client_id", value: clientId),
            URLQueryItem(name: "returnTo", value: redirectUri),
        ]

        guard let logoutURL = components.url else {
            IosAuthBridgeKt.iosAuthOnLogoutComplete()
            return
        }

        let session = ASWebAuthenticationSession(
            url: logoutURL,
            callbackURLScheme: "weirhere"
        ) { [weak self] _, _ in
            self?.activeSession = nil
            IosAuthBridgeKt.iosAuthOnLogoutComplete()
        }
        session.presentationContextProvider = presentationContext
        session.prefersEphemeralWebBrowserSession = false
        activeSession = session
        if !session.start() {
            IosAuthBridgeKt.iosAuthOnLogoutComplete()
        }
    }

    private static func exchangeCode(
        domain: String,
        clientId: String,
        audience: String,
        code: String,
        codeVerifier: String
    ) {
        guard let tokenURL = URL(string: "https://\(domain)/oauth/token") else {
            IosAuthBridgeKt.iosAuthOnLoginFailure(message: "Could not build Auth0 token URL.")
            return
        }

        var request = URLRequest(url: tokenURL)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        var bodyItems = [
            URLQueryItem(name: "grant_type", value: "authorization_code"),
            URLQueryItem(name: "client_id", value: clientId),
            URLQueryItem(name: "code", value: code),
            URLQueryItem(name: "redirect_uri", value: redirectUri),
            URLQueryItem(name: "code_verifier", value: codeVerifier),
        ]
        var bodyComponents = URLComponents()
        bodyComponents.queryItems = bodyItems
        request.httpBody = bodyComponents.percentEncodedQuery?.data(using: .utf8)

        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let error {
                    IosAuthBridgeKt.iosAuthOnLoginFailure(message: error.localizedDescription)
                    return
                }

                guard let data else {
                    IosAuthBridgeKt.iosAuthOnLoginFailure(message: "Empty token response from Auth0.")
                    return
                }

                if let http = response as? HTTPURLResponse, http.statusCode >= 400 {
                    let body = String(data: data, encoding: .utf8) ?? "HTTP \(http.statusCode)"
                    IosAuthBridgeKt.iosAuthOnLoginFailure(message: body)
                    return
                }

                do {
                    let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]
                    if let token = pickBearerToken(json: json, audience: audience) {
                        IosAuthBridgeKt.iosAuthOnLoginSuccess(token: token)
                    } else if !audience.isEmpty {
                        IosAuthBridgeKt.iosAuthOnLoginFailure(
                            message: "No access token received. Check Auth0 API audience: \(audience)"
                        )
                    } else {
                        IosAuthBridgeKt.iosAuthOnLoginFailure(
                            message: "No ID token received from Auth0. Ensure openid scope is enabled."
                        )
                    }
                } catch {
                    IosAuthBridgeKt.iosAuthOnLoginFailure(message: error.localizedDescription)
                }
            }
        }.resume()
    }

    private static func pickBearerToken(json: [String: Any], audience: String) -> String? {
        if !audience.isEmpty,
           let access = json["access_token"] as? String,
           !access.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return access.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        if let idToken = json["id_token"] as? String,
           !idToken.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return idToken.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return nil
    }

    private static func generateCodeVerifier() -> String {
        var bytes = [UInt8](repeating: 0, count: 32)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return Data(bytes).base64URLEncodedString()
    }

    private static func codeChallenge(for verifier: String) -> String {
        let digest = SHA256.hash(data: Data(verifier.utf8))
        return Data(digest).base64URLEncodedString()
    }
}

private final class WebAuthPresentationContext: NSObject, ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        let scenes = UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
        for scene in scenes {
            if let window = scene.windows.first(where: { $0.isKeyWindow }) {
                return window
            }
        }
        if let window = scenes.first?.windows.first {
            return window
        }
        return ASPresentationAnchor()
    }
}

private extension Data {
    func base64URLEncodedString() -> String {
        base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}
