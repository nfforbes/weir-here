package com.weirhere.payment

import android.annotation.SuppressLint
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

@SuppressLint("SetJavaScriptEnabled")
@Composable
actual fun PlatformPayPalHostedButton(modifier: Modifier) {
    val containerId = PaymentConstants.PAYPAL_CONTAINER_ID
    val buttonId = PaymentConstants.HOSTED_BUTTON_ID
    val html =
        """
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { margin: 0; padding: 8px; font-family: sans-serif; }
            #$containerId { width: 100%; max-width: 400px; margin: 0 auto; }
          </style>
          <script src="${PaymentConstants.PAYPAL_SDK_URL}"></script>
        </head>
        <body>
          <div id="$containerId"></div>
          <script>
            function renderPayPalButton() {
              if (window.paypal && typeof window.paypal.HostedButtons === 'function') {
                window.paypal.HostedButtons({ hostedButtonId: "$buttonId" })
                  .render("#$containerId");
              }
            }
            if (document.readyState === 'complete') {
              renderPayPalButton();
            } else {
              window.addEventListener('load', renderPayPalButton);
            }
          </script>
        </body>
        </html>
        """.trimIndent()

    AndroidView(
        modifier = modifier,
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                webViewClient =
                    object : WebViewClient() {
                        override fun onPageFinished(view: WebView?, url: String?) {
                            view?.evaluateJavascript(
                                """
                                (function() {
                                  if (window.paypal && typeof window.paypal.HostedButtons === 'function') {
                                    var el = document.getElementById('$containerId');
                                    if (el && el.childElementCount === 0) {
                                      window.paypal.HostedButtons({ hostedButtonId: '$buttonId' })
                                        .render('#$containerId');
                                    }
                                  }
                                })();
                                """.trimIndent(),
                                null,
                            )
                        }
                    }
                loadDataWithBaseURL("https://www.paypal.com", html, "text/html", "UTF-8", null)
            }
        },
    )
}
