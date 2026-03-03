using WeirHere.Maui.Services;

namespace WeirHere.Maui.Views;

public partial class MainPage : ContentPage
{
    public MainPage(MainViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        var services = Handler?.MauiContext?.Services;
        if (services != null)
        {
            var auth = services.GetService<IAuthService>();
            var api = services.GetService<IApiService>();
            if (auth != null && api != null)
            {
                var token = await auth.GetTokenAsync();
                api.SetToken(token);
            }
        }
    }
}
