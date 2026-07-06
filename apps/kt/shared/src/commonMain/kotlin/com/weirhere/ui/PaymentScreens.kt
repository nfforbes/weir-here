package com.weirhere.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.Card
import androidx.compose.material.Divider
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.material.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.weirhere.payment.PlatformPayPalHostedButton

private val PayPalSectionHeight = 250.dp
private val PayPalFooterHeight = PayPalSectionHeight + 12.dp

private val BannerGradient = Brush.linearGradient(
    colors = listOf(Color(0xFF1565C0), Color(0xFF0D47A1), Color(0xFF1B5E20)),
)

private val PaymentGold = Color(0xFFCFAF5B)
private val PaymentCardBg = Color(0xFF1A1A1A)

private data class BankAccountInfo(
    val currencyLabel: String,
    val accountNumber: String,
)

private val sharedBankDetails = mapOf(
    "Account Holder" to "LuKaria Professional Group Limited",
    "Bank Name" to "Scotiabank",
    "Branch" to "Junction branch",
    "Branch Transit" to "22475",
    "Account Type" to "Savings",
)

private val bankAccounts = listOf(
    BankAccountInfo("Jamaican Dollars (JMD)", "426371"),
    BankAccountInfo("US Dollars (USD)", "426372"),
)

@Composable
fun PaymentUi(
    modifier: Modifier = Modifier,
    initialView: String = "MENU",
) {
    var currentView by remember(initialView) { mutableStateOf(initialView) }

    Column(modifier.fillMaxSize()) {
        when (currentView) {
            "MENU" -> PaymentMenu(
                onPayNow = { currentView = "PAY_NOW" },
                onBankingInfo = { currentView = "BANKING" },
            )
            "PAY_NOW" -> Column(Modifier.weight(1f).fillMaxWidth()) {
                BackNavButton(
                    label = "Back to Payment",
                    onClick = { currentView = "MENU" },
                    modifier = Modifier.padding(bottom = 4.dp),
                )
                PayNowContent(Modifier.weight(1f).fillMaxWidth())
            }
            "BANKING" -> Column(Modifier.weight(1f).fillMaxWidth()) {
                BackNavButton(
                    label = "Back to Payment",
                    onClick = { currentView = "MENU" },
                    modifier = Modifier.padding(bottom = 4.dp),
                )
                BankingInformationContent(Modifier.weight(1f).fillMaxWidth())
            }
        }
    }
}

@Composable
private fun PaymentMenu(onPayNow: () -> Unit, onBankingInfo: () -> Unit) {
    LazyColumn(Modifier.fillMaxSize()) {
        item {
            Text(
                "Payment",
                style = MaterialTheme.typography.h5,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 16.dp),
            )
        }
        items(
            listOf(
                "Pay Now" to onPayNow,
                "Banking Information" to onBankingInfo,
            ),
        ) { (label, onClick) ->
            Card(
                Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable(onClick = onClick),
            ) {
                Text(label, Modifier.padding(16.dp), style = MaterialTheme.typography.subtitle1)
            }
        }
    }
}

