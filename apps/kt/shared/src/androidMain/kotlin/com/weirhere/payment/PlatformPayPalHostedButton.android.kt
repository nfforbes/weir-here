package com.weirhere.payment

import android.annotation.SuppressLint
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView

@SuppressLint("SetJavaScriptEnabled")
@Composable
actual fun PlatformPayPalHostedButton(modifier: Modifier) {
    val containerId = PaymentConstants.PAYPAL_CONTAINER_ID
    val buttonId = PaymentConstants.HOSTED_BUTTON_ID
    val html = remember(containerId, buttonId) {
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
    }

    val density = LocalDensity.current
    val heightPx = remember(density) { with(density) { 250.dp.roundToPx() } }

    AndroidView(
        modifier = modifier,
        factory = { context ->
            WebView(context).apply {
                layoutParams =
                    ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        heightPx,
                    )
                isNestedScrollingEnabled = false
                overScrollMode = View.OVER_SCROLL_NEVER
                isVerticalScrollBarEnabled = false
                isHorizontalScrollBarEnabled = false
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
        update = { webView ->
            webView.layoutParams =
                ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    heightPx,
                )
        },
    )
}
