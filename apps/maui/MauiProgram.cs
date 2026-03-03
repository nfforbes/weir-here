using WeirHere.Maui.Services;
using WeirHere.Maui.ViewModels;
using WeirHere.Maui.Views;

namespace WeirHere.Maui;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>();

        // Services
        builder.Services.AddSingleton<IApiService, ApiService>();
        builder.Services.AddSingleton<IAuthService, AuthService>();

        // ViewModels
        builder.Services.AddTransient<MainViewModel>();
        builder.Services.AddTransient<LoginViewModel>();
        builder.Services.AddTransient<JobsViewModel>();
        builder.Services.AddTransient<JobDetailViewModel>();
        builder.Services.AddTransient<DashboardViewModel>();

        // Pages
        builder.Services.AddTransient<MainPage>();
        builder.Services.AddTransient<LoginPage>();
        builder.Services.AddTransient<JobsPage>();
        builder.Services.AddTransient<JobDetailPage>();
        builder.Services.AddTransient<DashboardPage>();

        return builder.Build();
    }
}
