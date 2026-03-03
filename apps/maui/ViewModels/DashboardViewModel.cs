using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using WeirHere.Maui.Services;

namespace WeirHere.Maui.ViewModels;

public partial class DashboardViewModel : ObservableObject
{
    private readonly IAuthService _authService;

    [ObservableProperty]
    private string statusText = "Dashboard. Post a job or manage applications.";

    public DashboardViewModel(IAuthService authService)
    {
        _authService = authService;
    }

    [RelayCommand]
    private async Task LogoutAsync()
    {
        await _authService.LogoutAsync();
        await Shell.Current.GoToAsync("//main");
    }
}