@Composable
private fun PayNowContent(modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize()) {
        Column(
            Modifier
                .fillMaxSize()
                .padding(bottom = PayPalFooterHeight)
                .verticalScroll(rememberScrollState()),
        ) {
            Card(
                Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                elevation = 0.dp,
                backgroundColor = Color.White,
            ) {
                Column {
                    Box(
                        Modifier
                            .fillMaxWidth()
                            .height(220.dp)
                            .background(BannerGradient),
                        contentAlignment = Alignment.Center,
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            Box(
                                Modifier
                                    .size(64.dp)
                                    .background(Color.White.copy(alpha = 0.15f), CircleShape),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(text = "\uD83D\uDD12", fontSize = 32.sp)
                            }
                            Text(
                                "Secure Payment Portal",
                                color = Color.White,
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 24.sp,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(horizontal = 16.dp),
                            )
                        }
                    }

                    Column(Modifier.padding(horizontal = 20.dp, vertical = 24.dp)) {
                        Text(
                            "Welcome to the Weir-Here Staffing Solutions secure payment gateway. We are committed to providing a seamless and professional experience, ensuring that managing your account is as efficient as the staffing services we provide.",
                            style = MaterialTheme.typography.body1,
                            color = Color(0xFF616161),
                            lineHeight = 26.sp,
                            modifier = Modifier.padding(bottom = 16.dp),
                        )
                        Text(
                            "This portal allows our clients to settle invoices quickly and securely. Whether you are funding a new staffing contract, paying for specialized caregiving services, or settling recurring administrative fees, your transaction is protected by industry-standard encryption.",
                            style = MaterialTheme.typography.body1,
                            color = Color(0xFF616161),
                            lineHeight = 26.sp,
                            modifier = Modifier.padding(bottom = 24.dp),
                        )

                        Text(
                            "How to Complete Your Payment",
                            style = MaterialTheme.typography.h6,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(bottom = 8.dp),
                        )
                        Divider(Modifier.padding(bottom = 12.dp))

                        PaymentStep(
                            number = "1",
                            title = "Enter Invoice Details",
                            detail = "Please provide your Invoice Number and Client ID to ensure funds are credited to the correct account.",
                        )
                        PaymentStep(
                            number = "2",
                            title = "Verify Amount",
                            detail = "Enter the total amount as specified on your billing statement.",
                        )
                        PaymentStep(
                            number = "3",
                            title = "Choose Payment Method",
                            detail = "We accept all major credit and debit cards, as well as verified electronic bank transfers.",
                        )
                        PaymentStep(
                            number = "4",
                            title = "Confirmation",
                            detail = "Once your transaction is processed, a digital receipt will be sent immediately to your registered email address.",
                        )

                        Spacer(Modifier.height(24.dp))

                        Row(
                            Modifier
                                .fillMaxWidth()
                                .background(Color(0xFFF0F4FF), RoundedCornerShape(8.dp))
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            Text("\u2139", color = MaterialTheme.colors.primary, fontWeight = FontWeight.Bold)
                            Text(
                                "Note: For international transactions or custom billing inquiries, please contact our accounts department directly at accounts@weirheresolutions.com.",
                                style = MaterialTheme.typography.body2,
                                fontStyle = FontStyle.Italic,
                            )
                        }

                        Spacer(Modifier.height(24.dp))

                        Text(
                            "Your trust is our priority. Thank you for choosing Weir-Here Staffing Solutions for your professional staffing needs.",
                            textAlign = TextAlign.Center,
                            color = Color(0xFF616161),
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }
            }
        }

        Column(
            Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth(),
        ) {
            Divider()
            Box(
                Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                contentAlignment = Alignment.Center,
            ) {
                PlatformPayPalHostedButton(
                    modifier =
                        Modifier
                            .widthIn(max = 400.dp)
                            .fillMaxWidth()
                            .height(PayPalSectionHeight),
                )
            }
        }
    }
}

@Composable
private fun BankingInformationContent(modifier: Modifier = Modifier) {
    Column(
        modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        Text(
            "Banking Information",
            style = MaterialTheme.typography.h5,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
        )
        bankAccounts.forEach { account ->
            BankTransferCard(account)
            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun BankTransferCard(account: BankAccountInfo) {
    Card(
        Modifier.fillMaxWidth(),
        backgroundColor = PaymentCardBg,
        elevation = 0.dp,
        shape = RoundedCornerShape(0.dp),
    ) {
        Column(Modifier.padding(20.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Text("\uD83D\uDCB3", fontSize = 24.sp)
                Text(
                    "Payment Details",
                    color = PaymentGold,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                )
            }

            Divider(
                color = PaymentGold,
                modifier = Modifier.padding(vertical = 12.dp),
            )

            Text(
                "Accepted Payment Methods",
                color = PaymentGold,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.subtitle1,
                modifier = Modifier.padding(bottom = 12.dp),
            )

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    "\u2713",
                    color = PaymentGold,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 2.dp),
                )
                Column {
                    Text(
                        "Bank Transfer",
                        color = PaymentGold,
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.subtitle1,
                    )
                    Text(
                        account.currencyLabel,
                        color = PaymentGold.copy(alpha = 0.9f),
                        style = MaterialTheme.typography.body2,
                        modifier = Modifier.padding(bottom = 8.dp),
                    )
                    sharedBankDetails.forEach { (label, value) ->
                        BankDetailLine(label, value)
                    }
                    BankDetailLine("Account Number", account.accountNumber)
                }
            }
        }
    }
}

@Composable
private fun BankDetailLine(label: String, value: String) {
    Text(
        text = "$label: $value",
        color = PaymentGold,
        style = MaterialTheme.typography.body2,
        lineHeight = 22.sp,
    )
}

@Composable
private fun PaymentStep(number: String, title: String, detail: String) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(
            "\u2713",
            color = MaterialTheme.colors.primary,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(top = 2.dp),
        )
        Column {
            Text("$number. $title", fontWeight = FontWeight.SemiBold)
            Text(detail, style = MaterialTheme.typography.body2, color = Color(0xFF757575))
        }
    }
}
